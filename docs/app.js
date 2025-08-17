// Teams, CMDB, and Business Group Management Dashboard

class TeamManagementDashboard {
    constructor() {
        this.teamsData = null;
        this.githubToken = null;
        this.repoOwner = null;
        this.repoName = null;
        this.initialized = false;
        
        // Don't call init() here - let the DOM ready handler do it
    }

    async init() {
        try {
            console.log('Starting dashboard initialization...');
            await this.detectGitHubContext();
            console.log('GitHub context detected:', { repoOwner: this.repoOwner, repoName: this.repoName });
            console.log(`🔍 Before loadData - repoOwner: "${this.repoOwner}", repoName: "${this.repoName}"`);
            
            // Debug: Check if values are correct
            if (this.repoOwner === 'bennykenobi' && this.repoName === 'api-management-dashboard') {
                console.log('Values are correct!');
            } else {
                console.log('Values are wrong!');
                console.log(`Expected: bennykenobi/api-management-dashboard`);
                console.log(`Got: ${this.repoOwner}/${this.repoName}`);
            }
            
            await this.loadData();
            console.log('Data loaded successfully');
            this.setupEventListeners();
            console.log('Event listeners set up');
            this.renderDashboard();
            console.log('Dashboard rendered successfully');
            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize dashboard:', error);
            // Don't call showError during initialization - display error directly
            this.displayInitError('Failed to initialize dashboard. Please check the console for details.');
            throw error; // Re-throw to let the caller know initialization failed
        }
    }

    displayInitError(message) {
        // Display initialization error directly in the page
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger m-4';
        errorDiv.innerHTML = `
            <h4>Dashboard Initialization Failed</h4>
            <p>${message}</p>
            <p><strong>Error details:</strong> Check the browser console for more information.</p>
        `;
        
        // Insert at the top of the body
        document.body.insertBefore(errorDiv, document.body.firstChild);
    }

    async detectGitHubContext() {
        // Only detect GitHub context if we're actually on GitHub Pages
        if (window.location.hostname === 'github.io' || window.location.hostname.includes('github.io')) {
            // Extract username from hostname (e.g., bennykenobi.github.io)
            const username = window.location.hostname.split('.')[0];
            console.log(`Extracted username from hostname: ${username}`);
            
            const pathParts = window.location.pathname.split('/').filter(part => part.length > 0);
            console.log('GitHub Pages path parts (filtered):', pathParts);
            console.log('Path parts length:', pathParts.length);
            
            // GitHub Pages URL structure: username.github.io/repository-name/page.html
            if (pathParts.length >= 1) {
                this.repoOwner = username;
                // The first path part is the repository name (remove .html if present)
                this.repoName = pathParts[0].replace('.html', '');
                console.log(`Setting repoOwner to: "${this.repoOwner}"`);
                console.log(`Setting repoName to: "${this.repoName}"`);
                console.log(`Detected GitHub Pages context: ${this.repoOwner}/${this.repoName}`);
                
                // Immediate verification
                console.log(`IMMEDIATE CHECK - repoOwner: "${this.repoOwner}", repoName: "${this.repoName}"`);
                console.log(`IMMEDIATE CHECK - typeof repoOwner: ${typeof this.repoOwner}, typeof repoName: ${typeof this.repoName}`);
            } else {
                console.warn('No path parts to detect repository context');
                console.log('Expected at least 1 part, got:', pathParts.length);
            }
        } else {
            // For local development, explicitly set to null
            this.repoOwner = null;
            this.repoName = null;
            console.log('Running in local development mode with local files');
        }
        
        // Hardcoded fallback to ensure correct repository context
        if (!this.repoOwner || !this.repoName) {
            this.repoOwner = 'bennykenobi';
            this.repoName = 'api-management-dashboard';
            console.log(`Hardcoded fallback set: ${this.repoOwner}/${this.repoName}`);
        }
    }

    async loadData() {
        try {
            // Load teams configuration
            this.teamsData = await this.loadFile('valid-platform-values.json');
            
            console.log('Data loaded successfully:', { teams: this.teamsData });
        } catch (error) {
            console.error('Failed to load data:', error);
            throw error;
        }
    }

    async loadFile(filePath) {
        try {
            console.log(`Attempting to load file: ${filePath}`);
            if (this.repoOwner && this.repoName) {
                // Load from GitHub API - files are in the docs/ directory
                const fullPath = `docs/${filePath}`;
                console.log(`In loadFile - repoOwner: "${this.repoOwner}", repoName: "${this.repoName}"`);
                console.log(`Loading from GitHub API: ${this.repoOwner}/${this.repoName}/${fullPath}`);
                const response = await fetch(`https://api.github.com/repos/${this.repoOwner}/${this.repoName}/contents/${fullPath}`);
                if (!response.ok) throw new Error(`Failed to load ${fullPath}`);
                
                const data = await response.json();
                const content = atob(data.content);
                console.log(`Successfully loaded ${fullPath} from GitHub API`);
                return JSON.parse(content);
            } else {
                // Load from local file system (for development)
                // Since we're in docs/ folder and data files are also here
                console.log(`Loading from local file system: ${filePath}`);
                const response = await fetch(filePath);
                if (!response.ok) throw new Error(`Failed to load ${filePath}`);
                console.log(`Successfully loaded ${filePath} from local file system`);
                return await response.json();
            }
        } catch (error) {
            console.error(`Error loading ${filePath}:`, error);
            throw error;
        }
    }



    setupEventListeners() {
        // Dashboard is now read-only - no event listeners needed for editing
        console.log('Dashboard is read-only - no edit functionality needed');
    }



    renderDashboard() {
        this.renderTeamsSection();
    }

    renderTeamsSection() {
        if (!this.teamsData) return;

        // Render team names with owner info
        this.renderTeamList('teamNamesList', this.teamsData.validTeamNames, 'teamName', 'Team Names');
        
        // Render CMDB assignment groups
        this.renderList('cmdbTeamNamesList', this.teamsData.validCmdbAssignmentGroups, 'cmdbAssignmentGroup', 'CMDB Assignment Groups');
        
        // Render business groups
        this.renderList('businessGroupsList', this.teamsData.validBusinessGroups, 'businessGroup', 'Business Groups');
    }

    renderTeamList(containerId, items, itemType, title) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        
        if (!items || items.length === 0) {
            container.innerHTML = '<p class="text-muted">No items found</p>';
            return;
        }

        items.forEach((item, index) => {
            const listItem = document.createElement('div');
            listItem.className = 'list-item';
            
            const teamName = typeof item === 'string' ? item : item.name;
            const teamOwner = typeof item === 'object' ? item.owner : 'N/A';
            const teamEmail = typeof item === 'object' ? item.ownerEmail : 'N/A';
            
            listItem.innerHTML = `
                <div class="item-text">
                    <strong>${teamName}</strong><br>
                    <small class="text-muted">Owner: ${teamOwner} (${teamEmail})</small>
                </div>
                <div class="item-actions">
                    <span class="text-muted small">View only</span>
                </div>
            `;
            
            container.appendChild(listItem);
        });
    }

    renderList(containerId, items, itemType, title) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';
        
        if (!items || items.length === 0) {
            container.innerHTML = '<p class="text-muted">No items found</p>';
            return;
        }

        items.forEach((item, index) => {
            const listItem = document.createElement('div');
            listItem.className = 'list-item';
            
            listItem.innerHTML = `
                <div class="item-text">${item}</div>
                <div class="item-actions">
                    <span class="text-muted small">View only</span>
                </div>
            `;
            
            container.appendChild(listItem);
        });
    }

















    async saveData() {
        // In a real implementation, this would save to GitHub via API
        // For now, we'll just update the local state
        console.log('Data saved:', { teams: this.teamsData });
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    async triggerGitHubWorkflow(action, data) {
        if (!this.repoOwner || !this.repoName) {
            console.log('Not in GitHub context, skipping workflow trigger');
            console.log(`repoOwner: "${this.repoOwner}", repoName: "${this.repoName}"`);
            return;
        }

        try {
            console.log(`Creating GitHub issue for action: ${action}`);
            console.log(`Form data:`, data);
            console.log(`Repository context: ${this.repoOwner}/${this.repoName}`);
            
            // Create a GitHub issue that the workflow will monitor
            const issueTitle = `[AUTOMATED] ${action}: ${data.businessGroup || data.teamName || 'New Value'}`;
            const issueBody = this.createIssueBody(action, data);
            
            console.log(`Issue title: "${issueTitle}"`);
            console.log(`Issue body:`, issueBody);
            
            // Create the issue payload with proper labels for workflow triggering
            const payload = {
                title: issueTitle,
                body: issueBody,
                labels: ['workflow-trigger', action] // workflow-trigger label is required
            };
            
            console.log(`Payload to send:`, payload);
            
            // Build the API URL
            const apiUrl = `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/issues`;
            console.log(`API URL: ${apiUrl}`);
            
            // Prepare headers with authentication
            const headers = {
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'Authorization': 'token ghp_YOUR_ACTUAL_TOKEN_HERE' // Replace ghp_YOUR_ACTUAL_TOKEN_HERE with your real token
            };
            console.log(`Request headers:`, headers);
            
            console.log(`Making POST request to GitHub API...`);
            
            // Make the API call to create an issue
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(payload)
            });
            
            console.log(`Response received:`);
            console.log(`   Status: ${response.status} ${response.statusText}`);
            console.log(`   OK: ${response.ok}`);
            console.log(`   Headers:`, Object.fromEntries(response.headers.entries()));
            
            if (response.ok) {
                const issue = await response.json();
                console.log('GitHub issue created successfully:', issue);
                this.showSuccess('Request submitted successfully! A GitHub issue has been created and will be processed automatically. Check the Issues tab for progress.');
            } else {
                console.log(`Request failed with status ${response.status}`);
                
                let errorData;
                try {
                    errorData = await response.json();
                    console.error('Error response body:', errorData);
                } catch (parseError) {
                    console.error('Could not parse error response:', parseError);
                    errorData = { message: 'Unknown error - could not parse response' };
                }
                
                if (response.status === 401) {
                    console.error('Authentication failed - 401 Unauthorized');
                    this.showError('Authentication failed. Please ensure you are logged into GitHub and have write access to this repository.');
                } else if (response.status === 403) {
                    console.error('Forbidden - 403 - Insufficient permissions');
                    this.showError('Access denied. You may not have permission to create issues in this repository.');
                } else if (response.status === 404) {
                    console.error('Not Found - 404 - Repository or endpoint not found');
                    this.showError(`Repository not found: ${this.repoOwner}/${this.repoName}. Please check the repository path.`);
                } else {
                    console.error(`Unexpected error: ${response.status} ${response.statusText}`);
                    this.showError(`Failed to submit request: ${errorData.message || 'Unknown error'}`);
                }
            }
        } catch (error) {
            console.error('Exception during GitHub API call:', error);
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            this.showError('Error submitting request: ' + error.message);
        }
    }



    createIssueBody(action, data) {
        let body = `**Action:** ${action}\\n`;
        body += `**Timestamp:** ${new Date().toISOString()}\\n\\n`;
        
        if (action === 'add-business-group') {
            body += `**Business Group:** ${data.businessGroup}\\n`;
            body += `\\nThis issue was automatically created to request adding a new business group to the platform configuration.\\n\\n`;
            body += `### Next Steps:\\n`;
            body += `1. Review the request\\n`;
            body += `2. The workflow will automatically process this request\\n`;
            body += `3. A PR will be created for your review\\n`;
        } else if (action === 'add-team') {
            body += `**Team Name:** ${data.teamName}\\n`;
            body += `**Team Owner:** ${data.teamOwner}\\n`;
            body += `**Owner Email:** ${data.teamOwnerEmail}\\n`;
            if (data.cmdbTeamName) {
                body += `**CMDB Assignment Group:** ${data.cmdbTeamName}\\n`;
            }
            if (data.businessGroups && data.businessGroups.length > 0) {
                body += `**Business Groups:** ${data.businessGroups.join(', ')}\\n`;
            }
            body += `\\nThis issue was automatically created to request adding a new team to the platform configuration.\\n\\n`;
            body += `### Next Steps:\\n`;
            body += `1. Review the request\\n`;
            body += `2. The workflow will automatically process this request\\n`;
            body += `3. A PR will be created for your review\\n`;
        } else if (action === 'delete-team') {
            body += `**Team Name:** ${data.teamName}\\n`;
            body += `\\nThis issue was automatically created to request deleting a team from the platform configuration.\\n\\n`;
            body += `### Next Steps:\\n`;
            body += `1. Review the request\\n`;
            body += `2. The workflow will automatically process this request\\n`;
            body += `3. A PR will be created for your review\\n`;
        }
        
        return body;
    }

    async getTeamApis(teamName) {
        // Check if the team has any APIs assigned
        const fileName = `${teamName.toLowerCase().replace(/\s+/g, '-')}-mule-apis.json`;
        try {
            if (this.repoOwner && this.repoName) {
                // Load from GitHub API to check if team has APIs
                const fullPath = `docs/${fileName}`;
                const response = await fetch(`https://api.github.com/repos/${this.repoOwner}/${this.repoName}/contents/${fullPath}`);
                if (response.ok) {
                    const data = await response.json();
                    const content = atob(data.content);
                    const teamData = JSON.parse(content);
                    return teamData.apis || [];
                }
            } else {
                // For local development, try to load the file directly
                const response = await fetch(fileName);
                if (response.ok) {
                    const teamData = await response.json();
                    return teamData.apis || [];
                }
            }
            return [];
        } catch (error) {
            console.warn(`Could not check APIs for team ${teamName}:`, error);
            return [];
        }
    }













    showSuccess(message) {
        this.showToast(message, 'success');
    }

    showError(message) {
        this.showToast(message, 'danger');
    }

    showToast(message, type = 'info') {
        // Create toast notification
        const toastContainer = document.querySelector('.toast-container') || this.createToastContainer();
        
        const toast = document.createElement('div');
        toast.className = `toast show bg-${type} text-white`;
        toast.innerHTML = `
            <div class="toast-body">
                ${message}
                <button type="button" class="btn-close btn-close-white ms-2" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
        `;
        
        toastContainer.appendChild(toast);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }

    createToastContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    }
    

}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing dashboard...');
    try {
        window.dashboard = new TeamManagementDashboard();
        window.dashboard.init(); // Call init() after the dashboard instance is created
    } catch (error) {
        console.error('Failed to create dashboard instance:', error);
        document.body.innerHTML = '<div class="alert alert-danger m-4">Failed to initialize dashboard: ' + error.message + '</div>';
    }
});