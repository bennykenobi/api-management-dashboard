# API Management Dashboard

A modern, responsive web dashboard for managing team configurations, Mule APIs, and MUnit testing exceptions.

## Features

### 🏢 Team Management
- **Add/Edit Teams**: Create new teams with CMDB team names and business group assignments
- **CMDB Integration**: Manage CMDB team name mappings
- **Business Groups**: Organize teams by business function
- **Automatic File Creation**: New teams automatically get their Mule API registry files

### 🔌 Mule API Management
- **API Registry**: Track all Mule APIs across teams
- **Asset ID Management**: Unique identifier system with conflict prevention
- **Owner Tracking**: API ownership and contact information
- **MUnit Exemptions**: Handle testing exceptions with custom coverage requirements
- **Business Group Mapping**: Link APIs to business functions

### 🔍 Search & Filter
- **Global Search**: Search across all fields in all documents
- **Team Filtering**: Filter APIs by specific teams
- **Real-time Results**: Instant search results with highlighting
- **Advanced Queries**: Search by API name, asset ID, owner, etc.

### 📊 Export & Reporting
- **CSV Export**: Download data in spreadsheet format
- **JSON Export**: Export raw data for integration
- **Filtered Exports**: Export only filtered/visible data
- **Audit Trail**: Track last updated timestamps

## Usage

### Adding a New Team
1. Click **"Add Team"** button in the Teams & CMDB tab
2. Enter team name, CMDB team name, and select business groups
3. Click **Save** - the system automatically creates the team's Mule API file

### Adding a New API
1. Click **"Add API"** button in the Mule APIs tab
2. Fill in all required fields:
   - API Name, Asset ID, Owner, Team, Email
   - Business Groups (multiple selection)
   - MUnit exemption status and custom coverage if exempt
3. Click **Save** - the API is added to the team's registry

### Searching and Filtering
- **Global Search**: Use the search bar to find any data across all fields
- **Team Filter**: Use the dropdown to view APIs from specific teams
- **Search Highlighting**: Matched terms are highlighted in yellow

### Exporting Data
- **CSV Export**: Click the green export button for spreadsheet format
- **JSON Export**: Click the blue export button for raw data format
- Exports include all visible/filtered data

## Technical Details

### File Structure
```
src/dashboard/
├── index.html          # Main dashboard HTML
├── styles.css          # Custom CSS styling
├── app.js             # Main JavaScript application
└── README.md          # This documentation
```

### Data Sources
- **teams.json**: Master configuration for teams, CMDB names, and business groups
- **{team-name}-mule-apis.json**: Team-specific API registries
- **schemas.json**: JSON schema definitions for validation

### Browser Compatibility
- Modern browsers with ES6+ support
- Bootstrap 5.3.0 for responsive design
- Bootstrap Icons for visual elements

### Local Development
1. Open `index.html` in a web browser
2. Dashboard runs with mock data for development
3. Check browser console for debug information

### GitHub Pages Deployment
1. Push to GitHub repository
2. Enable GitHub Pages in repository settings
3. Dashboard automatically detects GitHub context
4. Loads data from repository files via GitHub API

## Security & Access Control

- **No direct file writes**: Dashboard cannot modify repository files directly
- **Workflow-based updates**: All changes go through GitHub Actions workflows
- **Pull Request review**: Changes are reviewed before being applied
- **Audit trail**: All modifications are tracked in git history and PR history
- **Repository permissions**: Write access controlled by GitHub repository settings

## How Updates Work

### 1. **Dashboard Action**
- User makes changes in the dashboard
- Dashboard validates data locally
- Triggers GitHub Actions workflow via repository dispatch

### 2. **Workflow Execution**
- GitHub Action runs automatically
- Updates the appropriate JSON files
- Creates a pull request with changes

### 3. **Review Process**
- Team reviews the automated PR
- Changes are discussed if needed
- PR is merged to apply changes

## Future Enhancements

- **Real-time Collaboration**: Multiple users editing simultaneously
- **Advanced Validation**: Schema-based validation with error reporting
- **Audit Logging**: Detailed change history and user tracking
- **API Integration**: Direct integration with Anypoint Exchange
- **Automated Testing**: Validate changes before PR creation
- **Notification System**: Alert teams of pending changes

## Troubleshooting

### Common Issues
- **Data not loading**: Check browser console for API errors
- **Search not working**: Ensure JavaScript is enabled
- **Export failing**: Check browser download permissions
- **Modal not opening**: Ensure Bootstrap JavaScript is loaded

### Debug Mode
- Open browser developer tools
- Check console for detailed error messages
- Verify data loading in Network tab
- Test with browser's JavaScript console

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This dashboard is part of the API Management project and follows the same licensing terms. 