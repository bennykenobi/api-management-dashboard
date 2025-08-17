# API Management Dashboard - GitHub Issues Workflow

## Overview

This dashboard uses a **GitHub Issues-based workflow** to automate platform value management in an enterprise environment. Instead of direct API calls, users create GitHub issues that automatically trigger workflows to update configuration files.

## How It Works

### 1. **User Experience**
- Users fill out forms in the dashboard
- Forms automatically create GitHub issues with proper labels
- Issues trigger GitHub Actions workflows automatically
- Workflows update files and create Pull Requests
- PRs go through codeowner review process

### 2. **Security & Compliance**
- **Authentication Required**: Users must be logged into GitHub
- **Write Access Required**: Users must have write access to the repository
- **Code Review Required**: All changes go through Pull Request review
- **Audit Trail**: Complete history of all requests and changes
- **No External Infrastructure**: Pure GitOps solution

### 3. **Workflow Process**
```
User Form → GitHub Issue → Workflow Trigger → File Update → PR Creation → Code Review → Merge
```

## Supported Actions

### **Add Business Group**
- Creates issue with `workflow-trigger` and `add-business-group` labels
- Workflow adds business group to `valid-platform-values.json`
- Creates PR for review

### **Add Team**
- Creates issue with `workflow-trigger` and `add-team` labels
- Workflow adds team to `valid-platform-values.json`
- Creates team API file
- Automatically adds CMDB assignment group if provided
- Creates PR for review

### **Delete Team**
- Creates issue with `workflow-trigger` and `delete-team` labels
- Workflow removes team from `valid-platform-values.json`
- Creates PR for review

## Required Labels

All workflow-triggering issues must have:
- `workflow-trigger` - Required to trigger the workflow
- Action-specific label (e.g., `add-business-group`, `add-team`, `delete-team`)

## File Structure

```
docs/
├── valid-platform-values.json     # Main configuration file
├── *-mule-apis.json              # Team-specific API files
├── index.html                     # Teams & CMDB Management
├── api-management.html            # API Management Dashboard
├── app.js                         # Main application logic
├── api-management.js              # API management logic
└── styles.css                     # Styling
```

## Workflow Files

- `.github/workflows/add-platform-values.yml` - Main workflow for all actions
- `.github/CODEOWNERS` - Defines who must review changes

## User Requirements

### **Authentication**
- Must be logged into GitHub in browser
- Must have write access to the repository
- No personal access tokens or external authentication needed

### **Permissions**
- Repository write access
- Ability to create issues
- Ability to create pull requests (if workflow succeeds)

## Error Handling

### **Authentication Failures**
- 401 errors indicate user is not logged in or lacks permissions
- Dashboard shows clear error messages
- Users are guided to check their GitHub access

### **Workflow Failures**
- Issues remain open if workflows fail
- Error details are logged in workflow runs
- Users can retry by editing the issue

## Benefits

### **Enterprise Security**
- ✅ No exposed tokens or credentials
- ✅ All actions require authentication
- ✅ Complete audit trail
- ✅ Code review required for all changes

### **Automation**
- ✅ No manual workflow triggers
- ✅ No manual file updates
- ✅ No manual PR creation
- ✅ Fully automated processing

### **Compliance**
- ✅ GitOps-based workflow
- ✅ No external infrastructure
- ✅ Repository-based configuration
- ✅ Version-controlled changes

## Troubleshooting

### **Issue Not Created**
- Check if user is logged into GitHub
- Verify user has write access to repository
- Check browser console for error messages

### **Workflow Not Triggered**
- Ensure issue has `workflow-trigger` label
- Check workflow file syntax
- Verify repository permissions

### **PR Not Created**
- Check workflow run logs
- Verify file changes were made
- Check for validation errors

## Support

For issues or questions:
1. Check the GitHub Issues tab
2. Review workflow run logs
3. Contact repository administrators
4. Check CODEOWNERS for review requirements 