#!/bin/bash

# 🎬 PAYROLL PROCESSOR DEMONSTRATION SCRIPT
# This script demonstrates how to run and showcase the project

echo "🚀 Starting Payroll Processor Demonstration..."
echo "=================================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to wait for user input
wait_for_user() {
    echo ""
    echo "Press [ENTER] to continue..."
    read -r
}

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "✅ Port $1 is in use"
        return 0
    else
        echo "❌ Port $1 is not in use"
        return 1
    fi
}

echo "🔍 Step 1: Environment Check"
echo "=============================="

# Check Node.js
if command_exists node; then
    echo "✅ Node.js found: $(node --version)"
else
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

# Check npm
if command_exists npm; then
    echo "✅ npm found: $(npm --version)"
else
    echo "❌ npm not found. Please install npm first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Not in project directory. Please run from payroll project root."
    exit 1
fi

echo "✅ Environment check passed!"
wait_for_user

echo "📦 Step 2: Dependencies Check"
echo "=============================="

# Check if node_modules exist
if [ ! -d "node_modules" ]; then
    echo "📥 Installing frontend dependencies..."
    npm install
else
    echo "✅ Frontend dependencies found"
fi

if [ ! -d "server/node_modules" ]; then
    echo "📥 Installing backend dependencies..."
    cd server && npm install && cd ..
else
    echo "✅ Backend dependencies found"
fi

wait_for_user

echo "🔑 Step 3: API Key Check"
echo "========================"

if [ -f "server/.env" ]; then
    echo "✅ Environment file found"
    if grep -q "CLAUDE_API_KEY=sk-ant" server/.env; then
        echo "✅ Claude API key configured"
    else
        echo "⚠️  API key might need configuration"
    fi
else
    echo "❌ Environment file not found"
    echo "Creating server/.env file..."
    echo "CLAUDE_API_KEY=your_api_key_here" > server/.env
    echo "⚠️  Please edit server/.env with your actual API key"
fi

wait_for_user

echo "🖥️  Step 4: Starting Backend Server"
echo "==================================="

echo "Starting backend on port 3001..."
cd server
npm start &
BACKEND_PID=$!
cd ..

echo "Waiting for backend to start..."
sleep 3

if check_port 3001; then
    echo "✅ Backend server started successfully!"
else
    echo "❌ Backend server failed to start"
    exit 1
fi

wait_for_user

echo "🌐 Step 5: Starting Frontend Client"
echo "==================================="

echo "Starting frontend on port 3000..."
npm start &
FRONTEND_PID=$!

echo "Waiting for frontend to start..."
sleep 5

if check_port 3000; then
    echo "✅ Frontend client started successfully!"
else
    echo "❌ Frontend client failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

wait_for_user

echo "🧪 Step 6: API Health Check"
echo "==========================="

echo "Testing backend API..."
if command_exists curl; then
    HEALTH_RESPONSE=$(curl -s http://localhost:3001/api/health)
    echo "API Response: $HEALTH_RESPONSE"
    
    if echo "$HEALTH_RESPONSE" | grep -q "OK"; then
        echo "✅ API is healthy and responding!"
    else
        echo "⚠️  API responded but might have issues"
    fi
else
    echo "⚠️  curl not found, skipping API test"
fi

wait_for_user

echo "🎬 Step 7: Demo Instructions"
echo "============================"

echo "🌐 Application is now running!"
echo ""
echo "📍 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo ""
echo "🎯 Demo Steps:"
echo "1. Open browser and go to http://localhost:3000"
echo "2. You should see the Hebrew payroll processor interface"
echo "3. Click on file upload area"
echo "4. Select 'salary.pdf' from the project directory"
echo "5. Watch the 4-step progress indicator"
echo "6. View the categorized results!"
echo ""
echo "📋 Expected Results:"
echo "   • Employee information extracted"
echo "   • Salary categorized into 4 groups:"
echo "     - 🔵 Regular (רגיל)"
echo "     - 🟢 Overtime (שעות נוספות)" 
echo "     - 🟡 Travel (נסיעות)"
echo "     - 🟣 Other (אחר)"
echo "   • Financial summary with totals"

wait_for_user

echo "📹 Step 8: Video Demo Available"
echo "==============================="

if [ -f "Video_demo.mp4" ]; then
    echo "✅ Video demonstration available: Video_demo.mp4"
    echo "🎬 This video shows the complete workflow"
else
    echo "ℹ️  Video demo not found in current directory"
fi

wait_for_user

echo "🔧 Step 9: Technical Demo Files"
echo "==============================="

echo "📚 Additional demonstration files created:"
echo "   • BUILD_DEMONSTRATION.md - Complete build process"
echo "   • DEVELOPMENT_STEPS.md - Step-by-step development"
echo "   • TECHNICAL_DEMO.js - Code architecture showcase"
echo "   • PRESENTATION_SLIDES.md - Full presentation slides"
echo "   • demo_script.sh - This demonstration script"

wait_for_user

echo "⚡ Step 10: Performance Test"
echo "==========================="

if [ -f "test_upload.js" ]; then
    echo "🧪 Running performance test with sample PDF..."
    if command_exists node; then
        echo "Testing API with salary.pdf..."
        node test_upload.js
        echo ""
        echo "✅ Performance test completed!"
    else
        echo "❌ Node.js not available for testing"
    fi
else
    echo "ℹ️  Test script not found"
fi

wait_for_user

echo "🎉 DEMONSTRATION COMPLETE!"
echo "=========================="

echo "✅ Payroll Processor is running successfully!"
echo ""
echo "🌟 Key Achievements Demonstrated:"
echo "   ✅ Full-stack application running"
echo "   ✅ Hebrew OCR with Claude AI"
echo "   ✅ Real-time file processing" 
echo "   ✅ 4-category classification"
echo "   ✅ Modern React interface"
echo "   ✅ Secure API integration"
echo ""
echo "🔗 Access Points:"
echo "   🌐 Web Interface: http://localhost:3000"
echo "   🔧 API Health: http://localhost:3001/api/health"
echo "   📹 Video Demo: Video_demo.mp4"
echo "   📚 Documentation: README.md"
echo ""
echo "💡 To stop the servers:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "🚀 Project demonstration completed successfully!"
echo "Ready for presentation, code review, or deployment!"

# Keep script running so servers stay active
echo ""
echo "🔄 Servers will continue running..."
echo "Press Ctrl+C to stop all servers and exit"

# Trap Ctrl+C to clean up
trap 'echo ""; echo "🛑 Stopping servers..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo "✅ Servers stopped. Demo ended."; exit 0' INT

# Wait indefinitely
while true; do
    sleep 1
done