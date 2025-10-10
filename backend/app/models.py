from datetime import datetime
from typing import Dict, Any, Optional
import uuid
import json
from .database import db

class Patient(db.Model):
    __tablename__ = 'patients'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    date_of_birth = db.Column(db.String(10), nullable=False)
    ai_analysis = db.Column(db.Text)  # JSON stored as text
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship with claims
    claims = db.relationship('Claim', backref='patient', lazy=True)
    
    def __init__(self, first_name: str, last_name: str, email: str, phone: str, 
                 date_of_birth: str, ai_analysis: Dict[str, Any] = None):
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.phone = phone
        self.date_of_birth = date_of_birth
        self.ai_analysis = json.dumps(ai_analysis) if ai_analysis else None
    
    def get_ai_analysis(self) -> Dict[str, Any]:
        """Get AI analysis as dictionary"""
        if self.ai_analysis:
            return json.loads(self.ai_analysis)
        return {}
    
    def set_ai_analysis(self, analysis: Dict[str, Any]):
        """Set AI analysis from dictionary"""
        self.ai_analysis = json.dumps(analysis) if analysis else None
    
    def to_dict(self):
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'email': self.email,
            'phone': self.phone,
            'date_of_birth': self.date_of_birth,
            'ai_analysis': self.get_ai_analysis(),
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Claim(db.Model):
    __tablename__ = 'claims'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    patient_id = db.Column(db.String(36), db.ForeignKey('patients.id'), nullable=False)
    claim_amount = db.Column(db.Float, nullable=False)
    claim_type = db.Column(db.String(50), nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='pending')
    ai_analysis = db.Column(db.Text)  # JSON stored as text
    approval_required = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    approved_at = db.Column(db.DateTime)
    denied_at = db.Column(db.DateTime)
    denial_reason = db.Column(db.Text)
    ai_suggestions = db.Column(db.Text)  # JSON stored as text
    
    def __init__(self, patient_id: str, claim_amount: float, claim_type: str, 
                 description: str, status: str = 'pending', ai_analysis: Dict[str, Any] = None,
                 approval_required: bool = False):
        self.patient_id = patient_id
        self.claim_amount = claim_amount
        self.claim_type = claim_type
        self.description = description
        self.status = status
        self.ai_analysis = json.dumps(ai_analysis) if ai_analysis else None
        self.approval_required = approval_required
    
    def get_ai_analysis(self) -> Dict[str, Any]:
        """Get AI analysis as dictionary"""
        if self.ai_analysis:
            return json.loads(self.ai_analysis)
        return {}
    
    def set_ai_analysis(self, analysis: Dict[str, Any]):
        """Set AI analysis from dictionary"""
        self.ai_analysis = json.dumps(analysis) if analysis else None
    
    def get_ai_suggestions(self) -> Dict[str, Any]:
        """Get AI suggestions as dictionary"""
        if self.ai_suggestions:
            return json.loads(self.ai_suggestions)
        return {}
    
    def set_ai_suggestions(self, suggestions: Dict[str, Any]):
        """Set AI suggestions from dictionary"""
        self.ai_suggestions = json.dumps(suggestions) if suggestions else None
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'claim_amount': self.claim_amount,
            'claim_type': self.claim_type,
            'description': self.description,
            'status': self.status,
            'ai_analysis': self.get_ai_analysis(),
            'approval_required': self.approval_required,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'approved_at': self.approved_at.isoformat() if self.approved_at else None,
            'denied_at': self.denied_at.isoformat() if self.denied_at else None,
            'denial_reason': self.denial_reason,
            'ai_suggestions': self.get_ai_suggestions()
        }
