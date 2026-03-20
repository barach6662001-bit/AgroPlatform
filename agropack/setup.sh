#!/bin/bash
# Run this in your Codespaces terminal to copy tasks into the project
echo "Copying CLAUDE.md and tasks to project..."
cp CLAUDE.md /workspaces/AgroPlatform/CLAUDE.md
mkdir -p /workspaces/AgroPlatform/tasks
cp tasks/*.md /workspaces/AgroPlatform/tasks/
echo "Done! Files copied:"
echo "  - /workspaces/AgroPlatform/CLAUDE.md"
echo "  - /workspaces/AgroPlatform/tasks/ ($(ls tasks/*.md | wc -l) task files)"
echo ""
echo "Now open Claude Code and paste this:"
echo ""
echo '  Read CLAUDE.md first. Then execute ALL tasks in tasks/ directory sequentially, starting from task_001.md through task_049.md. For each task: read it, implement the changes, verify build passes, commit and push. Do not skip any task. If build fails — fix it before moving on.'
