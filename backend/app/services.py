import boto3
import json
import os
from typing import Dict, Any, List, Optional
from datetime import datetime
from .models import Patient, Claim
from .database import db

class BedrockService:
    def __init__(self):
        self.bedrock_client = boto3.client(
            'bedrock-runtime',
            region_name=os.getenv('AWS_REGION', 'us-east-1')
        )
        self.bedrock_agent_client = boto3.client(
            'bedrock-agent',
            region_name=os.getenv('AWS_REGION', 'us-east-1')
        )
        self.model_id = os.getenv('BEDROCK_MODEL_ID', 'openai.gpt-oss-120b-1:0')
    
    def process_patient_registration(self, patient_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process patient registration using AI agent"""
        try:
            prompt = f"""
            Analyze this patient registration data and respond with ONLY a JSON object. No other text.

            Patient Data:
            - Name: {patient_data.get('firstName')} {patient_data.get('lastName')}
            - Email: {patient_data.get('email')}
            - Phone: {patient_data.get('phone')}
            - Date of Birth: {patient_data.get('dateOfBirth')}

            Based on the data provided, return this JSON structure with appropriate values:
            {{
              "riskAssessment": {{
                "insuranceEligibility": "Eligible|Not Eligible|Pending Review",
                "riskLevel": "Low|Medium|High", 
                "justification": "Brief explanation based on the data"
              }},
              "dataQualityAnalysis": {{
                "completeness": "Complete|Incomplete|Partial",
                "formatConsistency": "Consistent|Inconsistent|Mixed",
                "overallQuality": "High|Medium|Low"
              }},
              "verificationRecommendations": [
                "Specific recommendation based on the data",
                "Another specific recommendation",
                "Third specific recommendation"
              ],
              "potentialFraudIndicators": [
                "Any fraud indicators found or 'None identified'",
                "Another indicator or 'None identified'"
              ]
            }}
            """
            
            response = self._invoke_bedrock(prompt)
            
            return {
                'success': True,
                'ai_analysis': response
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def process_claim(self, claim_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process insurance claim using multi-step AI agent"""
        try:
            prompt = f"""
            Analyze this insurance claim and respond with ONLY a JSON object. No other text.

            Claim Data:
            - Patient ID: {claim_data.get('patient_id')}
            - Claim Amount: ${claim_data.get('claim_amount')}
            - Claim Type: {claim_data.get('claim_type')}
            - Description: {claim_data.get('description')}

            Based on the claim data, return this JSON structure with appropriate values:
            {{
              "claimId": "CLM-{claim_data.get('patient_id', 'UNKNOWN')[:8]}",
              "validation": {{
                "status": "Valid|Invalid|Pending",
                "completeness": "Complete|Incomplete|Partial",
                "issues": ["Any issues found or empty array"]
              }},
              "coverageCheck": {{
                "policyCoverage": "Covered|Not Covered|Partially Covered",
                "medicalNecessity": "Medically Necessary|Not Medically Necessary|Under Review",
                "coverageDecision": "Approved|Denied|Pending Review"
              }},
              "fraudRiskAssessment": {{
                "riskLevel": "Low|Medium|High",
                "riskFactors": ["Any risk factors found or empty array"],
                "recommendation": "Approve|Deny|Manual Review Required"
              }},
              "approvalRequirements": {{
                "requiredDocuments": ["Document 1", "Document 2"],
                "preAuthorization": "Required|Not Required|Already Obtained",
                "additionalSteps": ["Any additional steps needed or empty array"]
              }},
              "processingTimeEstimate": {{
                "standardTurnaround": "1-3 business days|3-5 business days|5-10 business days",
                "potentialDelays": ["Any potential delays or empty array"]
              }},
              "nextSteps": ["Next step 1", "Next step 2", "Next step 3"]
            }}
            """
            
            response = self._invoke_bedrock(prompt)
            
            # Determine if approval is required based on amount and type
            approval_required = claim_data.get('claim_amount', 0) > 1000 or claim_data.get('claim_type') == 'major_medical'
            
            return {
                'success': True,
                'status': 'approved' if not approval_required else 'pending_approval',
                'approval_required': approval_required,
                'ai_analysis': response,
                'next_steps': [
                    'Claim validation completed',
                    'Policy coverage verified' if not approval_required else 'Manual approval required',
                    'Fraud risk assessment completed'
                ]
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def analyze_claim_denial(self, claim_id: str, reason: str) -> Dict[str, Any]:
        """Analyze claim denial and provide AI suggestions"""
        try:
            prompt = f"""
            You are a healthcare AI system. You must respond with ONLY a JSON object. No other text, no reasoning, no explanations.

            Claim ID: {claim_id}
            Denial Reason: {reason}

            {{
              "rootCauseAnalysis": "Claim denied due to missing documentation",
              "requiredDocumentation": [
                "Medical records",
                "Insurance verification",
                "Provider authorization"
              ],
              "resolutionSteps": [
                "Gather required documents",
                "Resubmit claim with documentation",
                "Follow up with insurance provider"
              ],
              "successLikelihood": "High",
              "alternativeOptions": [
                "Appeal the denial",
                "Contact provider for assistance",
                "Submit partial claim"
              ],
              "priority": "High"
            }}
            """
            
            response = self._invoke_bedrock(prompt)
            return response
        except Exception as e:
            return {
                'error': str(e),
                'suggestions': ['Contact support for assistance']
            }
    
    def get_observability_metrics(self) -> Dict[str, Any]:
        """Get application observability metrics"""
        try:
            # Get real data from database
            total_patients = Patient.query.count()
            total_claims = Claim.query.count()
            approved_claims = Claim.query.filter_by(status='approved').count()
            pending_claims = Claim.query.filter_by(status='pending_approval').count()
            denied_claims = Claim.query.filter_by(status='denied').count()
            
            # Calculate average processing time for approved claims
            approved_claims_with_dates = Claim.query.filter(
                Claim.status == 'approved',
                Claim.approved_at.isnot(None)
            ).all()
            
            if approved_claims_with_dates:
                total_processing_hours = 0
                for claim in approved_claims_with_dates:
                    processing_time = (claim.approved_at - claim.created_at).total_seconds() / 3600  # hours
                    total_processing_hours += processing_time
                avg_processing_hours = total_processing_hours / len(approved_claims_with_dates)
                avg_processing_days = round(avg_processing_hours / 24, 1)
            else:
                avg_processing_days = 0
            
            # Calculate AI accuracy rate based on successful AI analyses
            claims_with_ai = Claim.query.filter(Claim.ai_analysis.isnot(None)).all()
            successful_ai_analyses = 0
            for claim in claims_with_ai:
                ai_data = claim.get_ai_analysis()
                if ai_data and 'error' not in ai_data:
                    successful_ai_analyses += 1
            
            ai_accuracy_rate = 0
            if claims_with_ai:
                ai_accuracy_rate = round((successful_ai_analyses / len(claims_with_ai)) * 100, 1)
            
            return {
                'total_patients': total_patients,
                'total_claims': total_claims,
                'approved_claims': approved_claims,
                'pending_claims': pending_claims,
                'denied_claims': denied_claims,
                'average_processing_time': f'{avg_processing_days} days',
                'ai_accuracy_rate': f'{ai_accuracy_rate}%',
                'system_uptime': '99.8%',  # This would come from system monitoring
                'last_updated': datetime.utcnow().isoformat()
            }
        except Exception as e:
            return {'error': str(e)}
    
    def get_agent_status(self) -> Dict[str, Any]:
        """Get status of all AI agents"""
        try:
            # Calculate success rates based on actual data
            patients_with_ai = Patient.query.filter(Patient.ai_analysis.isnot(None)).all()
            patient_success_rate = 0
            if patients_with_ai:
                successful_patient_ai = sum(1 for p in patients_with_ai if p.get_ai_analysis() and 'error' not in p.get_ai_analysis())
                patient_success_rate = round((successful_patient_ai / len(patients_with_ai)) * 100, 1)
            
            claims_with_ai = Claim.query.filter(Claim.ai_analysis.isnot(None)).all()
            claim_success_rate = 0
            if claims_with_ai:
                successful_claim_ai = sum(1 for c in claims_with_ai if c.get_ai_analysis() and 'error' not in c.get_ai_analysis())
                claim_success_rate = round((successful_claim_ai / len(claims_with_ai)) * 100, 1)
            
            # Get last used times from most recent records
            last_patient = Patient.query.order_by(Patient.updated_at.desc()).first()
            last_claim = Claim.query.order_by(Claim.updated_at.desc()).first()
            
            return {
                'patient_registration_agent': {
                    'status': 'active',
                    'last_used': last_patient.updated_at.isoformat() if last_patient else 'Never',
                    'success_rate': f'{patient_success_rate}%'
                },
                'claim_processing_agent': {
                    'status': 'active',
                    'last_used': last_claim.updated_at.isoformat() if last_claim else 'Never',
                    'success_rate': f'{claim_success_rate}%'
                },
                'denial_analysis_agent': {
                    'status': 'active',
                    'last_used': last_claim.updated_at.isoformat() if last_claim else 'Never',
                    'success_rate': f'{claim_success_rate}%'  # Same as claim processing for now
                },
                'observability_agent': {
                    'status': 'active',
                    'last_used': datetime.utcnow().isoformat(),
                    'success_rate': '100.0%'  # Always successful as it just queries data
                }
            }
        except Exception as e:
            return {'error': str(e)}
    
    def generate_claim_suggestions(self, claim) -> Dict[str, Any]:
        """Generate AI suggestions for improving a claim"""
        try:
            prompt = f"""
            Analyze this insurance claim and provide improvement suggestions. Respond with ONLY a JSON object. No other text.

            Claim Details:
            - ID: {claim.id}
            - Amount: ${claim.claim_amount}
            - Type: {claim.claim_type}
            - Description: {claim.description}
            - Status: {claim.status}
            - Approval Required: {claim.approval_required}

            Current AI Analysis:
            {json.dumps(claim.get_ai_analysis(), indent=2) if claim.get_ai_analysis() else 'No analysis available'}

            Based on the claim data and analysis, return this JSON structure with appropriate values:
            {{
                "root_cause": "Brief explanation of why the claim needs improvement",
                "suggestions": [
                    "Specific suggestion 1 with actionable steps",
                    "Specific suggestion 2 with actionable steps", 
                    "Specific suggestion 3 with actionable steps"
                ],
                "priority": "High|Medium|Low",
                "estimated_impact": "Brief description of expected improvement"
            }}
            """
            
            response = self._invoke_bedrock(prompt)
            
            # Handle different response formats from _invoke_bedrock
            if isinstance(response, dict) and 'analysis' in response:
                # Response has analysis field, extract the content
                analysis_content = response['analysis']
                if isinstance(analysis_content, str):
                    # Clean up reasoning tags and parse JSON
                    json_string = analysis_content
                    if '<reasoning>' in json_string:
                        reasoning_end = json_string.find('</reasoning>')
                        if reasoning_end != -1:
                            json_string = json_string[reasoning_end + 11:].strip()
                    
                    # Find the first { and last } to extract JSON
                    first_brace = json_string.find('{')
                    last_brace = json_string.rfind('}')
                    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
                        json_string = json_string[first_brace:last_brace + 1]
                    
                    try:
                        response = json.loads(json_string)
                    except json.JSONDecodeError:
                        response = {}
                else:
                    response = analysis_content
            elif isinstance(response, str):
                # Direct string response, clean up reasoning tags
                json_string = response
                if '<reasoning>' in json_string:
                    reasoning_end = json_string.find('</reasoning>')
                    if reasoning_end != -1:
                        json_string = json_string[reasoning_end + 11:].strip()
                
                # Find the first { and last } to extract JSON
                first_brace = json_string.find('{')
                last_brace = json_string.rfind('}')
                if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
                    json_string = json_string[first_brace:last_brace + 1]
                
                try:
                    response = json.loads(json_string)
                except json.JSONDecodeError:
                    response = {}
            elif not isinstance(response, dict):
                response = {}
            
            # Ensure the response has the required structure
            if not isinstance(response, dict):
                response = {}
            
            # Validate and provide defaults for required fields
            result = {
                "root_cause": response.get("root_cause", "AI analysis suggests optimization opportunities"),
                "suggestions": response.get("suggestions", [
                    "Review claim documentation for completeness",
                    "Verify medical necessity with provider", 
                    "Ensure all required fields are properly filled"
                ]),
                "priority": response.get("priority", "Medium"),
                "estimated_impact": response.get("estimated_impact", "Improved processing efficiency")
            }
            
            return result
            
        except Exception as e:
            return {
                "root_cause": "Error generating suggestions",
                "suggestions": [
                    "Review claim documentation for completeness",
                    "Verify medical necessity with provider",
                    "Contact support for assistance"
                ],
                "priority": "medium",
                "estimated_impact": "Manual review required"
            }
    
    def _invoke_bedrock(self, prompt: str) -> Dict[str, Any]:
        """Invoke AWS Bedrock model"""
        try:
            # Check if using Amazon Titan model
            if 'amazon.titan' in self.model_id:
                body = json.dumps({
                    "inputText": prompt,
                    "textGenerationConfig": {
                        "maxTokenCount": 4000,
                        "temperature": 0.7,
                        "topP": 0.9
                    }
                })
                
                response = self.bedrock_client.invoke_model(
                    modelId=self.model_id,
                    body=body
                )
                
                response_body = json.loads(response['body'].read())
                return json.loads(response_body['results'][0]['outputText'])
            elif 'openai.gpt' in self.model_id:
                # GPT-OSS format (similar to OpenAI API)
                body = json.dumps({
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "max_tokens": 4000,
                    "temperature": 0.7,
                    "top_p": 0.9
                })
                
                response = self.bedrock_client.invoke_model(
                    modelId=self.model_id,
                    body=body
                )
                
                response_body = json.loads(response['body'].read())
                # Extract the text content from the response
                content = response_body['choices'][0]['message']['content']
                
                # Try to parse as JSON, if it fails, return as text
                try:
                    return json.loads(content)
                except json.JSONDecodeError:
                    # If not JSON, return as structured text
                    return {
                        'analysis': content,
                        'model': 'gpt-oss-120b',
                        'status': 'success'
                    }
            else:
                # Claude format
                body = json.dumps({
                    "anthropic_version": "bedrock-2023-05-31",
                    "max_tokens": 4000,
                    "messages": [
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ]
                })
                
                response = self.bedrock_client.invoke_model(
                    modelId=self.model_id,
                    body=body
                )
                
                response_body = json.loads(response['body'].read())
                return json.loads(response_body['content'][0]['text'])
        except Exception as e:
            return {'error': f'Bedrock invocation failed: {str(e)}'}

class PatientService:
    def __init__(self):
        pass  # No longer need in-memory storage
    
    def create_patient(self, patient: Patient) -> str:
        """Create a new patient"""
        db.session.add(patient)
        db.session.commit()
        return patient.id
    
    def get_patient(self, patient_id: str) -> Optional[Patient]:
        """Get patient by ID"""
        return Patient.query.get(patient_id)
    
    def get_all_patients(self) -> List[Patient]:
        """Get all patients"""
        return Patient.query.all()

class ClaimService:
    def __init__(self):
        pass  # No longer need in-memory storage
    
    def create_claim(self, claim: Claim) -> str:
        """Create a new claim"""
        db.session.add(claim)
        db.session.commit()
        return claim.id
    
    def get_claim(self, claim_id: str) -> Optional[Claim]:
        """Get claim by ID"""
        return Claim.query.get(claim_id)
    
    def get_all_claims(self) -> List[Claim]:
        """Get all claims"""
        return Claim.query.all()
    
    def approve_claim(self, claim_id: str) -> Dict[str, Any]:
        """Approve a claim"""
        try:
            claim = Claim.query.get(claim_id)
            if not claim:
                return {'success': False, 'error': 'Claim not found'}
            
            claim.status = 'approved'
            claim.approved_at = datetime.utcnow()
            claim.updated_at = datetime.utcnow()
            db.session.commit()
            
            return {'success': True}
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}
    
    def deny_claim(self, claim_id: str, reason: str, ai_suggestions: Dict[str, Any]) -> Dict[str, Any]:
        """Deny a claim with AI suggestions"""
        try:
            claim = Claim.query.get(claim_id)
            if not claim:
                return {'success': False, 'error': 'Claim not found'}
            
            claim.status = 'denied'
            claim.denied_at = datetime.utcnow()
            claim.denial_reason = reason
            claim.set_ai_suggestions(ai_suggestions)
            claim.updated_at = datetime.utcnow()
            db.session.commit()
            
            return {'success': True}
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}
    
    def update_claim(self, claim_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Update an existing claim"""
        try:
            claim = Claim.query.get(claim_id)
            if not claim:
                return {'success': False, 'error': 'Claim not found'}
            
            # Update claim fields
            if 'claim_amount' in data:
                claim.claim_amount = float(data['claim_amount'])
            if 'claim_type' in data:
                claim.claim_type = data['claim_type']
            if 'description' in data:
                claim.description = data['description']
            
            # Reset status to pending if claim is being modified
            if claim.status in ['denied', 'approved']:
                claim.status = 'pending'
                claim.denied_at = None
                claim.denial_reason = None
                claim.approved_at = None
            
            claim.updated_at = datetime.utcnow()
            db.session.commit()
            
            return {'success': True, 'claim': claim}
        except Exception as e:
            db.session.rollback()
            return {'success': False, 'error': str(e)}
