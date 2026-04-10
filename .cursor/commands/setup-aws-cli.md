# Setup AWS CLI Command

## Overview
This Claude Code custom command helps developers install and configure the AWS CLI when they don't have it installed but have AWS access credentials. It ensures seamless access to AWS SSM Parameter Store where QuikNation SSH keys are securely stored.

## Command Usage

**In Claude Code, type:**
```
setup-aws-cli
```

Or ask Claude naturally:
```
"Can you run setup-aws-cli?"
"Please help me setup AWS CLI for QuikNation deployment"
```

## Prerequisites

✅ **You already have:**
- Access to the `imaginationeverywhere` GitHub organization
- AWS credentials (Access Key ID and Secret Access Key) with SSM Parameter Store permissions
- SSH keys for QuikNation EC2 instances are already stored in AWS SSM Parameter Store

❌ **You don't have:**
- AWS CLI installed on your local machine

## What This Command Does

When you invoke this command, Claude will:

### 1. **System Detection**
   - Detect your operating system (macOS, Linux, Windows)
   - Check if AWS CLI is already installed
   - Determine the best installation method for your system

### 2. **AWS CLI Installation**
   
   **For macOS:**
   ```bash
   # Check if Homebrew is available (preferred method)
   brew install awscli
   
   # Alternative: Direct download method
   curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
   sudo installer -pkg AWSCLIV2.pkg -target /
   ```
   
   **For Linux (Ubuntu/Debian):**
   ```bash
   # Update package manager
   sudo apt update
   
   # Install AWS CLI v2
   curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
   unzip awscliv2.zip
   sudo ./aws/install
   ```
   
   **For Windows:**
   ```powershell
   # Using PowerShell
   Invoke-WebRequest -Uri "https://awscli.amazonaws.com/AWSCLIV2.msi" -Outfile "AWSCLIV2.msi"
   Start-Process msiexec.exe -Wait -ArgumentList '/I AWSCLIV2.msi /quiet'
   ```

### 3. **Installation Verification**
   ```bash
   # Verify AWS CLI installation
   aws --version
   
   # Expected output: aws-cli/2.x.x Python/3.x.x ...
   ```

### 4. **AWS Credentials Configuration**
   
   **Interactive Configuration:**
   ```bash
   aws configure
   ```
   
   **You'll be prompted for:**
   - **AWS Access Key ID**: `AKIAIOSFODNN7EXAMPLE`
   - **AWS Secret Access Key**: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`
   - **Default region name**: `us-east-2` (QuikNation region)
   - **Default output format**: `json` (recommended)

### 5. **Credentials Verification**
   ```bash
   # Test AWS credentials
   aws sts get-caller-identity
   
   # Expected output:
   # {
   #     "UserId": "AIDACKCEVSQ6C2EXAMPLE",
   #     "Account": "123456789012",
   #     "Arn": "arn:aws:iam::123456789012:user/YourUsername"
   # }
   ```

### 6. **SSM Parameter Store Access Testing**
   ```bash
   # Test access to QuikNation SSH keys in SSM Parameter Store
   aws ssm get-parameter --name "/quiknation-cli/ssh-keys/quiknation-apps" --with-decryption --query "Parameter.Value" --output text | head -1
   
   # Expected output: -----BEGIN RSA PRIVATE KEY-----
   
   # Test QuikInfluence server key access
   aws ssm get-parameter --name "/quiknation-cli/ssh-keys/quikinfluence-server" --with-decryption --query "Parameter.Value" --output text | head -1
   ```

### 7. **Region Configuration Verification**
   ```bash
   # Verify region is set correctly
   aws configure get region
   
   # Should return: us-east-2
   
   # If not set correctly:
   aws configure set region us-east-2
   ```

### 8. **Environment Setup**
   ```bash
   # Add AWS region to shell profile (if needed)
   echo 'export AWS_DEFAULT_REGION=us-east-2' >> ~/.bashrc
   # or for zsh users:
   echo 'export AWS_DEFAULT_REGION=us-east-2' >> ~/.zshrc
   
   # Reload shell configuration
   source ~/.bashrc  # or source ~/.zshrc
   ```

## Success Criteria

After running this command successfully, you should have:

✅ **AWS CLI Installed**: `aws --version` returns version information  
✅ **Credentials Configured**: `aws sts get-caller-identity` returns your AWS account details  
✅ **Correct Region**: `aws configure get region` returns `us-east-2`  
✅ **SSM Access**: Can retrieve QuikNation SSH keys from Parameter Store  
✅ **Environment Ready**: Ready to use QuikNation CLI deployment features  

## Integration with QuikNation Deployment

Once AWS CLI is set up, the QuikNation CLI will automatically:

1. **Retrieve SSH Keys**: Access encrypted SSH keys from AWS SSM Parameter Store
2. **Connect to EC2**: Establish secure connections to QuikNation EC2 instances
3. **Deploy Applications**: Execute deployment commands seamlessly
4. **Manage Ports**: Allocate and manage ports across EC2 instances

## Next Steps

After successful AWS CLI setup:

1. **Run GitHub Setup**: `setup-github-deployment` (if not done already)
2. **Initialize QuikNation**: `setup-quiknation-deployment`
3. **Verify Everything**: `verify-deployment-setup`
4. **Start Developing**: Your deployment infrastructure is ready!

## Troubleshooting

### Common Issues

**1. "aws: command not found" after installation**
```bash
# Check if AWS CLI is in PATH
which aws

# If not found, add to PATH
export PATH="/usr/local/bin/aws:$PATH"

# For permanent fix, add to shell profile
echo 'export PATH="/usr/local/bin/aws:$PATH"' >> ~/.bashrc
```

**2. "Unable to locate credentials"**
```bash
# Re-run configuration
aws configure

# Or check existing configuration
aws configure list

# Verify credentials file
cat ~/.aws/credentials
```

**3. "Access Denied" for SSM Parameter Store**
```bash
# Verify your IAM permissions include:
# - ssm:GetParameter
# - ssm:GetParameters  
# - ssm:DescribeParameters

# Contact your AWS administrator if permissions are missing
```

**4. "Region not set correctly"**
```bash
# Set region explicitly
aws configure set region us-east-2

# Verify
aws configure get region
```

**5. Windows PowerShell execution policy issues**
```powershell
# Set execution policy (run as Administrator)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Platform-Specific Issues

**macOS:**
- **Homebrew not installed**: Install Homebrew first: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
- **Permission denied**: Use `sudo` for system-wide installation

**Linux:**
- **Package manager issues**: Try `sudo apt-get update` first
- **Unzip not installed**: `sudo apt-get install unzip`

**Windows:**
- **PowerShell version**: Ensure you're using PowerShell 5.0 or later
- **Installer blocked**: Right-click installer and select "Run as administrator"

## Security Best Practices

- **Never commit AWS credentials** to version control
- **Use IAM users** with minimal required permissions
- **Rotate access keys** regularly
- **Enable MFA** for AWS account access when possible
- **Keep credentials secure** - stored in `~/.aws/credentials` with proper file permissions

## Advanced Configuration

### Using AWS Profiles
```bash
# Configure multiple profiles for different environments
aws configure --profile development
aws configure --profile production

# Use specific profile
aws sts get-caller-identity --profile development
```

### Environment Variables Alternative
```bash
# Alternative to aws configure (temporary)
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key
export AWS_DEFAULT_REGION=us-east-2
```

## What's Next

With AWS CLI properly configured, you're ready for the complete QuikNation deployment workflow:

1. ✅ **AWS CLI Setup** (completed)
2. ➡️ **GitHub Deployment Setup**: `setup-github-deployment`
3. ➡️ **QuikNation Initialization**: `setup-quiknation-deployment`  
4. ➡️ **Final Verification**: `verify-deployment-setup`
5. ➡️ **Deploy to Production**: Push code to GitHub for automatic deployment

This command ensures that developers can seamlessly access the secure SSH keys stored in AWS SSM Parameter Store, enabling the QuikNation CLI to deploy applications to EC2 instances without manual SSH key management.