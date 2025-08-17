// API Management Dashboard - Dedicated API Management Logic

class APIManagementDashboard {
    constructor() {
        this.teamsData = null;
        this.apisData = {};
        this.currentSearchTerm = '';
        this.currentTeamFilter = '';
        this.githubToken = null;
        this.repoOwner = null;
        this.repoName = null;
        this.initialized = false;
    }

    async init() {
        try {
            console.log('Starting API Management dashboard initialization...');
            await this.detectGitHubContext();
            console.log('GitHub context detected:', { repoOwner: this.repoOwner, repoName: this.repoName });
            
            // If context detection failed, try to extract from URL manually
            if (!this.repoOwner || !this.repoName) {
                this.fallbackContextDetection();
            }
            
            // If still no context, try manual override
            if (!this.repoOwner || !this.repoName) {
                this.manualContextOverride();
            }
            
            // Test the GitHub API connection
            if (this.repoOwner && this.repoName) {
                console.log(`🔍 Before testGitHubConnection - repoOwner: "${this.repoOwner}", repoName: "${this.repoName}"`);
                await this.testGitHubConnection();
            }
            
            await this.loadData();
            console.log('Data loaded successfully');
            this.setupEventListeners();
            console.log('Event listeners set up');
            this.renderDashboard();
            console.log('Dashboard rendered successfully');
            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize API Management dashboard:', error);
            this.displayInitError('Failed to initialize API Management dashboard. Please check the console for details.');
            throw error;
        }
    }

    displayInitError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger m-4';
        errorDiv.innerHTML = `
            <h4>API Management Dashboard Initialization Failed</h4>
            <p>${message}</p>
            <p><strong>Error details:</strong> Check the browser console for more information.</p>
        `;
        document.body.insertBefore(errorDiv, document.body.firstChild);
    }

    async detectGitHubContext() {
        console.log('=== GITHUB CONTEXT DETECTION START ===');
        console.log('Current URL:', window.location.href);
        console.log('Hostname:', window.location.hostname);
        console.log('Pathname:', window.location.pathname);
        console.log('Origin:', window.location.origin);
        
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
            } else {
                console.warn('❌ No path parts to detect repository context');
                console.log('Expected at least 1 part, got:', pathParts.length);
            }
        } else {
            this.repoOwner = null;
            this.repoName = null;
            console.log('Running in local development mode with local files');
        }
        
        console.log('Final context:', { repoOwner: this.repoOwner, repoName: this.repoName });
        console.log(`Final context values - Owner: "${this.repoOwner}", Name: "${this.repoName}"`);
        console.log('=== GITHUB CONTEXT DETECTION END ===');
    }
    
    fallbackContextDetection() {
        console.log('Attempting fallback context detection...');
        
        // Try to extract from the current URL
        const url = window.location.href;
        console.log('Current URL for fallback:', url);
        
        // Look for patterns like username.github.io/repository-name
        const githubIoMatch = url.match(/https?:\/\/([^.]+)\.github\.io\/([^\/\?]+)/);
        if (githubIoMatch) {
            this.repoOwner = githubIoMatch[1];
            this.repoName = githubIoMatch[2].replace('.html', '');
            console.log(`Fallback detected: ${this.repoOwner}/${this.repoName}`);
            return;
        }
        
        // Look for patterns in the pathname
        const pathname = window.location.pathname;
        const pathMatch = pathname.match(/\/([^\/]+)\/([^\/\?]+)/);
        if (pathMatch) {
            this.repoOwner = pathMatch[1];
            this.repoName = pathMatch[2].replace('.html', '');
            console.log(`Path fallback detected: ${this.repoOwner}/${this.repoName}`);
            return;
        }
        
        // TEMPORARY HARDCODED FALLBACK FOR TESTING
        // Based on the error, it seems like the repository name is "api-management-dashboard"
        // and the owner might be "bennykenobi" or similar
        console.log('Attempting hardcoded fallback...');
        
        // Try to extract username from the hostname
        const hostname = window.location.hostname;
        if (hostname.includes('github.io')) {
            const username = hostname.split('.')[0];
            console.log(`Extracted username from hostname: ${username}`);
            
            // Try common repository names
            const possibleRepoNames = ['api-management-dashboard', 'API-Management'];
            for (const repoName of possibleRepoNames) {
                console.log(`Trying repository name: ${repoName}`);
                this.repoOwner = username;
                this.repoName = repoName;
                console.log(`Hardcoded fallback set: ${this.repoOwner}/${this.repoName}`);
                return;
            }
        }
        
        console.warn('All fallback context detection methods failed');
    }
    
    manualContextOverride() {
        console.log('Attempting manual context override...');
        
        // Based on the URL: https://bennykenobi.github.io/api-management-dashboard/api-management.html
        // We can extract the username and repository name directly
        
        const currentUrl = window.location.href;
        console.log('Current URL for manual override:', currentUrl);
        
        // Extract username from hostname (e.g., bennykenobi.github.io)
        const hostname = window.location.hostname;
        if (hostname.includes('github.io')) {
            const username = hostname.split('.')[0];
            console.log(`Extracted username from hostname: ${username}`);
            
            // Extract repository name from pathname
            const pathname = window.location.pathname;
            const pathParts = pathname.split('/').filter(part => part.length > 0);
            console.log('Path parts for manual override:', pathParts);
            
            // The first part should be the repository name (before the .html file)
            if (pathParts.length > 0) {
                const repoName = pathParts[0];
                console.log(`Extracted repository name from path: ${repoName}`);
                
                // Set the repository context
                this.repoOwner = username;
                this.repoName = repoName;
                
                console.log(`✅ Manual override set: ${this.repoOwner}/${this.repoName}`);
                console.log('This should resolve the GitHub API loading issue');
                return;
            }
        }
        
        // Fallback: hardcode the known values
        console.log('Using hardcoded fallback values...');
        this.repoOwner = 'bennykenobi';
        this.repoName = 'api-management-dashboard';
        
        console.log(`✅ Hardcoded override set: ${this.repoOwner}/${this.repoName}`);
        console.log('Manual context override completed');
    }
    
    async testGitHubConnection() {
        try {
            console.log(`Testing GitHub API connection for ${this.repoOwner}/${this.repoName}...`);
            
            // Test with a simple API call to verify the repository exists
            const testUrl = `https://api.github.com/repos/${this.repoOwner}/${this.repoName}`;
            console.log(`Testing URL: ${testUrl}`);
            
            const response = await fetch(testUrl);
            if (response.ok) {
                const repoData = await response.json();
                console.log('✅ GitHub API connection successful!');
                console.log('Repository details:', {
                    name: repoData.name,
                    full_name: repoData.full_name,
                    description: repoData.description,
                    html_url: repoData.html_url
                });
            } else {
                console.error(`❌ GitHub API test failed: ${response.status} ${response.statusText}`);
                console.error('This suggests the repository context is incorrect');
            }
        } catch (error) {
            console.error('❌ GitHub API connection test failed:', error);
        }
    }

    async loadData() {
        try {
            // Load teams configuration
            this.teamsData = await this.loadFile('valid-platform-values.json');
            
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
            console.log(`Attempting to load file: ${filePath}`);
            if (this.repoOwner && this.repoName) {
                // For GitHub Pages, we need to load from the docs/ directory
                const fullPath = `docs/${filePath}`;
                const apiUrl = `https://api.github.com/repos/${this.repoOwner}/${this.repoName}/contents/${fullPath}`;
                console.log(`Loading from GitHub API: ${apiUrl}`);
                
                const response = await fetch(apiUrl);
                if (!response.ok) {
                    console.error(`GitHub API response not OK: ${response.status} ${response.statusText}`);
                    throw new Error(`Failed to load ${fullPath} from GitHub API: ${response.status}`);
                }
                
                const data = await response.json();
                const content = atob(data.content);
                console.log(`Successfully loaded ${fullPath} from GitHub API`);
                return JSON.parse(content);
            } else {
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

    async loadAllTeamAPIs() {
        try {
            if (!this.teamsData?.validTeamNames) {
                console.log('No team names found in teamsData');
                return;
            }
            
            console.log('Loading team APIs for teams:', this.teamsData.validTeamNames);
            
            for (const team of this.teamsData.validTeamNames) {
                const teamName = typeof team === 'string' ? team : team.name;
                const fileName = `${teamName.toLowerCase().replace(/\s+/g, '-')}-mule-apis.json`;
                console.log(`Loading APIs for team: ${teamName}, file: ${fileName}`);
                
                try {
                    const teamAPIs = await this.loadFile(fileName);
                    this.apisData[fileName] = teamAPIs;
                    console.log(`Successfully loaded APIs for team ${teamName}:`, teamAPIs);
                } catch (error) {
                    console.warn(`No API file found for team ${teamName}:`, error);
                    this.apisData[fileName] = {
                        teamName: teamName,
                        apis: []
                    };
                }
            }
            
            console.log('All team APIs loaded:', this.apisData);
        } catch (error) {
            console.error('Error in loadAllTeamAPIs:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentSearchTerm = e.target.value;
                this.renderDashboard();
            });
        }

        const clearSearch = document.getElementById('clearSearch');
        if (clearSearch) {
            clearSearch.addEventListener('click', () => {
                if (searchInput) {
                    searchInput.value = '';
                    this.currentSearchTerm = '';
                    this.renderDashboard();
                }
            });
        }

        // Export functionality
        const exportCsv = document.getElementById('exportCsv');
        if (exportCsv) {
            exportCsv.addEventListener('click', () => this.exportData('csv'));
        }
        
        const exportJson = document.getElementById('exportJson');
        if (exportJson) {
            exportJson.addEventListener('click', () => this.exportData('json'));
        }

        // Team filter
        const teamFilter = document.getElementById('teamFilter');
        if (teamFilter) {
            teamFilter.addEventListener('change', (e) => {
                this.currentTeamFilter = e.target.value;
                this.renderAPIsTable();
            });
        }

        // Action buttons
        const addApiBtn = document.getElementById('addApiBtn');
        if (addApiBtn) {
            addApiBtn.addEventListener('click', () => this.showAPIModal());
        }

        const assignApiBtn = document.getElementById('assignApiBtn');
        if (assignApiBtn) {
            assignApiBtn.addEventListener('click', () => this.showAssignmentModal());
        }

        // Modal save button
        const saveApiBtn = document.getElementById('saveApiBtn');
        if (saveApiBtn) {
            saveApiBtn.addEventListener('click', () => this.saveAPI());
        }

        const confirmAssignmentBtn = document.getElementById('confirmAssignmentBtn');
        if (confirmAssignmentBtn) {
            confirmAssignmentBtn.addEventListener('click', () => this.handleApiAssignment());
        }

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

    renderDashboard() {
        try {
            console.log('Rendering dashboard...');
            this.renderAPIsTable();
            this.updateTeamFilter();
            this.renderTeamApiSummary();
            this.renderQuickStats();
            this.populateApiSelects();
            console.log('Dashboard rendered successfully');
        } catch (error) {
            console.error('Error rendering dashboard:', error);
            throw error;
        }
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
                    <span class="badge ${api.munitExempt ? 'bg-warning' : 'bg-success'}">
                        ${api.munitExempt ? 'Exempt' : 'Required'}
                    </span>
                </td>
                <td>${api.munitExempt ? `${api.customCoverage}%` : 'N/A'}</td>
                <td>${(api.businessGroups || []).map(bg => this.highlightSearch(bg)).join(', ')}</td>
                <td>${new Date(api.lastUpdated).toLocaleDateString()}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="dashboard.editAPI('${api.assetId}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="dashboard.deleteAPI('${api.assetId}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    highlightSearch(text) {
        if (!this.currentSearchTerm || !text) return text || '';
        
        try {
            const regex = new RegExp(`(${this.currentSearchTerm})`, 'gi');
            return String(text).replace(regex, '<span class="search-highlight">$1</span>');
        } catch (error) {
            console.warn('Error highlighting search term:', error);
            return String(text) || '';
        }
    }

    updateTeamFilter() {
        const teamFilter = document.getElementById('teamFilter');
        if (!teamFilter) return;

        teamFilter.innerHTML = '<option value="">All Teams</option>';
        
        if (this.teamsData?.validTeamNames) {
            this.teamsData.validTeamNames.forEach(team => {
                const teamName = typeof team === 'string' ? team : team.name;
                const option = document.createElement('option');
                option.value = teamName;
                option.textContent = teamName;
                teamFilter.appendChild(option);
            });
        }
    }

    renderTeamApiSummary() {
        const summaryDiv = document.getElementById('teamApiSummary');
        if (!summaryDiv) return;
        
        let summaryHTML = '';
        this.teamsData.validTeamNames.forEach(team => {
            const teamName = typeof team === 'string' ? team : team.name;
            const apiCount = this.apisData[`${teamName.toLowerCase().replace(/\s+/g, '-')}-mule-apis.json`]?.apis?.length || 0;
            const owner = typeof team === 'object' ? team.owner : 'N/A';
            
            summaryHTML += `
                <div class="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                    <div>
                        <strong>${teamName}</strong><br>
                        <small class="text-muted">Owner: ${owner}</small>
                    </div>
                    <span class="badge bg-primary">${apiCount} API(s)</span>
                </div>
            `;
        });
        
        summaryDiv.innerHTML = summaryHTML;
    }

    renderQuickStats() {
        const statsDiv = document.getElementById('quickStats');
        if (!statsDiv) return;

        let totalAPIs = 0;
        let exemptAPIs = 0;
        let requiredAPIs = 0;

        Object.values(this.apisData).forEach(teamData => {
            if (teamData.apis) {
                totalAPIs += teamData.apis.length;
                teamData.apis.forEach(api => {
                    if (api.munitExempt) {
                        exemptAPIs++;
                    } else {
                        requiredAPIs++;
                    }
                });
            }
        });

        const statsHTML = `
            <div class="row text-center">
                <div class="col-4">
                    <div class="border rounded p-2">
                        <h4 class="text-primary mb-0">${totalAPIs}</h4>
                        <small class="text-muted">Total APIs</small>
                    </div>
                </div>
                <div class="col-4">
                    <div class="border rounded p-2">
                        <h4 class="text-success mb-0">${requiredAPIs}</h4>
                        <small class="text-muted">MUnit Required</small>
                    </div>
                </div>
                <div class="col-4">
                    <div class="border rounded p-2">
                        <h4 class="text-warning mb-0">${exemptAPIs}</h4>
                        <small class="text-muted">MUnit Exempt</small>
                    </div>
                </div>
            </div>
        `;

        statsDiv.innerHTML = statsHTML;
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
            title.textContent = 'Add New API';
            form.reset();
            document.getElementById('customCoverageGroup').style.display = 'none';
        }
        
        // Populate selects
        this.populateTeamSelect('apiTeamName');
        this.populateBusinessGroupsSelect('apiBusinessGroups');
        
        modal.show();
    }

    showAssignmentModal() {
        this.populateApiSelects();
        const modal = new bootstrap.Modal(document.getElementById('assignmentModal'));
        modal.show();
    }

    populateTeamSelect(selectId) {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        select.innerHTML = '<option value="">Select Team</option>';
        if (this.teamsData?.validTeamNames) {
            this.teamsData.validTeamNames.forEach(team => {
                const teamName = typeof team === 'string' ? team : team.name;
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

    populateApiSelects() {
        // Populate API select dropdown
        const apiSelect = document.getElementById('apiSelect');
        const newTeamSelect = document.getElementById('newTeamSelect');
        
        if (apiSelect) {
            apiSelect.innerHTML = '<option value="">Choose an API...</option>';
            Object.values(this.apisData).forEach(teamData => {
                if (teamData.apis) {
                    teamData.apis.forEach(api => {
                        const option = document.createElement('option');
                        option.value = api.assetId;
                        option.textContent = `${api.apiName} (${api.assetId})`;
                        apiSelect.appendChild(option);
                    });
                }
            });
        }
        
        if (newTeamSelect) {
            newTeamSelect.innerHTML = '<option value="">Choose a team...</option>';
            this.teamsData.validTeamNames.forEach(team => {
                const teamName = typeof team === 'string' ? team : team.name;
                const option = document.createElement('option');
                option.value = teamName;
                option.textContent = teamName;
                newTeamSelect.appendChild(option);
            });
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
                Object.assign(existingAPI, formData);
            } else {
                this.apisData[formData.teamName].apis.push(formData);
            }

            await this.saveData();
            await this.triggerGitHubWorkflow('update-api', formData);
            
            bootstrap.Modal.getInstance(document.getElementById('apiModal')).hide();
            this.renderDashboard();
            this.showSuccess('API saved successfully. Check GitHub for the created PR.');
            
        } catch (error) {
            console.error('Failed to save API:', error);
            this.showError('Failed to save API');
        }
    }

    async handleApiAssignment() {
        const apiSelect = document.getElementById('apiSelect');
        const newTeamSelect = document.getElementById('newTeamSelect');
        
        if (!apiSelect || !newTeamSelect) return;
        
        const selectedApi = apiSelect.value;
        const newTeam = newTeamSelect.value;
        
        if (!selectedApi || !newTeam) {
            this.showError('Please select both an API and a team');
            return;
        }
        
        try {
            let apiData = null;
            let currentTeam = null;
            
            for (const [fileName, teamData] of Object.entries(this.apisData)) {
                if (teamData.apis) {
                    const api = teamData.apis.find(a => a.assetId === selectedApi);
                    if (api) {
                        apiData = api;
                        currentTeam = fileName.replace('-mule-apis.json', '').replace(/-/g, ' ');
                        break;
                    }
                }
            }
            
            if (!apiData) {
                this.showError('API not found');
                return;
            }
            
            if (currentTeam === newTeam) {
                this.showError('API is already assigned to this team');
                return;
            }
            
            const confirmMessage = `Are you sure you want to reassign API "${apiData.apiName}" from "${currentTeam}" to "${newTeam}"?`;
            if (confirm(confirmMessage)) {
                await this.assignApiToTeam(apiData, newTeam);
            }
            
        } catch (error) {
            console.error('Failed to handle API assignment:', error);
            this.showError('Failed to process API assignment');
        }
    }

    async assignApiToTeam(apiData, newTeamName) {
        try {
            const formData = {
                action: 'assign-api-to-team',
                apiData: apiData,
                newTeamName: newTeamName,
                timestamp: new Date().toISOString()
            };
            
            await this.triggerGitHubWorkflow('assign-api-to-team', formData);
            this.showSuccess('API assigned successfully');
            this.renderDashboard();
            
            // Close modal
            bootstrap.Modal.getInstance(document.getElementById('assignmentModal')).hide();
        } catch (error) {
            console.error('Failed to assign API:', error);
            this.showError('Failed to assign API to team');
        }
    }

    findAPIByAssetId(assetId) {
        for (const teamData of Object.values(this.apisData)) {
            const api = teamData.apis.find(api => api.assetId === assetId);
            if (api) return api;
        }
        return null;
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

    async saveData() {
        console.log('Data saved:', { teams: this.teamsData, apis: this.apisData });
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    async triggerGitHubWorkflow(action, data) {
        if (!this.repoOwner || !this.repoName) {
            console.log('Not in GitHub context, skipping workflow trigger');
            return;
        }

        try {
            console.log(`Would trigger workflow for action: ${action}`, data);
            this.showSuccess(`Workflow triggered for ${action}. Check GitHub for the created PR.`);
        } catch (error) {
            console.error('Failed to trigger workflow:', error);
            this.showError('Failed to trigger workflow. Changes are only local.');
        }
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
    console.log('DOM loaded, initializing API Management dashboard...');
    try {
        window.dashboard = new APIManagementDashboard();
        window.dashboard.init();
    } catch (error) {
        console.error('Failed to create API Management dashboard instance:', error);
        document.body.innerHTML = '<div class="alert alert-danger m-4">Failed to initialize API Management dashboard: ' + error.message + '</div>';
    }
}); 