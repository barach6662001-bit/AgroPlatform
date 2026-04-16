#!/bin/bash
# Post-create hook for GitHub Codespaces

# Install Claude Code CLI
if ! command -v claude &> /dev/null; then
  npm install -g @anthropic-ai/claude-code
fi

# Configure 21st.dev MCP if secret is available
if [ -n "$CLAUDE_21ST_API_KEY" ]; then
  claude mcp add 21st-dev -- npx -y @21st-dev/cli@latest install claude-code --api-key "$CLAUDE_21ST_API_KEY"
fi

# Install developer MCP servers if API keys are set as Codespace secrets
if [ -n "$DATABASE_URL" ]; then
  claude mcp add postgres -- npx -y @henkey/postgres-mcp-server --connection-string "$DATABASE_URL"
fi

if [ -n "$MAPBOX_ACCESS_TOKEN" ]; then
  claude mcp add mapbox --env MAPBOX_ACCESS_TOKEN="$MAPBOX_ACCESS_TOKEN" -- npx -y @mapbox/mcp-server@latest
fi

# These don't need secrets
claude mcp add playwright -- npx -y @playwright/mcp@latest 2>/dev/null || true
claude mcp add context7 -- npx -y @upstash/context7-mcp@latest 2>/dev/null || true
