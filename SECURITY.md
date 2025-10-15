# Security Notice

## 🔒 Sensitive Information

This repository contains sensitive deployment information that should **NEVER** be committed to version control.

### 🚫 Excluded from Git

The following files and directories are excluded from version control for security reasons:

- **`aws-deployment/`** - Contains AWS deployment scripts, CloudFormation templates, and IAM configurations
- **`.env*`** - Environment variables and configuration files
- **`*.pem`** - SSH private keys and certificates
- **`*.key`** - Private keys and sensitive files
- **`healthcare.db`** - Database files
- **`__pycache__/`** - Python cache files
- **`.aws/`** - AWS credentials directory

### ⚠️ Important Security Notes

1. **AWS Credentials**: Never commit AWS access keys, secret keys, or session tokens
2. **SSH Keys**: Keep all `.pem` and private key files local only
3. **Database Files**: SQLite database files contain sensitive patient data
4. **Environment Variables**: API keys and configuration secrets should be in `.env` files
5. **Deployment Scripts**: May contain hardcoded IPs, URLs, or sensitive configuration

### 🛡️ Best Practices

1. **Use Environment Variables**: Store sensitive data in environment variables
2. **AWS IAM Roles**: Use IAM roles instead of hardcoded credentials
3. **Secrets Management**: Use AWS Secrets Manager or Parameter Store for sensitive data
4. **Regular Audits**: Regularly review what's being tracked in git
5. **Team Guidelines**: Ensure all team members understand security practices

### 📋 Deployment Security

When deploying to AWS:
- Use IAM roles with minimal required permissions
- Enable CloudTrail for audit logging
- Use VPC security groups to restrict access
- Regularly rotate access keys and certificates
- Monitor for unauthorized access attempts

### 🔍 Checking for Sensitive Data

Before committing, always check:
```bash
# Check for AWS credentials
grep -r "AKIA\|ASIA" . --exclude-dir=.git

# Check for private keys
find . -name "*.pem" -o -name "*.key" -o -name "*.p12"

# Check for environment files
find . -name ".env*" -o -name "credentials"

# Check git status
git status --porcelain
```

### 📞 Security Issues

If you discover sensitive information has been committed:
1. **Immediately** remove the sensitive data
2. **Rotate** any exposed credentials
3. **Review** git history for other sensitive data
4. **Update** security practices
5. **Notify** the team about the incident
