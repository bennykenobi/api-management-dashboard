# Data Directory Documentation

This directory contains the core data files for the API Management system. These files are managed by GitHub Actions workflows and accessed by the dashboard.

## 📁 **File Structure**

### **Core Configuration Files**
- **`valid-platform-values.json`** - Central configuration for teams, CMDB groups, and business groups
- **`schemas.json`** - JSON Schema definitions for data validation

### **Team-Specific API Files**
- **`{team-name}-mule-apis.json`** - Individual team API registries
- **Naming Convention**: Team names converted to lowercase with spaces replaced by hyphens
  - Example: "Platform Team" → `platform-team-mule-apis.json`

## 🔧 **Data File Details**

### **`valid-platform-values.json`**
```json
{
  "validTeamNames": ["Platform Team", "Integration Team"],
  "validCmdbTeamNames": ["PLATFORM_TEAM", "INTEGRATION_TEAM"],
  "validBusinessGroups": ["Core Platform", "Customer Experience"]
}
```

### **`{team-name}-mule-apis.json`**
```json
{
  "teamName": "Platform Team",
  "apis": [
    {
      "apiName": "User Management API",
      "assetId": "user-mgmt-api-v1",
      "teamName": "Platform Team",
      "apiOwner": "John Doe",
      "apiOwnerEmail": "john.doe@company.com",
      "munitExempt": false,
      "customCoverage": null,
      "businessGroups": ["Core Platform"],
      "lastUpdated": "2024-01-15T10:30:00Z"
    }
  ]
}
```

## ⚙️ **GitHub Actions Workflows**

### **Data Management Workflows**
- **`add-platform-values.yml`** - Adds new values to platform configuration
- **`delete-platform-values.yml`** - Removes values from platform configuration
- **`handle-dashboard-updates.yml`** - General dashboard update operations
- **`handle-team-rename.yml`** - Cascades team name changes across all files

### **Workflow Triggers**
All workflows are triggered via `repository_dispatch` events from the dashboard:
```javascript
// Example payload for adding a team
{
  "event_type": "add-platform-values",
  "client_payload": {
    "arrayType": "teamNames",
    "value": "New Team Name"
  }
}
```

## 🔄 **Data Flow**

1. **Dashboard** → User interacts with web interface
2. **GitHub API** → Dashboard sends `repository_dispatch` event
3. **Workflow** → GitHub Action processes the request
4. **Data Update** → JSON files are modified
5. **Pull Request** → Changes are proposed for review
6. **Merge** → Approved changes are applied to main branch

## 📋 **Validation Rules**

### **Asset ID Format**
- Must contain only: alphanumeric characters, hyphens, underscores
- Pattern: `^[a-zA-Z0-9-_]+$`

### **MUnit Exemption**
- If `munitExempt: true`, `customCoverage` is required (0-100%)
- If `munitExempt: false`, `customCoverage` should be `null`

### **Required Fields**
- **Teams**: `teamName`, `cmdbTeamName`, `businessGroups`
- **APIs**: `apiName`, `assetId`, `teamName`, `apiOwner`, `apiOwnerEmail`, `businessGroups`

## 🚨 **Important Notes**

- **No Direct Edits**: All changes must go through the dashboard → workflow → PR process
- **File Consistency**: Team names in API files must match entries in `valid-platform-values.json`
- **Cascade Updates**: Team renames automatically update all related files
- **Conflict Prevention**: Asset IDs must be unique across all teams

## 🔍 **Troubleshooting**

### **Common Issues**
1. **Dashboard fails to load** - Check if data files exist in root directory
2. **Workflow errors** - Verify file paths in workflow YAML files
3. **Data not updating** - Ensure workflows have proper permissions

### **File Locations**
- **Dashboard reads from**: Root directory (for GitHub Pages compatibility)
- **Workflows read from**: `/src/data/` directory
- **Both locations must be kept in sync**

## 📚 **Related Documentation**

- **Dashboard**: See `/docs/README.md` for user interface documentation
- **Workflows**: See `/.github/workflows/README.md` for workflow documentation
- **Schemas**: See `schemas.json` for detailed data validation rules 