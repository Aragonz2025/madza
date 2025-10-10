#!/bin/bash

# Madza AI Healthcare Platform Startup Script

echo "🚀 Starting Madza AI Healthcare Platform..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed. Please install Python 3.8+ and try again."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed. Please install Node.js and try again."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is required but not installed. Please install npm and try again."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install Python dependencies
echo "📦 Installing Python dependencies..."
cd backend
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    npm install
fi

# Go back to root directory
cd ..

# Create environment file for backend if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "Creating backend environment file..."
    cat > backend/.env << EOF
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
FLASK_ENV=development
FLASK_DEBUG=True
EOF
fi

echo "🎯 Starting backend server..."
cd backend
source venv/bin/activate
python app/main.py &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

echo "🎯 Starting frontend development server..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "🎉 Madza AI Healthcare Platform is starting up!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:5000"
echo "📊 API Health: http://localhost:5000/api/health"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
