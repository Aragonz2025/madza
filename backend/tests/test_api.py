import pytest
import json
import os
import sys
from unittest.mock import patch, MagicMock

# Add the app directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'app'))

from app.main import app
from app.models import Patient, Claim

@pytest.fixture
def client():
    """Create test client"""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@pytest.fixture
def sample_patient_data():
    """Sample patient data for testing"""
    return {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "phone": "+1234567890",
        "dateOfBirth": "1990-01-01"
    }

@pytest.fixture
def sample_claim_data():
    """Sample claim data for testing"""
    return {
        "patient_id": "test-patient-id",
        "claim_amount": 1500.00,
        "claim_type": "major_medical",
        "description": "Emergency room visit for chest pain"
    }

class TestHealthEndpoint:
    def test_health_check(self, client):
        """Test health check endpoint"""
        response = client.get('/api/health')
        assert response.status_code == 200
        
        data = json.loads(response.data)
        assert data['status'] == 'healthy'
        assert 'message' in data

class TestPatientRegistration:
    @patch('app.main.bedrock_service.process_patient_registration')
    def test_register_patient_success(self, mock_bedrock, client, sample_patient_data):
        """Test successful patient registration"""
        # Mock Bedrock service response
        mock_bedrock.return_value = {
            'success': True,
            'ai_analysis': {
                'risk_assessment': 'low',
                'data_quality': 'excellent',
                'recommendations': ['Verify phone number']
            }
        }
        
        response = client.post('/api/patient/register', 
                             data=json.dumps(sample_patient_data),
                             content_type='application/json')
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['success'] is True
        assert 'patient_id' in data
        assert 'ai_analysis' in data
    
    def test_register_patient_missing_fields(self, client):
        """Test patient registration with missing fields"""
        incomplete_data = {
            "firstName": "John",
            "lastName": "Doe"
            # Missing required fields
        }
        
        response = client.post('/api/patient/register',
                             data=json.dumps(incomplete_data),
                             content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'Missing required field' in data['error']
    
    @patch('app.main.bedrock_service.process_patient_registration')
    def test_register_patient_bedrock_failure(self, mock_bedrock, client, sample_patient_data):
        """Test patient registration when Bedrock service fails"""
        mock_bedrock.return_value = {
            'success': False,
            'error': 'Bedrock service unavailable'
        }
        
        response = client.post('/api/patient/register',
                             data=json.dumps(sample_patient_data),
                             content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['error'] == 'Bedrock service unavailable'

class TestPatientRetrieval:
    def test_get_patient_not_found(self, client):
        """Test getting non-existent patient"""
        response = client.get('/api/patient/non-existent-id')
        assert response.status_code == 404
        data = json.loads(response.data)
        assert data['error'] == 'Patient not found'
    
    @patch('app.main.patient_service.get_patient')
    def test_get_patient_success(self, mock_get_patient, client):
        """Test successful patient retrieval"""
        # Create a mock patient
        mock_patient = Patient(
            first_name="John",
            last_name="Doe",
            email="john.doe@example.com",
            phone="+1234567890",
            date_of_birth="1990-01-01"
        )
        mock_get_patient.return_value = mock_patient
        
        response = client.get(f'/api/patient/{mock_patient.id}')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['first_name'] == "John"
        assert data['last_name'] == "Doe"

class TestClaimProcessing:
    @patch('app.main.bedrock_service.process_claim')
    def test_process_claim_success(self, mock_bedrock, client, sample_claim_data):
        """Test successful claim processing"""
        mock_bedrock.return_value = {
            'success': True,
            'status': 'pending_approval',
            'approval_required': True,
            'ai_analysis': {
                'fraud_risk': 'low',
                'coverage_check': 'valid',
                'completeness': 'complete'
            },
            'next_steps': ['Manual approval required']
        }
        
        response = client.post('/api/claims/process',
                             data=json.dumps(sample_claim_data),
                             content_type='application/json')
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['success'] is True
        assert 'claim_id' in data
        assert data['approval_required'] is True
        assert 'ai_analysis' in data
    
    def test_process_claim_missing_fields(self, client):
        """Test claim processing with missing fields"""
        incomplete_data = {
            "patient_id": "test-id"
            # Missing required fields
        }
        
        response = client.post('/api/claims/process',
                             data=json.dumps(incomplete_data),
                             content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
        assert 'Missing required field' in data['error']
    
    @patch('app.main.bedrock_service.process_claim')
    def test_process_claim_bedrock_failure(self, mock_bedrock, client, sample_claim_data):
        """Test claim processing when Bedrock service fails"""
        mock_bedrock.return_value = {
            'success': False,
            'error': 'Claim processing failed'
        }
        
        response = client.post('/api/claims/process',
                             data=json.dumps(sample_claim_data),
                             content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['error'] == 'Claim processing failed'

class TestClaimRetrieval:
    def test_get_claim_not_found(self, client):
        """Test getting non-existent claim"""
        response = client.get('/api/claims/non-existent-id')
        assert response.status_code == 404
        data = json.loads(response.data)
        assert data['error'] == 'Claim not found'
    
    @patch('app.main.claim_service.get_claim')
    def test_get_claim_success(self, mock_get_claim, client):
        """Test successful claim retrieval"""
        # Create a mock claim
        mock_claim = Claim(
            patient_id="test-patient-id",
            claim_amount=1500.00,
            claim_type="major_medical",
            description="Emergency room visit"
        )
        mock_get_claim.return_value = mock_claim
        
        response = client.get(f'/api/claims/{mock_claim.id}')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['patient_id'] == "test-patient-id"
        assert data['claim_amount'] == 1500.00

class TestClaimApproval:
    @patch('app.main.claim_service.approve_claim')
    def test_approve_claim_success(self, mock_approve, client):
        """Test successful claim approval"""
        mock_approve.return_value = {'success': True}
        
        response = client.post('/api/claims/test-claim-id/approve')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True
    
    @patch('app.main.claim_service.approve_claim')
    def test_approve_claim_failure(self, mock_approve, client):
        """Test claim approval failure"""
        mock_approve.return_value = {
            'success': False,
            'error': 'Claim not found'
        }
        
        response = client.post('/api/claims/non-existent-id/approve')
        assert response.status_code == 400
        data = json.loads(response.data)
        assert data['error'] == 'Claim not found'

class TestClaimDenial:
    @patch('app.main.bedrock_service.analyze_claim_denial')
    @patch('app.main.claim_service.deny_claim')
    def test_deny_claim_success(self, mock_deny, mock_analyze, client):
        """Test successful claim denial with AI suggestions"""
        mock_analyze.return_value = {
            'root_cause': 'Insufficient documentation',
            'suggestions': ['Submit medical records', 'Provide additional details']
        }
        mock_deny.return_value = {'success': True}
        
        denial_data = {"reason": "Insufficient documentation"}
        response = client.post('/api/claims/test-claim-id/deny',
                             data=json.dumps(denial_data),
                             content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True
        assert 'ai_suggestions' in data

class TestObservability:
    @patch('app.main.bedrock_service.get_observability_metrics')
    def test_get_metrics_success(self, mock_metrics, client):
        """Test successful metrics retrieval"""
        mock_metrics.return_value = {
            'total_patients': 150,
            'total_claims': 89,
            'ai_accuracy_rate': '94.2%'
        }
        
        response = client.get('/api/observability/metrics')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'total_patients' in data
        assert 'ai_accuracy_rate' in data

class TestAgentStatus:
    @patch('app.main.bedrock_service.get_agent_status')
    def test_get_agent_status_success(self, mock_status, client):
        """Test successful agent status retrieval"""
        mock_status.return_value = {
            'patient_registration_agent': {
                'status': 'active',
                'success_rate': '98.5%'
            }
        }
        
        response = client.get('/api/agents/status')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'patient_registration_agent' in data

class TestErrorHandling:
    def test_invalid_json(self, client):
        """Test handling of invalid JSON"""
        response = client.post('/api/patient/register',
                             data='invalid json',
                             content_type='application/json')
        assert response.status_code == 400
    
    def test_unsupported_method(self, client):
        """Test handling of unsupported HTTP methods"""
        response = client.put('/api/health')
        assert response.status_code == 405

if __name__ == '__main__':
    pytest.main([__file__])
