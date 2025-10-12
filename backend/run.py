#!/usr/bin/env python3
"""
Entry point for running the Madza AI Healthcare Backend
"""
import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import and run the app
if __name__ == '__main__':
    from app.main import app
    app.run(debug=True, host='0.0.0.0', port=5001)
