All coding-agent tasks in this repository must end with:
- creating a new branch
- committing the changes
- pushing the branch
- opening a pull request to main

A task is not complete without an opened pull request.

After opening the pull request:
- wait for CI checks to complete
- if all required checks pass
- merge the pull request automatically using squash merge

Do not stop after only editing files in the session.

If automatic PR creation is not possible, clearly return:
- branch name
- commit SHA
- exact reason PR was not opened
