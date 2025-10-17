#!/usr/bin/env python3
"""
Package the agent handler and dependencies for AWS Lambda deployment.
"""

import os
import zipfile
import shutil
from pathlib import Path

def create_lambda_package():
    """Create Lambda deployment packages"""
    current_dir = Path.cwd()
    packaging_dir = current_dir / "packaging"
    
    # Create packaging directory
    packaging_dir.mkdir(exist_ok=True)
    
    # Paths for app and dependencies
    app_dir = current_dir / "lambda"
    app_deployment_zip = packaging_dir / "app.zip"
    
    dependencies_dir = packaging_dir / "_dependencies"
    dependencies_deployment_zip = packaging_dir / "dependencies.zip"
    
    print("Creating Lambda packages...")
    
    # Clean up existing packages
    if app_deployment_zip.exists():
        app_deployment_zip.unlink()
    if dependencies_deployment_zip.exists():
        dependencies_deployment_zip.unlink()
    if dependencies_dir.exists():
        shutil.rmtree(dependencies_dir)
    
    # Install dependencies
    print("Installing Python dependencies...")
    dependencies_dir.mkdir(exist_ok=True)
    
    # Install dependencies with correct architecture for Lambda ARM64
    os.system(f"""
        pip install -r requirements.txt \\
            --python-version 3.12 \\
            --platform manylinux2014_aarch64 \\
            --target {dependencies_dir} \\
            --only-binary=:all:
    """)
    
    # Create dependencies zip
    print("Creating dependencies.zip...")
    with zipfile.ZipFile(dependencies_deployment_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(dependencies_dir):
            for file in files:
                file_path = os.path.join(root, file)
                # Lambda layers expect files in python/ directory
                arcname = Path("python") / os.path.relpath(file_path, dependencies_dir)
                zipf.write(file_path, arcname)
    
    # Create app zip
    print("Creating app.zip...")
    with zipfile.ZipFile(app_deployment_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, _, files in os.walk(app_dir):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, app_dir)
                zipf.write(file_path, arcname)
    
    print(f"✓ Created {app_deployment_zip}")
    print(f"✓ Created {dependencies_deployment_zip}")
    print("Lambda packages ready for deployment!")

if __name__ == "__main__":
    create_lambda_package()