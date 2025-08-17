# GitHub Actions Workflows

This directory contains GitHub Actions workflows that handle automated updates from the API Management Dashboard.

## Overview

Since GitHub Pages cannot directly write to repository files, the dashboard uses repository dispatch events to trigger workflows that create pull requests with the requested changes.

## Workflows

### 1. `deploy.yml`
- **Purpose**: Deploys the dashboard to GitHub Pages
- **Trigger**: Push to main/master branch
- **Action**: Builds and deploys the dashboard to GitHub Pages

### 2. `handle-dashboard-updates.yml`
- **Purpose**: Handles general dashboard updates (add teams, update APIs)
- **Trigger**: Repository dispatch event `dashboard-update`
- **Actions**:
  - `add-team`: Creates new team and API file
  - `update-api`: Adds/updates API in team file
  - `delete-api`: Removes API from team file
  - `update-teams`: Updates teams.json configuration

### 3. `handle-team-rename.yml`
- **Purpose**: Handles team name changes with cascade updates
- **Trigger**: Repository dispatch event `team-rename`
- **Actions**:
  - Renames team in teams.json
  - Renames team API file
  - Updates all API references to new team name
  - Creates comprehensive PR for review

## How It Works

### 1. Dashboard Action
```
User clicks "Save" → Dashboard validates data → Triggers workflow
```

### 2. Workflow Execution
```
Repository dispatch → GitHub Action runs → Updates files → Creates PR
```

### 3. Review Process
```
PR created → Team reviews changes → Merge → Changes applied to main
```

## Repository Dispatch Events

### Dashboard Update
```json
{
  "event_type": "dashboard-update",
  "client_payload": {
    "action": "add-team",
    "data": {
      "teamName": "New Team",
      "cmdbTeamName": "NEW_TEAM",
      "businessGroups": ["Core Platform"]
    }
  }
}
```

### Team Rename
```json
{
  "event_type": "team-rename",
  "client_payload": {
    "oldName": "Old Team Name",
    "newName": "New Team Name"
  }
}
```

## Security & Permissions

### Required Permissions
- `contents: write` - Update repository files
- `pull-requests: write` - Create pull requests

### Access Control
- Workflows run with `GITHUB_TOKEN` secret
- Only repository owners can merge PRs
- All changes are tracked and auditable

## Benefits

### ✅ **Security**
- No direct file writes from web interface
- All changes go through PR review process
- Audit trail for all modifications

### ✅ **Collaboration**
- Team review before changes are applied
- Discussion and feedback on changes
- Rollback capability if needed

### ✅ **Quality Control**
- Automated validation in workflows
- Consistent change patterns
- Error handling and rollback

## Usage

### For Dashboard Users
1. Make changes in the dashboard
2. Click "Save" to trigger workflow
3. Check GitHub for created PR
4. Wait for team review and merge

### For Repository Admins
1. Review automated PRs
2. Check changes for accuracy
3. Merge if changes look correct
4. Monitor workflow execution

### For Developers
1. Workflows are in `.github/workflows/`
2. Modify workflows as needed
3. Test with repository dispatch events
4. Monitor workflow logs for issues

## Troubleshooting

### Common Issues
- **Workflow not triggered**: Check repository dispatch event format
- **Permission errors**: Verify workflow permissions
- **File not found**: Check file paths in workflow
- **PR not created**: Check workflow logs for errors

### Debug Mode
- Check Actions tab for workflow runs
- Review workflow logs for detailed information
- Test with manual repository dispatch events
- Verify file paths and permissions

## Future Enhancements

### Planned Features
- **Automated testing**: Validate changes before PR creation
- **Conflict resolution**: Handle merge conflicts automatically
- **Notification system**: Alert teams of pending changes
- **Approval workflows**: Require specific approvals for certain changes

### Integration Possibilities
- **Slack notifications**: Alert teams of PRs
- **Jira integration**: Link changes to tickets
- **Automated merging**: Auto-merge after approval
- **Change tracking**: Detailed audit logs 