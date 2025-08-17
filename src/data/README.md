# Data Structure Documentation

## Overview
This directory contains the JSON configuration files for team management, API registry, and validation schemas.

## Files

### `teams.json`
Contains lists of valid values for validation:
- **validTeamNames**: Array of authorized team names
- **validCmdbTeamNames**: Array of authorized CMDB team names  
- **validBusinessGroups**: Array of authorized business groups

### `{team-name}-mule-apis.json`
Team-specific Mule API registry files containing:
- **teamName**: Must match a value in teams.json validTeamNames
- **apis**: Array of API objects with the following properties:
  - **apiName**: Human-readable API name
  - **assetId**: Unique identifier (alphanumeric, hyphens, underscores only)
  - **apiOwner**: API owner name
  - **teamName**: Must match parent teamName
  - **apiOwnerEmail**: Valid email format
  - **munitExempt**: Boolean indicating if MUnit testing is exempt
  - **customCoverage**: Coverage percentage (0-100) if munitExempt is true, null otherwise
  - **businessGroups**: Array of business groups (must be from teams.json validBusinessGroups)
  - **lastUpdated**: ISO 8601 timestamp

### `schemas.json`
JSON Schema definitions for validation:
- **teamsSchema**: Schema for teams.json structure
- **apiRegistrySchema**: Schema for team API registry files

## Validation Rules
1. Team names must exist in teams.json validTeamNames
2. CMDB team names must exist in teams.json validCmdbTeamNames
3. Business groups must exist in teams.json validBusinessGroups
4. Asset IDs must be unique across all teams
5. If munitExempt is true, customCoverage must be a number 0-100
6. All required fields must be present

## File Naming Convention
Team Mule API files should follow the pattern: `{team-name}-mule-apis.json`
- Use lowercase with hyphens
- Example: `platform-team-mule-apis.json`
- Files are automatically created when new teams are added via the dashboard

## Dashboard Functionality
The GitHub Pages dashboard will automatically:
- **Create** new `{team-name}-mule-apis.json` files when teams are added
- **Update** team names across all related files when team names change
- **Delete** team files when teams are removed (with confirmation)
- **Validate** all data against the schemas before saving
- **Search** across all fields in all documents
- **Export** data in CSV/JSON formats

## Data Integrity
- Changes to team names will cascade to update all related API files
- Asset ID conflicts are prevented during validation
- Business group references are validated against the master list
- Automatic file creation ensures consistent structure 