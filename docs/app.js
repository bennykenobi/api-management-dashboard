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
                console.log('✅ Values are correct!');
            } else {
                console.log('❌ Values are wrong!');
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
                console.log(`✅ Setting repoOwner to: "${this.repoOwner}"`);
                console.log(`✅ Setting repoName to: "${this.repoName}"`);
                console.log(`✅ Detected GitHub Pages context: ${this.repoOwner}/${this.repoName}`);
                
                // Immediate verification
                console.log(`🔍 IMMEDIATE CHECK - repoOwner: "${this.repoOwner}", repoName: "${this.repoName}"`);
                console.log(`🔍 IMMEDIATE CHECK - typeof repoOwner: ${typeof this.repoOwner}, typeof repoName: ${typeof this.repoName}`);
            } else {
                console.warn('❌ No path parts to detect repository context');
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
            console.log(`✅ Hardcoded fallback set: ${this.repoOwner}/${this.repoName}`);
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
                console.log(`🔍 In loadFile - repoOwner: "${this.repoOwner}", repoName: "${this.repoName}"`);
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






        // Add team button
        const addTeamBtn = document.getElementById('addTeamBtn');
        if (addTeamBtn) {
            addTeamBtn.addEventListener('click', () => this.showTeamModal());
        }



        // Modal save buttons
        const saveTeamBtn = document.getElementById('saveTeamBtn');
        if (saveTeamBtn) {
            saveTeamBtn.addEventListener('click', () => this.saveTeam());
        }

        // Value type change handler
        const valueType = document.getElementById('valueType');
        if (valueType) {
            valueType.addEventListener('change', (e) => this.handleValueTypeChange(e.target.value));
        }
        
        // Populate business groups dropdown
        this.populateBusinessGroupsSelect();

        // MUnit exempt checkbox
        const munitExempt = document.getElementById('munitExempt');
        if (munitExempt) {
            munitExempt.addEventListener('change', (e) => {
                const customCoverageGroup = document.getElementById('customCoverageGroup');
                if (customCoverageGroup) {
                    if (e.target.checked) {
                        customCoverageGroup.style.display = 'block';
                        const customCoverage = document.getElementById('customCoverage');
                        if (customCoverage) customCoverage.required = true;
                    } else {
                        customCoverageGroup.style.display = 'none';
                        const customCoverage = document.getElementById('customCoverage');
                        if (customCoverage) {
                            customCoverage.required = false;
                            customCoverage.value = '';
                        }
                    }
                }
            });
        }
    }

    handleValueTypeChange(valueType) {
        const additionalFields = document.getElementById('additionalFields');
        const teamFields = document.getElementById('teamFields');
        const valueNameLabel = document.querySelector('label[for="valueName"]');
        
        if (additionalFields && teamFields && valueNameLabel) {
            if (valueType === 'teamName') {
                additionalFields.style.display = 'block';
                teamFields.style.display = 'block';
                valueNameLabel.textContent = 'Team Name';
            } else if (valueType === 'businessGroup') {
                additionalFields.style.display = 'none';
                teamFields.style.display = 'none';
                valueNameLabel.textContent = 'Business Group Name';
            }
        }
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
                    <button class="btn btn-sm btn-outline-primary" onclick="dashboard.editItem('${itemType}', '${teamName}', ${index})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="dashboard.deleteTeam('${teamName}')">
                        <i class="bi bi-trash"></i>
                    </button>
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
                    <button class="btn btn-sm btn-outline-primary" onclick="dashboard.editItem('${itemType}', '${item}', ${index})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="dashboard.deleteItem('${itemType}', '${item}', ${index})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            `;
            
            container.appendChild(listItem);
        });
    }







    showTeamModal(editData = null) {
        // Reset form
        document.getElementById('teamForm').reset();
        document.getElementById('valueType').value = '';
        document.getElementById('valueName').value = '';
        
        // Hide additional fields initially
        const additionalFields = document.getElementById('additionalFields');
        if (additionalFields) {
            additionalFields.style.display = 'none';
        }
        
        // Reset value name label
        const valueNameLabel = document.querySelector('label[for="valueName"]');
        if (valueNameLabel) {
            valueNameLabel.textContent = 'Value Name';
        }
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('teamModal'));
        modal.show();
        
        // Populate business groups dropdown when modal is shown
        this.populateBusinessGroupsSelect();
    }



    async saveTeam() { // Renamed from saveTeam to be more generic
        const valueType = document.getElementById('valueType').value;
        const valueName = document.getElementById('valueName').value;
        
        if (!valueType || !valueName) {
            this.showError('Please fill in all required fields');
            return;
        }
        
        try {
            let formData = {};
            
            if (valueType === 'teamName') {
                const teamOwner = document.getElementById('teamOwner').value;
                const teamOwnerEmail = document.getElementById('teamOwnerEmail').value;
                const cmdbTeamName = document.getElementById('cmdbTeamName').value;
                const businessGroupsSelect = document.getElementById('businessGroups');
                const businessGroups = Array.from(businessGroupsSelect.selectedOptions).map(option => option.value);
                
                if (!teamOwner || !teamOwnerEmail) {
                    this.showError('Team owner and email are required');
                    return;
                }
                
                formData = {
                    action: 'add-team',
                    teamName: valueName,
                    teamOwner: teamOwner,
                    teamOwnerEmail: teamOwnerEmail,
                    cmdbTeamName: cmdbTeamName,
                    businessGroups: businessGroups
                };
            } else if (valueType === 'businessGroup') {
                formData = {
                    action: 'add-business-group',
                    businessGroup: valueName
                };
            }
            
            // Save to local data first (this part needs to be re-evaluated for actual data modification)
            await this.saveData(); // This will save the current in-memory state, not the new value
            
            // Trigger GitHub workflow - use the action from formData
            await this.triggerGitHubWorkflow(formData.action, formData);
            
            // Close modal and refresh
            const modal = bootstrap.Modal.getInstance(document.getElementById('teamModal'));
            if (modal) modal.hide();
            
            this.renderDashboard();
            this.showSuccess('Value added successfully'); // Generic success message
            
        } catch (error) {
            console.error('Failed to save value:', error); // Generic error message
            this.showError('Failed to save value'); // Generic error message
        }
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
            return;
        }

        try {
            console.log(`Triggering workflow for action: ${action}`, data);
            
            // Create the repository dispatch payload
            const payload = {
                event_type: action,
                client_payload: data
            };
            
            // Make the actual API call to trigger the workflow
            // Try to use GitHub's built-in authentication context first
            const response = await fetch(`https://api.github.com/repos/${this.repoOwner}/${this.repoName}/dispatches`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json',
                    // GitHub Pages may have access to the repository context
                    // If this fails, we'll fall back to other methods
                },
                body: JSON.stringify(payload)
            });
            
            if (response.ok) {
                this.showSuccess(`Workflow triggered for ${action}. Check GitHub for the created PR.`);
                console.log('Workflow triggered successfully');
            } else {
                const errorData = await response.json();
                console.error('GitHub API error:', errorData);
                
                if (response.status === 401) {
                    this.showError('Authentication required. For enterprise repositories, you may need to configure a GitHub App or use a personal access token.');
                    console.log('Authentication failed. Consider these options:');
                    console.log('1. Create a GitHub App with repository permissions');
                    console.log('2. Use a personal access token with repo scope');
                    console.log('3. Configure repository secrets for automated workflows');
                } else {
                    this.showError(`Failed to trigger workflow: ${errorData.message || 'Unknown error'}`);
                }
            }
        } catch (error) {
            console.error('Failed to trigger workflow:', error);
            this.showError('Failed to trigger workflow. Check console for details.');
        }
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

    async deleteTeam(teamName) {
        try {
            // Check if team has APIs assigned - teams can only be deleted if they have no APIs
            const teamApis = await this.getTeamApis(teamName);
            if (teamApis && teamApis.length > 0) {
                this.showError(`Cannot delete team "${teamName}" - it has ${teamApis.length} API(s) assigned. Please reassign APIs to other teams first.`);
                return;
            }

            const formData = {
                arrayType: 'teamNames',
                value: teamName,
                timestamp: new Date().toISOString()
            };
            
            await this.triggerGitHubWorkflow('delete-platform-value', formData);
            this.showSuccess('Team deleted successfully');
            this.renderDashboard();
        } catch (error) {
            console.error('Failed to delete team:', error);
            this.showError('Failed to delete team');
        }
    }





    editItem(itemType, itemValue, index) {
        // Implementation for editing teams, CMDB names, or business groups
        console.log('Edit item:', { itemType, itemValue, index });
        this.showError('Edit functionality not yet implemented');
    }

    deleteItem(itemType, itemValue, index) {
        // Implementation for deleting teams, CMDB names, or business groups
        console.log('Delete item:', { itemType, itemValue, index });
        this.showError('Delete functionality not yet implemented');
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
    
    populateBusinessGroupsSelect() {
        const select = document.getElementById('businessGroups');
        if (!select) return;
        
        select.innerHTML = '<option value="">Select Business Groups</option>';
        if (this.teamsData?.validBusinessGroups) {
            this.teamsData.validBusinessGroups.forEach(bg => {
                const option = document.createElement('option');
                option.value = bg;
                option.textContent = bg;
                select.appendChild(option);
            });
        }
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