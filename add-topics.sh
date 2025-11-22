#!/bin/bash
# Bash script to add topics to GitHub repository
# Requires GitHub Personal Access Token with repo scope

# Usage: ./add-topics.sh YOUR_GITHUB_TOKEN

if [ -z "$1" ]; then
    echo "❌ Error: GitHub token required"
    echo "Usage: ./add-topics.sh YOUR_GITHUB_TOKEN"
    echo ""
    echo "To get a token:"
    echo "1. Go to https://github.com/settings/tokens"
    echo "2. Create a new token with 'repo' scope"
    echo "3. Run: ./add-topics.sh your-token-here"
    exit 1
fi

OWNER="LABOSO123"
REPO="Femora"
TOKEN="$1"

TOPICS='["women-health","menstrual-cycle","period-tracker","fertility-tracker","reproductive-health","cycle-tracking","javascript","html5","css3","vanilla-javascript","calendar","symptom-tracker","contraceptive-tracker","menopause","health-app","web-app","pwa","kenya","healthcare"]'

echo "Adding topics to $OWNER/$REPO..."

RESPONSE=$(curl -s -X PUT \
  -H "Accept: application/vnd.github.mercy-preview+json" \
  -H "Authorization: token $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"names\":$TOPICS}" \
  "https://api.github.com/repos/$OWNER/$REPO/topics")

if echo "$RESPONSE" | grep -q "names"; then
    echo "✅ Successfully added topics!"
    echo "$RESPONSE" | grep -o '"names":\[[^]]*\]' | head -1
else
    echo "❌ Error adding topics:"
    echo "$RESPONSE"
fi

