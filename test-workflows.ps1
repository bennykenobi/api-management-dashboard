# Test script for workflow functionality
$VALUES_FILE = "src/data/valid-platform-values.json"
$BACKUP_FILE = "src/data/valid-platform-values.backup.json"

# Test cases
$testCases = @(
    @{
        name = "Add new team name"
        action = "add"
        arrayType = "teamNames"
        value = "Test Team Alpha"
        expected = $true
    },
    @{
        name = "Add new CMDB group"
        action = "add"
        arrayType = "cmdbGroups"
        value = "TEST_TEAM_ALPHA"
        expected = $true
    },
    @{
        name = "Add duplicate team name (should fail)"
        action = "add"
        arrayType = "teamNames"
        value = "Platform Team"
        expected = $false
    }
)

# Helper functions
function Get-Values {
    try {
        $content = Get-Content $VALUES_FILE -Raw
        return $content | ConvertFrom-Json
    }
    catch {
        Write-Host "Error loading values file: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

function Save-Values {
    param($data)
    try {
        $data | ConvertTo-Json -Depth 10 | Set-Content $VALUES_FILE
        return $true
    }
    catch {
        Write-Host "Error saving values file: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Backup-Values {
    try {
        $data = Get-Values
        if ($data) {
            $data | ConvertTo-Json -Depth 10 | Set-Content $BACKUP_FILE
            Write-Host "Backup created" -ForegroundColor Green
            return $true
        }
        return $false
    }
    catch {
        Write-Host "Error creating backup: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Restore-Values {
    try {
        if (Test-Path $BACKUP_FILE) {
            Copy-Item $BACKUP_FILE $VALUES_FILE
            Remove-Item $BACKUP_FILE
            Write-Host "Values restored from backup" -ForegroundColor Green
            return $true
        }
        return $false
    }
    catch {
        Write-Host "Error restoring values: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Test functions
function Test-AddValue {
    param($arrayType, $value)
    
    Write-Host "`nTesting ADD: $arrayType = `"$value`"" -ForegroundColor Cyan
    
    $data = Get-Values
    if (-not $data) { return $false }
    
    # Determine array key
    $arrayKey = switch ($arrayType) {
        "teamNames" { "validTeamNames" }
        "cmdbGroups" { "validCmdbTeamNames" }
        "businessGroups" { "validBusinessGroups" }
        default { 
            Write-Host "Invalid array type" -ForegroundColor Red
            return $false
        }
    }
    
    # Check for duplicates
    if ($data.$arrayKey -contains $value) {
        Write-Host "Value `"$value`" already exists in $arrayKey" -ForegroundColor Red
        return $false
    }
    
    # Add the value
    $data.$arrayKey += $value
    
    # Save updated data
    if (Save-Values $data) {
        Write-Host "Added `"$value`" to $arrayKey" -ForegroundColor Green
        return $true
    } else {
        Write-Host "Failed to save data" -ForegroundColor Red
        return $false
    }
}

# Main test execution
function Start-Tests {
    Write-Host "Starting Workflow Functionality Tests`n" -ForegroundColor Green
    
    # Create backup
    if (-not (Backup-Values)) {
        Write-Host "Cannot proceed without backup" -ForegroundColor Red
        return
    }
    
    $passedTests = 0
    $totalTests = $testCases.Count
    
    foreach ($testCase in $testCases) {
        Write-Host "`nTest: $($testCase.name)" -ForegroundColor White
        
        $result = $false
        if ($testCase.action -eq "add") {
            $result = Test-AddValue $testCase.arrayType $testCase.value
        }
        
        if ($result -eq $testCase.expected) {
            Write-Host "PASS: Expected $($testCase.expected), got $result" -ForegroundColor Green
            $passedTests++
        } else {
            Write-Host "FAIL: Expected $($testCase.expected), got $result" -ForegroundColor Red
        }
        
        # Show current state
        $currentData = Get-Values
        if ($currentData) {
            $arrayKey = switch ($testCase.arrayType) {
                "teamNames" { "validTeamNames" }
                "cmdbGroups" { "validCmdbTeamNames" }
                "businessGroups" { "validBusinessGroups" }
            }
            $currentValues = $currentData.$arrayKey -join ", "
            Write-Host "   Current $($testCase.arrayType): [$currentValues]" -ForegroundColor Gray
        }
    }
    
    # Test summary
    Write-Host "`nTest Results: $passedTests/$totalTests tests passed" -ForegroundColor White
    
    if ($passedTests -eq $totalTests) {
        Write-Host "All tests passed! The workflow logic is working correctly." -ForegroundColor Green
    } else {
        Write-Host "Some tests failed. Please review the logic." -ForegroundColor Yellow
    }
    
    # Restore original values
    Restore-Values
    
    Write-Host "`nTesting complete!" -ForegroundColor Green
}

# Run tests
Start-Tests 