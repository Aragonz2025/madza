"""
Madza AI Healthcare Platform - Backend API
Copyright (c) 2025 Madza AI Healthcare Platform. All rights reserved.

PROPRIETARY SOFTWARE - UNAUTHORIZED USE PROHIBITED
This file contains the main Flask API endpoints for the Madza AI Healthcare Platform.
It provides RESTful APIs for patient management, claim processing, and AI integration.

For licensing information, contact: licensing@madzahealthcare.com
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from app.services import BedrockService, PatientService, ClaimService
from app.models import Patient, Claim, EOB
from app.database import init_db, db
from app.pdf_generator import pdf_generator
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize database
init_db(app)

# Initialize services
bedrock_service = BedrockService()
patient_service = PatientService()
claim_service = ClaimService()

# Create database tables
with app.app_context():
    db.create_all()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "Madza AI Backend is running"})

@app.route('/api/patient/register', methods=['POST'])
def register_patient():
    """Register a new patient using AI agent"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'insuranceId', 'insuranceProvider']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Use AI agent for patient registration
        result = bedrock_service.process_patient_registration(data)
        
        if result['success']:
            # Store patient data
            patient = Patient(
                first_name=data['firstName'],
                last_name=data['lastName'],
                email=data['email'],
                phone=data['phone'],
                date_of_birth=data['dateOfBirth'],
                insurance_id=data['insuranceId'],
                insurance_provider=data['insuranceProvider'],
                ai_analysis=result.get('ai_analysis', {})
            )
            
            patient_id = patient_service.create_patient(patient)
            
            return jsonify({
                "success": True,
                "patient_id": patient_id,
                "message": "Patient registered successfully",
                "ai_analysis": result.get('ai_analysis', {})
            }), 201
        else:
            return jsonify({"error": result.get('error', 'Registration failed')}), 400
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/patient/<patient_id>', methods=['GET'])
def get_patient(patient_id):
    """Get patient information"""
    try:
        patient = patient_service.get_patient(patient_id)
        if patient:
            return jsonify(patient.to_dict()), 200
        else:
            return jsonify({"error": "Patient not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/claims/process', methods=['POST'])
def process_claim():
    """Process insurance claim using multi-step AI agent"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['patient_id', 'claim_amount', 'claim_type', 'description']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Use multi-step AI agent for claim processing
        result = bedrock_service.process_claim(data)
        
        if result['success']:
            # Store claim data
            claim = Claim(
                patient_id=data['patient_id'],
                claim_amount=data['claim_amount'],
                claim_type=data['claim_type'],
                description=data['description'],
                status=result.get('status', 'pending'),
                ai_analysis=result.get('ai_analysis', {}),
                approval_required=result.get('approval_required', False)
            )
            
            # Set appropriate timestamps based on status
            from datetime import datetime
            if result.get('status') == 'approved':
                claim.approved_at = datetime.utcnow()
            elif result.get('status') == 'denied':
                claim.denied_at = datetime.utcnow()
                # Extract denial reason from AI analysis if available
                try:
                    ai_analysis = result.get('ai_analysis', {})
                    if isinstance(ai_analysis, dict) and 'analysis' in ai_analysis:
                        analysis_text = ai_analysis['analysis']
                        if '<reasoning>' in analysis_text:
                            reasoning_end = analysis_text.find('</reasoning>')
                            if reasoning_end != -1:
                                json_string = analysis_text[reasoning_end + 11:].strip()
                                first_brace = json_string.find('{')
                                last_brace = json_string.rfind('}')
                                if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
                                    json_string = json_string[first_brace:last_brace + 1]
                                    import json
                                    parsed_analysis = json.loads(json_string)
                                    if isinstance(parsed_analysis, dict):
                                        validation = parsed_analysis.get('validation', {})
                                        issues = validation.get('issues', [])
                                        if issues:
                                            claim.denial_reason = issues[0]
                                        else:
                                            claim.denial_reason = 'AI analysis indicates denial'
                except:
                    claim.denial_reason = 'AI analysis indicates denial'
            
            claim_id = claim_service.create_claim(claim)
            
            # If claim was automatically approved, generate EOB
            if result.get('status') == 'approved':
                try:
                    eob_result = bedrock_service.generate_eob(claim)
                    if eob_result['success']:
                        # Create EOB record
                        eob = EOB(
                            claim_id=claim_id,
                            patient_id=claim.patient_id,
                            eob_amount=eob_result['eob_amount'],
                            status=eob_result['status'],
                            eob_date=eob_result['eob_date'],
                            insurance_company=eob_result['insurance_company'],
                            pdf_url=f"/api/eobs/{claim_id}/pdf",  # Will be updated after EOB is created
                            ai_analysis=eob_result.get('ai_analysis'),
                            denial_reasons=eob_result.get('denial_reasons'),
                            refile_required=eob_result.get('refile_required', False)
                        )
                        
                        db.session.add(eob)
                        db.session.commit()
                        
                        # Update PDF URL with actual EOB ID
                        eob.pdf_url = f"/api/eobs/{eob.id}/pdf"
                        db.session.commit()
                        
                        print(f"EOB generated for automatically approved claim {claim_id}")
                except Exception as eob_error:
                    print(f"Error generating EOB for automatically approved claim {claim_id}: {eob_error}")
            
            return jsonify({
                "success": True,
                "claim_id": claim_id,
                "status": claim.status,
                "approval_required": claim.approval_required,
                "ai_analysis": result.get('ai_analysis', {}),
                "next_steps": result.get('next_steps', []),
                "approved_at": claim.approved_at.isoformat() if claim.approved_at else None,
                "denied_at": claim.denied_at.isoformat() if claim.denied_at else None,
                "denial_reason": claim.denial_reason
            }), 201
        else:
            return jsonify({"error": result.get('error', 'Claim processing failed')}), 400
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/claims/<claim_id>', methods=['GET'])
def get_claim(claim_id):
    """Get claim information"""
    try:
        claim = claim_service.get_claim(claim_id)
        if claim:
            return jsonify(claim.to_dict()), 200
        else:
            return jsonify({"error": "Claim not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/claims/<claim_id>/approve', methods=['POST'])
def approve_claim(claim_id):
    """Approve a claim"""
    try:
        result = claim_service.approve_claim(claim_id)
        if result['success']:
            return jsonify({"success": True, "message": "Claim approved successfully"}), 200
        else:
            return jsonify({"error": result.get('error', 'Approval failed')}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/claims/<claim_id>/deny', methods=['POST'])
def deny_claim(claim_id):
    """Deny a claim with AI suggestions"""
    try:
        data = request.get_json()
        reason = data.get('reason', 'No reason provided')
        
        # Use AI for denial analysis and suggestions
        ai_suggestions = bedrock_service.analyze_claim_denial(claim_id, reason)
        
        result = claim_service.deny_claim(claim_id, reason, ai_suggestions)
        if result['success']:
            return jsonify({
                "success": True,
                "message": "Claim denied",
                "ai_suggestions": ai_suggestions
            }), 200
        else:
            return jsonify({"error": result.get('error', 'Denial failed')}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/observability/metrics', methods=['GET'])
def get_metrics():
    """Get application observability metrics"""
    try:
        metrics = bedrock_service.get_observability_metrics()
        return jsonify(metrics), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/agents/status', methods=['GET'])
def get_agent_status():
    """Get status of all AI agents"""
    try:
        status = bedrock_service.get_agent_status()
        return jsonify(status), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/observability/alerts', methods=['GET'])
def get_system_alerts():
    """Get system alerts and notifications"""
    try:
        alerts = bedrock_service.get_system_alerts()
        return jsonify(alerts), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/claims', methods=['GET'])
def get_all_claims():
    """Get all claims"""
    try:
        claims = claim_service.get_all_claims()
        return jsonify([claim.to_dict() for claim in claims]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/patients', methods=['GET'])
def get_all_patients():
    """Get all patients"""
    try:
        patients = patient_service.get_all_patients()
        return jsonify([patient.to_dict() for patient in patients]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/activity/recent', methods=['GET'])
def get_recent_activity():
    """Get recent activity from patients and claims"""
    try:
        # Get recent patients (last 10)
        recent_patients = Patient.query.order_by(Patient.created_at.desc()).limit(5).all()
        
        # Get recent claims (last 10)
        recent_claims = Claim.query.order_by(Claim.created_at.desc()).limit(5).all()
        
        activities = []
        
        # Add patient activities
        for patient in recent_patients:
            activities.append({
                'id': f"patient_{patient.id}",
                'type': 'patient',
                'description': f'New patient {patient.first_name} {patient.last_name} registered',
                'timestamp': patient.created_at.isoformat(),
                'status': 'success'
            })
        
        # Add claim activities
        for claim in recent_claims:
            if claim.status == 'approved':
                activities.append({
                    'id': f"claim_approve_{claim.id}",
                    'type': 'approval',
                    'description': f'Claim #{claim.id[:8]} approved by AI agent',
                    'timestamp': claim.approved_at.isoformat() if claim.approved_at else claim.created_at.isoformat(),
                    'status': 'success'
                })
            elif claim.status == 'denied':
                activities.append({
                    'id': f"claim_deny_{claim.id}",
                    'type': 'denial',
                    'description': f'Claim #{claim.id[:8]} denied - {claim.denial_reason or "insufficient documentation"}',
                    'timestamp': claim.denied_at.isoformat() if claim.denied_at else claim.created_at.isoformat(),
                    'status': 'warning'
                })
            else:
                activities.append({
                    'id': f"claim_process_{claim.id}",
                    'type': 'claim',
                    'description': f'Claim #{claim.id[:8]} processed successfully',
                    'timestamp': claim.created_at.isoformat(),
                    'status': 'success'
                })
        
        # Sort by timestamp (most recent first) and limit to 10
        activities.sort(key=lambda x: x['timestamp'], reverse=True)
        activities = activities[:10]
        
        # Convert timestamps to relative time
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        
        for activity in activities:
            # Handle both timezone-aware and naive datetimes
            activity_time_str = activity['timestamp']
            if activity_time_str.endswith('Z'):
                activity_time = datetime.fromisoformat(activity_time_str.replace('Z', '+00:00'))
            else:
                # If it's naive, assume it's UTC
                activity_time = datetime.fromisoformat(activity_time_str)
                if activity_time.tzinfo is None:
                    activity_time = activity_time.replace(tzinfo=timezone.utc)
            
            time_diff = now - activity_time
            
            if time_diff.total_seconds() < 60:
                activity['timestamp'] = 'Just now'
            elif time_diff.total_seconds() < 3600:
                minutes = int(time_diff.total_seconds() / 60)
                activity['timestamp'] = f'{minutes} minute{"s" if minutes != 1 else ""} ago'
            elif time_diff.total_seconds() < 86400:
                hours = int(time_diff.total_seconds() / 3600)
                activity['timestamp'] = f'{hours} hour{"s" if hours != 1 else ""} ago'
            else:
                days = int(time_diff.total_seconds() / 86400)
                activity['timestamp'] = f'{days} day{"s" if days != 1 else ""} ago'
        
        return jsonify(activities), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/claims/<claim_id>/suggestions', methods=['POST'])
def generate_claim_suggestions(claim_id):
    """Generate AI suggestions for improving a claim"""
    try:
        # Get the claim
        claim = claim_service.get_claim(claim_id)
        if not claim:
            return jsonify({"error": "Claim not found"}), 404
        
        # Generate AI suggestions using the existing AI analysis
        suggestions = bedrock_service.generate_claim_suggestions(claim)
        
        return jsonify({
            "success": True,
            "suggestions": suggestions
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/claims/<claim_id>', methods=['PUT'])
def update_claim(claim_id):
    """Update an existing claim"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['claim_amount', 'claim_type', 'description']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        # Update the claim
        result = claim_service.update_claim(claim_id, data)
        
        if result['success']:
            response_data = {
                "success": True,
                "message": result.get('message', 'Claim updated successfully'),
                "claim": result['claim'].to_dict()
            }
            
            # Include AI processing information if available
            if 'ai_processed' in result:
                response_data['ai_processed'] = result['ai_processed']
            
            return jsonify(response_data), 200
        else:
            return jsonify({"error": result.get('error', 'Update failed')}), 400
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/chatbot/query', methods=['POST'])
def chatbot_query():
    """Handle chatbot queries using AI"""
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({"error": "Message is required"}), 400
        
        user_message = data['message']
        
        # Use Bedrock service to process the chatbot query
        result = bedrock_service.process_chatbot_query(user_message)
        
        if result['success']:
            return jsonify({
                "response": result['response'],
                "suggestions": result.get('suggestions', []),
                "actionData": result.get('actionData', {})
            }), 200
        else:
            return jsonify({"error": result.get('error', 'Failed to process query')}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# EOB Management Endpoints
@app.route('/api/eobs', methods=['GET'])
def get_eobs():
    """Get all EOBs"""
    try:
        eobs = EOB.query.all()
        return jsonify({"eobs": [eob.to_dict() for eob in eobs]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/eobs/generate', methods=['POST'])
def generate_eob():
    """Generate EOB for a claim using Lambda AI"""
    try:
        data = request.get_json()
        claim_id = data.get('claim_id')
        
        if not claim_id:
            return jsonify({"error": "claim_id is required"}), 400
        
        # Get the claim
        claim = Claim.query.get(claim_id)
        if not claim:
            return jsonify({"error": "Claim not found"}), 404
        
        # Use Lambda AI to generate EOB
        result = bedrock_service.generate_eob(claim)
        
        if result['success']:
            # Create EOB record
            eob = EOB(
                claim_id=claim_id,
                patient_id=claim.patient_id,
                eob_amount=result['eob_amount'],
                status=result['status'],
                eob_date=result['eob_date'],
                insurance_company=result['insurance_company'],
                pdf_url=f"/api/eobs/{claim_id}/pdf",  # Set PDF URL after EOB is created
                ai_analysis=result.get('ai_analysis'),
                denial_reasons=result.get('denial_reasons'),
                refile_required=result.get('refile_required', False)
            )
            
            db.session.add(eob)
            db.session.commit()
            
            # Update PDF URL with actual EOB ID
            eob.pdf_url = f"/api/eobs/{eob.id}/pdf"
            db.session.commit()
            
            return jsonify({"success": True, "eob": eob.to_dict()}), 201
        else:
            return jsonify({"error": result.get('error', 'Failed to generate EOB')}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/eobs/<eob_id>/analyze', methods=['POST'])
def analyze_eob(eob_id):
    """Analyze EOB using AI"""
    try:
        eob = EOB.query.get(eob_id)
        if not eob:
            return jsonify({"error": "EOB not found"}), 404
        
        # Use Lambda AI to analyze EOB
        result = bedrock_service.analyze_eob(eob)
        
        if result['success']:
            eob.set_ai_analysis(result['analysis'])
            eob.set_denial_reasons(result.get('denial_reasons', []))
            eob.refile_required = result.get('refile_required', False)
            
            db.session.commit()
            
            return jsonify({"success": True, "analysis": result['analysis']})
        else:
            return jsonify({"error": result.get('error', 'Failed to analyze EOB')}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/eobs/<eob_id>/refile', methods=['POST'])
def refile_claim(eob_id):
    """Refile claim based on EOB analysis"""
    try:
        data = request.get_json()
        reason = data.get('reason', '')
        
        eob = EOB.query.get(eob_id)
        if not eob:
            return jsonify({"error": "EOB not found"}), 404
        
        # Use Lambda AI to create refile recommendation
        result = bedrock_service.refile_claim(eob, reason)
        
        if result['success']:
            # Update claim status
            claim = Claim.query.get(eob.claim_id)
            if claim:
                claim.status = 'refiled'
                claim.denial_reason = reason
                db.session.commit()
            
            return jsonify({"success": True, "refile_data": result['refile_data']})
        else:
            return jsonify({"error": result.get('error', 'Failed to refile claim')}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/eobs/<eob_id>/pdf', methods=['GET'])
def get_eob_pdf(eob_id):
    """Generate and return PDF for EOB"""
    try:
        eob = EOB.query.get(eob_id)
        if not eob:
            return jsonify({"error": "EOB not found"}), 404
        
        # Generate PDF
        pdf_buffer = pdf_generator.generate_eob_pdf(eob.to_dict())
        
        return send_file(
            pdf_buffer,
            as_attachment=False,
            download_name=f"EOB_{eob_id}.pdf",
            mimetype='application/pdf'
        )
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
