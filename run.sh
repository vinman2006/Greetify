#!/bin/bash

# Configuration
NODE_API_DIR="./backend-node"
JAVA_UI_DIR="./frontend-java"

# Kill background processes on exit
trap "kill 0" EXIT

echo "🧹 Cleaning up existing processes on ports 4000 and 8080..."
fuser -k 4000/tcp &> /dev/null
fuser -k 8080/tcp &> /dev/null

echo "🚀 Starting Greetify Services..."

# 1. Start Node API in background
echo "📦 Starting Node API..."
cd $NODE_API_DIR
npm install
npm run dev &
API_PID=$!
cd ..

# 2. Start Java UI in background
echo "☕ Starting Java UI..."
cd $JAVA_UI_DIR
if command -v mvn &> /dev/null
then
    mvn clean package -DskipTests
else
    echo "⚠️  Maven (mvn) not found in PATH. Attempting to run existing JAR if present..."
fi

if [ -f "target/frontend-java-1.0.0-PROD.jar" ]; then
    java -jar target/frontend-java-1.0.0-PROD.jar &
    UI_PID=$!
else
    echo "❌ Error: Could not find Java JAR file. Please run 'mvn clean package' manually in frontend-java."
fi
cd ..

echo "✅ Both services are starting!"
echo "📍 Node API: http://localhost:4000"
echo "📍 Java UI: http://localhost:8080"
echo "Press Ctrl+C to stop all services."

# Wait for background processes
wait
