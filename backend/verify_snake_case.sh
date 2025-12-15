#!/bin/bash

BASE_URL="http://localhost:3000/api/survey"

echo "Testing POST / (Save Response - Snake Case Payload)..."
curl -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{"team_name":"헬로","team_members":["헬로1","헬로2"],"building":"본관","floor":"1층","gender":"남자 화장실","dream_school":"accessible","can_use_restroom":"yes","why_not_use":[],"door_type":"앞으로 여는 문","width":"150","height":"170","photos":[null,null,null],"handrail_types":["horizontal-flexible"],"has_sink":"no","can_wash":"yes","sink_height":"good"}'

echo -e "\n\nChecking if '헬로' was saved..."
curl -s "$BASE_URL" | grep "헬로" && echo "Success: Found '헬로'" || echo "Failure: Did not find '헬로'"
