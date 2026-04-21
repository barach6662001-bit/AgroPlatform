#!/usr/bin/env bash
# Одноразовый скрипт для удаления устаревших слитых веток.
# Использование: ./scripts/cleanup-stale-branches.sh
# Требования: аутентифицированный gh CLI

set -euo pipefail

REPO="barach6662001-bit/AgroPlatform"

STALE_BRANCHES=(
  "copilot/add-dockerfile-and-compose"
  "copilot/add-i18n-support-uk-en"
  "copilot/add-role-based-authorization"
  "copilot/choredeps-aggregate-2026-03-06"
  "copilot/create-readme-file"
  "copilot/fix-frontend-translation-errors"
  "copilot/implement-issue-transfer-inventory-handlers"
  "copilot/replace-placeholder-tests-with-real-handler-tests"
  "copilot/update-readme-file"
  "copilot/update-vulnerability-scan-step"
)

echo "🧹 Cleaning up ${#STALE_BRANCHES[@]} stale branches in $REPO..."

for BRANCH in "${STALE_BRANCHES[@]}"; do
  echo -n "  Deleting $BRANCH... "
  if gh api -X DELETE "/repos/$REPO/git/refs/heads/$BRANCH" 2>/dev/null; then
    echo "✅"
  else
    echo "⚠️  (already deleted or error)"
  fi
done

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "💡 Совет: включите 'Automatically delete head branches' в:"
echo "   Settings → General → Pull Requests → ✅ Automatically delete head branches"
