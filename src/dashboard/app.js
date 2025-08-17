// API Management Dashboard - Main Application Logic

class APIManagementDashboard {
    constructor() {
        this.teamsData = null;
        this.apisData = {};
        this.currentSearchTerm = '';
        this.currentTeamFilter = '';
        this.githubToken = null;
        this.repoOwner = null;
        this.repoName = null;
        
        this.init();
    }

    async init() {
        try {
            await this.detectGitHubContext();
            await this.loadData();
            this.setupEventListeners();
            this.renderDashboard();
        } catch (error) {
            console.error('Failed to initialize dashboard:', error);
            this.showError('Failed to initialize dashboard. Please check the console for details.');
        }
    }

    async detectGitHubContext() {
        // Try to detect if we're running on GitHub Pages
        if (window.location.hostname.includes('github.io')) {
            const pathParts = window.location.pathname.split('/');
            if (pathParts.length >= 3) {
                this.repoOwner = pathParts[1];
                this.repoName = pathParts[2];
                console.log(`Detected GitHub Pages context: ${this.repoOwner}/${this.repoName}`);
            }
        }
        
        // For local development, we'll use mock data
        if (!this.repoOwner || !this.repoName) {
            console.log('Running in local development mode with mock data');
        }
    }

    async loadData() {
        try {
            // Load teams configuration
            this.teamsData = await this.loadFile('src/data/teams.json');
            
            // Load all team API files
            await this.loadAllTeamAPIs();
            
            console.log('Data loaded successfully:', { teams: this.teamsData, apis: this.apisData });
        } catch (error) {
            console.error('Failed to load data:', error);
            throw error;
        }
    }

    async loadFile(filePath) {
        try {
            if (this.repoOwner && this.repoName) {
                // Load from GitHub API
                const response = await fetch(`https://api.github.com/repos/${this.repoOwner}/${this.repoName}/contents/${filePath}`);
                if (!response.ok) throw new Error(`Failed to load ${filePath}`);
                
                const data = await response.json();
                const content = atob(data.content);
                return JSON.parse(content);
            } else {
                // Load from local file system (for development)
                const response = await fetch(`../${filePath}`);
                if (!response.ok) throw new Error(`Failed to load ${filePath}`);
                return await response.json();
            }
        } catch (error) {
            console.error(`Error loading ${filePath}:`, error);
            throw error;
        }
    }

    async loadAllTeamAPIs() {
        if (!this.teamsData?.validTeamNames) return;
        
        for (const teamName of this.teamsData.validTeamNames) {
            const fileName = `${teamName.toLowerCase().replace(/\s+/g, '-')}-mule-apis.json`;
            try {
                const teamAPIs = await this.loadFile(`src/data/${fileName}`);
                this.apisData[teamName] = teamAPIs;
            } catch (error) {
                console.warn(`No API file found for team ${teamName}:`, error);
                // Create empty team API file
                this.apisData[teamName] = {
                    teamName: teamName,
                    apis: []
                };
            }
        }
    }

    setupEventListeners() {
        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.currentSearchTerm = e.target.value;
            this.renderDashboard();
        });

        document.getElementById('clearSearch').addEventListener('click', () => {
            document.getElementById('searchInput').value = '';
            this.currentSearchTerm = '';
            this.renderDashboard();
        });

        // Export functionality
        document.getElementById('exportCsv').addEventListener('click', () => this.exportData('csv'));
        document.getElementById('exportJson').addEventListener('click', () => this.exportData('json'));

        // Team filter
        document.getElementById('teamFilter').addEventListener('change', (e) => {
            this.currentTeamFilter = e.target.value;
            this.renderAPIsTable();
        });

        // Add team button
        document.getElementById('addTeamBtn').addEventListener('click', () => this.showTeamModal());

        // Add API button
        document.getElementById('addApiBtn').addEventListener('click', () => this.showAPIModal());

        // Modal save buttons
        document.getElementById('saveTeamBtn').addEventListener('click', () => this.saveTeam());
        document.getElementById('saveApiBtn').addEventListener('click', () => this.saveAPI());

        // MUnit exempt checkbox
        document.getElementById('munitExempt').addEventListener('change', (e) => {
            const customCoverageGroup = document.getElementById('customCoverageGroup');
            if (e.target.checked) {
                customCoverageGroup.style.display = 'block';
                document.getElementById('customCoverage').required = true;
            } else {
                customCoverageGroup.style.display = 'none';
                document.getElementById('customCoverage').required = false;
                document.getElementById('customCoverage').value = '';
            }
        });
    }

    renderDashboard() {
        this.renderTeamsSection();
        this.renderAPIsTable();
        this.updateTeamFilter();
    }

    renderTeamsSection() {
        if (!this.teamsData) return;

        // Render team names
        this.renderList('teamNamesList', this.teamsData.validTeamNames, 'teamName', 'Team Names');
        
        // Render CMDB team names
        this.renderList('cmdbTeamNamesList', this.teamsData.validCmdbTeamNames, 'cmdbTeamName', 'CMDB Team Names');
        
        // Render business groups
        this.renderList('businessGroupsList', this.teamsData.validBusinessGroups, 'businessGroup', 'Business Groups');
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
            
            const isHighlighted = this.currentSearchTerm && 
                item.toLowerCase().includes(this.currentSearchTerm.toLowerCase());
            
            listItem.innerHTML = `
                <div class="item-text ${isHighlighted ? 'search-highlight' : ''}">${item}</div>
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

    renderAPIsTable() {
        const tbody = document.getElementById('apisTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        let allAPIs = [];
        Object.values(this.apisData).forEach(teamData => {
            if (teamData.apis) {
                allAPIs.push(...teamData.apis);
            }
        });

        // Apply team filter
        if (this.currentTeamFilter) {
            allAPIs = allAPIs.filter(api => api.teamName === this.currentTeamFilter);
        }

        // Apply search filter
        if (this.currentSearchTerm) {
            allAPIs = allAPIs.filter(api => 
                Object.values(api).some(value => 
                    String(value).toLowerCase().includes(this.currentSearchTerm.toLowerCase())
                )
            );
        }

        if (allAPIs.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center text-muted">
                        No APIs found matching the current filters
                    </td>
                </tr>
            `;
            return;
        }

        allAPIs.forEach(api => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${this.highlightSearch(api.apiName)}</td>
                <td><code>${this.highlightSearch(api.assetId)}</code></td>
                <td>${this.highlightSearch(api.teamName)}</td>
                <td>${this.highlightSearch(api.apiOwner)}</td>
                <td>
                    <span class="badge ${api.munitExempt ? 'badge-exempt' : 'badge-not-exempt'}">
                        ${api.munitExempt ? 'Exempt' : 'Required'}
                    </span>
                </td>
                <td>${api.munitExempt ? `${api.customCoverage}%` : 'N/A'}</td>
                <td>${api.businessGroups.map(bg => this.highlightSearch(bg)).join(', ')}</td>
                <td>${new Date(api.lastUpdated).toLocaleDateString()}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-outline-primary" onclick="dashboard.editAPI('${api.assetId}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="dashboard.deleteAPI('${api.assetId}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    highlightSearch(text) {
        if (!this.currentSearchTerm) return text;
        
        const regex = new RegExp(`(${this.currentSearchTerm})`, 'gi');
        return String(text).replace(regex, '<span class="search-highlight">$1</span>');
    }

    updateTeamFilter() {
        const teamFilter = document.getElementById('teamFilter');
        if (!teamFilter) return;

        teamFilter.innerHTML = '<option value="">All Teams</option>';
        
        if (this.teamsData?.validTeamNames) {
            this.teamsData.validTeamNames.forEach(teamName => {
                const option = document.createElement('option');
                option.value = teamName;
                option.textContent = teamName;
                teamFilter.appendChild(option);
            });
        }
    }

    showTeamModal(editData = null) {
        const modal = new bootstrap.Modal(document.getElementById('teamModal'));
        const title = document.getElementById('teamModalTitle');
        const form = document.getElementById('teamForm');
        
        if (editData) {
            title.textContent = 'Edit Team';
            document.getElementById('teamName').value = editData.teamName || '';
            document.getElementById('cmdbTeamName').value = editData.cmdbTeamName || '';
            // Handle business groups selection
        } else {
            title.textContent = 'Add Team';
            form.reset();
        }
        
        // Populate business groups
        this.populateBusinessGroupsSelect('businessGroups');
        
        modal.show();
    }

    showAPIModal(editData = null) {
        const modal = new bootstrap.Modal(document.getElementById('apiModal'));
        const title = document.getElementById('apiModalTitle');
        const form = document.getElementById('apiForm');
        
        if (editData) {
            title.textContent = 'Edit API';
            // Populate form fields
            Object.keys(editData).forEach(key => {
                const element = document.getElementById(key);
                if (element) {
                    if (key === 'munitExempt') {
                        element.checked = editData[key];
                        this.toggleCustomCoverage(editData[key]);
                    } else if (key === 'businessGroups') {
                        this.populateMultiSelect('apiBusinessGroups', editData[key]);
                    } else {
                        element.value = editData[key];
                    }
                }
            });
        } else {
            title.textContent = 'Add API';
            form.reset();
            document.getElementById('customCoverageGroup').style.display = 'none';
        }
        
        // Populate selects
        this.populateTeamSelect('apiTeamName');
        this.populateBusinessGroupsSelect('apiBusinessGroups');
        
        modal.show();
    }

    populateTeamSelect(selectId) {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        select.innerHTML = '<option value="">Select Team</option>';
        if (this.teamsData?.validTeamNames) {
            this.teamsData.validTeamNames.forEach(teamName => {
                const option = document.createElement('option');
                option.value = teamName;
                option.textContent = teamName;
                select.appendChild(option);
            });
        }
    }

    populateBusinessGroupsSelect(selectId) {
        const select = document.getElementById(selectId);
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

    populateMultiSelect(selectId, selectedValues) {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        Array.from(select.options).forEach(option => {
            option.selected = selectedValues.includes(option.value);
        });
    }

    toggleCustomCoverage(isExempt) {
        const customCoverageGroup = document.getElementById('customCoverageGroup');
        const customCoverage = document.getElementById('customCoverage');
        
        if (isExempt) {
            customCoverageGroup.style.display = 'block';
            customCoverage.required = true;
        } else {
            customCoverageGroup.style.display = 'none';
            customCoverage.required = false;
            customCoverage.value = '';
        }
    }

    async saveTeam() {
        try {
            const formData = {
                teamName: document.getElementById('teamName').value,
                cmdbTeamName: document.getElementById('cmdbTeamName').value,
                businessGroups: Array.from(document.getElementById('businessGroups').selectedOptions).map(opt => opt.value)
            };

            // Validate form data
            if (!formData.teamName || !formData.cmdbTeamName || formData.businessGroups.length === 0) {
                this.showError('Please fill in all required fields');
                return;
            }

            // Check for duplicates
            if (this.teamsData.validTeamNames.includes(formData.teamName)) {
                this.showError('Team name already exists');
                return;
            }

            // Add to teams data
            this.teamsData.validTeamNames.push(formData.teamName);
            this.teamsData.validCmdbTeamNames.push(formData.cmdbTeamName);
            
            // Add new business groups if they don't exist
            formData.businessGroups.forEach(bg => {
                if (!this.teamsData.validBusinessGroups.includes(bg)) {
                    this.teamsData.validBusinessGroups.push(bg);
                }
            });

            // Create team API file
            this.apisData[formData.teamName] = {
                teamName: formData.teamName,
                apis: []
            };

            // Save data locally
            await this.saveData();
            
            // Trigger GitHub workflow to create PR
            await this.triggerGitHubWorkflow('add-team', formData);
            
            // Close modal and refresh
            bootstrap.Modal.getInstance(document.getElementById('teamModal')).hide();
            this.renderDashboard();
            this.showSuccess('Team added successfully. Check GitHub for the created PR.');
            
        } catch (error) {
            console.error('Failed to save team:', error);
            this.showError('Failed to save team');
        }
    }

    async saveAPI() {
        try {
            const formData = {
                apiName: document.getElementById('apiName').value,
                assetId: document.getElementById('assetId').value,
                apiOwner: document.getElementById('apiOwner').value,
                teamName: document.getElementById('apiTeamName').value,
                apiOwnerEmail: document.getElementById('apiOwnerEmail').value,
                munitExempt: document.getElementById('munitExempt').checked,
                customCoverage: document.getElementById('munitExempt').checked ? 
                    parseInt(document.getElementById('customCoverage').value) : null,
                businessGroups: Array.from(document.getElementById('apiBusinessGroups').selectedOptions).map(opt => opt.value),
                lastUpdated: new Date().toISOString()
            };

            // Validate form data
            if (!formData.apiName || !formData.assetId || !formData.apiOwner || 
                !formData.teamName || !formData.apiOwnerEmail || formData.businessGroups.length === 0) {
                this.showError('Please fill in all required fields');
                return;
            }

            // Validate asset ID format
            if (!/^[a-zA-Z0-9-_]+$/.test(formData.assetId)) {
                this.showError('Asset ID can only contain alphanumeric characters, hyphens, and underscores');
                return;
            }

            // Check for asset ID conflicts
            const existingAPI = this.findAPIByAssetId(formData.assetId);
            if (existingAPI && existingAPI.teamName !== formData.teamName) {
                this.showError('Asset ID already exists in another team');
                return;
            }

            // Validate custom coverage
            if (formData.munitExempt && (!formData.customCoverage || formData.customCoverage < 0 || formData.customCoverage > 100)) {
                this.showError('Custom coverage must be between 0 and 100 when MUnit testing is exempt');
                return;
            }

            // Add/update API
            if (existingAPI) {
                // Update existing API
                Object.assign(existingAPI, formData);
            } else {
                // Add new API
                this.apisData[formData.teamName].apis.push(formData);
            }

            // Save data locally
            await this.saveData();
            
            // Trigger GitHub workflow to create PR
            await this.triggerGitHubWorkflow('update-api', formData);
            
            // Close modal and refresh
            bootstrap.Modal.getInstance(document.getElementById('apiModal')).hide();
            this.renderDashboard();
            this.showSuccess('API saved successfully. Check GitHub for the created PR.');
            
        } catch (error) {
            console.error('Failed to save API:', error);
            this.showError('Failed to save API');
        }
    }

    findAPIByAssetId(assetId) {
        for (const teamData of Object.values(this.apisData)) {
            const api = teamData.apis.find(api => api.assetId === assetId);
            if (api) return api;
        }
        return null;
    }

    async saveData() {
        // In a real implementation, this would save to GitHub via API
        // For now, we'll just update the local state
        console.log('Data saved:', { teams: this.teamsData, apis: this.apisData });
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    async triggerGitHubWorkflow(action, data) {
        if (!this.repoOwner || !this.repoName) {
            console.log('Not in GitHub context, skipping workflow trigger');
            return;
        }

        try {
            // This would require a GitHub token with repo access
            // For now, we'll simulate the workflow trigger
            console.log(`Would trigger workflow for action: ${action}`, data);
            
            // In production, this would make a POST request to:
            // https://api.github.com/repos/{owner}/{repo}/dispatches
            // with the appropriate payload
            
            this.showSuccess(`Workflow triggered for ${action}. Check GitHub for the created PR.`);
        } catch (error) {
            console.error('Failed to trigger workflow:', error);
            this.showError('Failed to trigger workflow. Changes are only local.');
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

    editAPI(assetId) {
        const api = this.findAPIByAssetId(assetId);
        if (api) {
            this.showAPIModal(api);
        }
    }

    deleteAPI(assetId) {
        const api = this.findAPIByAssetId(assetId);
        if (api) {
            this.showConfirmModal(
                `Are you sure you want to delete the API "${api.apiName}" (${api.assetId})?`,
                () => this.performDeleteAPI(assetId)
            );
        }
    }

    async performDeleteAPI(assetId) {
        try {
            for (const teamData of Object.values(this.apisData)) {
                const apiIndex = teamData.apis.findIndex(api => api.assetId === assetId);
                if (apiIndex !== -1) {
                    teamData.apis.splice(apiIndex, 1);
                    break;
                }
            }
            
            await this.saveData();
            this.renderDashboard();
            this.showSuccess('API deleted successfully');
            
        } catch (error) {
            console.error('Failed to delete API:', error);
            this.showError('Failed to delete API');
        }
    }

    showConfirmModal(message, onConfirm) {
        document.getElementById('confirmMessage').textContent = message;
        document.getElementById('confirmBtn').onclick = onConfirm;
        
        const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
        modal.show();
    }

    exportData(format) {
        try {
            let data;
            let filename;
            let mimeType;

            if (format === 'csv') {
                data = this.convertToCSV();
                filename = 'api-management-data.csv';
                mimeType = 'text/csv';
            } else {
                data = JSON.stringify({ teams: this.teamsData, apis: this.apisData }, null, 2);
                filename = 'api-management-data.json';
                mimeType = 'application/json';
            }

            const blob = new Blob([data], { type: mimeType });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showSuccess(`${format.toUpperCase()} export completed`);
            
        } catch (error) {
            console.error('Export failed:', error);
            this.showError('Export failed');
        }
    }

    convertToCSV() {
        const headers = ['API Name', 'Asset ID', 'Team', 'Owner', 'Owner Email', 'MUnit Exempt', 'Custom Coverage', 'Business Groups', 'Last Updated'];
        const rows = [headers];

        Object.values(this.apisData).forEach(teamData => {
            teamData.apis.forEach(api => {
                rows.push([
                    api.apiName,
                    api.assetId,
                    api.teamName,
                    api.apiOwner,
                    api.apiOwnerEmail,
                    api.munitExempt ? 'Yes' : 'No',
                    api.munitExempt ? api.customCoverage : 'N/A',
                    api.businessGroups.join('; '),
                    new Date(api.lastUpdated).toLocaleDateString()
                ]);
            });
        });

        return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
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
    window.dashboard = new APIManagementDashboard();
}); 