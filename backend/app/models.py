"""
Madza AI Healthcare Platform - Data Models
Copyright (c) 2025 Madza AI Healthcare Platform. All rights reserved.

PROPRIETARY SOFTWARE - UNAUTHORIZED USE PROHIBITED
This file contains SQLAlchemy models for the healthcare platform including
Patient, Claim, EOB, and Activity models with their relationships and methods.

For licensing information, contact: arpanchowdhury2025@gmail.com
"""

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
    insurance_id = db.Column(db.String(100), nullable=False)
    insurance_provider = db.Column(db.String(100), nullable=False)
    ai_analysis = db.Column(db.Text)  # JSON stored as text
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship with claims
    claims = db.relationship('Claim', backref='patient', lazy=True)
    
    def __init__(self, first_name: str, last_name: str, email: str, phone: str, 
                 date_of_birth: str, insurance_id: str, insurance_provider: str, 
                 ai_analysis: Dict[str, Any] = None):
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.phone = phone
        self.date_of_birth = date_of_birth
        self.insurance_id = insurance_id
        self.insurance_provider = insurance_provider
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
            'insurance_id': self.insurance_id,
            'insurance_provider': self.insurance_provider,
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

class EOB(db.Model):
    __tablename__ = 'eobs'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    claim_id = db.Column(db.String(36), db.ForeignKey('claims.id'), nullable=False)
    patient_id = db.Column(db.String(36), db.ForeignKey('patients.id'), nullable=False)
    eob_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), nullable=False)  # approved, denied, partial, pending
    eob_date = db.Column(db.Date, nullable=False)
    insurance_company = db.Column(db.String(100), nullable=False)
    pdf_url = db.Column(db.String(500), nullable=True)
    ai_analysis = db.Column(db.Text)  # JSON stored as text
    denial_reasons = db.Column(db.Text)  # JSON stored as text
    refile_required = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    claim = db.relationship('Claim', backref=db.backref('eobs', lazy=True))
    patient = db.relationship('Patient', backref=db.backref('eobs', lazy=True))
    
    def __init__(self, claim_id: str, patient_id: str, eob_amount: float, status: str,
                 eob_date: str, insurance_company: str, pdf_url: str = None,
                 ai_analysis: Dict[str, Any] = None, denial_reasons: list = None,
                 refile_required: bool = False):
        self.claim_id = claim_id
        self.patient_id = patient_id
        self.eob_amount = eob_amount
        self.status = status
        self.eob_date = datetime.strptime(eob_date, '%Y-%m-%d').date()
        self.insurance_company = insurance_company
        self.pdf_url = pdf_url
        self.ai_analysis = json.dumps(ai_analysis) if ai_analysis else None
        self.denial_reasons = json.dumps(denial_reasons) if denial_reasons else None
        self.refile_required = refile_required
    
    def get_ai_analysis(self) -> Dict[str, Any]:
        """Get AI analysis as dictionary"""
        if self.ai_analysis:
            return json.loads(self.ai_analysis)
        return {}
    
    def set_ai_analysis(self, analysis: Dict[str, Any]):
        """Set AI analysis from dictionary"""
        self.ai_analysis = json.dumps(analysis) if analysis else None
    
    def get_denial_reasons(self) -> list:
        """Get denial reasons as list"""
        if self.denial_reasons:
            return json.loads(self.denial_reasons)
        return []
    
    def set_denial_reasons(self, reasons: list):
        """Set denial reasons from list"""
        self.denial_reasons = json.dumps(reasons) if reasons else None
    
    def to_dict(self):
        return {
            'id': self.id,
            'claim_id': self.claim_id,
            'patient_id': self.patient_id,
            'patient_name': self.patient.first_name + ' ' + self.patient.last_name if self.patient else None,
            'claim_amount': self.claim.claim_amount if self.claim else 0,
            'eob_amount': self.eob_amount,
            'status': self.status,
            'eob_date': self.eob_date.isoformat(),
            'insurance_company': self.insurance_company,
            'pdf_url': self.pdf_url,
            'ai_analysis': self.get_ai_analysis(),
            'denial_reasons': self.get_denial_reasons(),
            'refile_required': self.refile_required,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
