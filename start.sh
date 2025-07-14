#!/bin/bash

echo "🚀 Starting Payroll Processing System..."

# Start backend server
echo "Starting backend server on port 3001..."
cd server && npm start &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend server  
echo "Starting frontend server on port 3000..."
cd ..
npm start &
FRONTEND_PID=$!

echo "✅ System started!"
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:3001"
echo ""
echo "To stop servers:"
echo "kill $BACKEND_PID $FRONTEND_PID"

# Keep script running
wait