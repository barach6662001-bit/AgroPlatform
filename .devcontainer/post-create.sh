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
