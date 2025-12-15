#!/bin/bash

BASE_URL="http://localhost:3000/api/survey"

echo "1. Testing POST / (Save Response)..."
curl -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "teamName": "Test Team",
    "teamMembers": ["Alice", "Bob"],
    "building": "Main",
    "floor": "1",
    "gender": "Universal",
    "dreamSchool": "Inclusive School"
  }'
echo -e "\n"

echo "2. Testing GET / (Fetch Responses)..."
curl -s "$BASE_URL" | grep "Test Team" && echo "Success: Found Test Team" || echo "Failure: Did not find Test Team"
echo -e "\n"

# Create a dummy image file
echo "fake image content" > test_image.png

echo "3. Testing POST /upload (Upload Photo)..."
# Note: This might fail if the bucket 'survey-photos' doesn't exist or permissions are strict, 
# but it tests the endpoint logic.
curl -X POST "$BASE_URL/upload" \
  -F "file=@test_image.png"
echo -e "\n"

rm test_image.png
