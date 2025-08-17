#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Test configuration
const VALUES_FILE = 'src/data/valid-platform-values.json';
const BACKUP_FILE = 'src/data/valid-platform-values.backup.json';

// Test data
const testCases = [
  {
    name: 'Add new team name',
    action: 'add',
    arrayType: 'teamNames',
    value: 'Test Team Alpha',
    expected: true
  },
  {
    name: 'Add new CMDB group',
    action: 'add',
    arrayType: 'cmdbGroups',
    value: 'TEST_TEAM_ALPHA',
    expected: true
  },
  {
    name: 'Add new business group',
    action: 'add',
    arrayType: 'businessGroups',
    value: 'Test Business Unit',
    expected: true
  },
  {
    name: 'Add duplicate team name (should fail)',
    action: 'add',
    arrayType: 'teamNames',
    value: 'Platform Team', // Already exists
    expected: false
  },
  {
    name: 'Delete existing team name',
    action: 'delete',
    arrayType: 'teamNames',
    value: 'Test Team Alpha',
    expected: true
  },
  {
    name: 'Delete non-existent value (should fail)',
    action: 'delete',
    arrayType: 'teamNames',
    value: 'Non Existent Team',
    expected: false
  }
];

// Helper functions
function loadValues() {
  try {
    const data = fs.readFileSync(VALUES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading values file:', error.message);
    return null;
  }
}

function saveValues(data) {
  try {
    fs.writeFileSync(VALUES_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving values file:', error.message);
    return false;
  }
}

function backupValues() {
  try {
    const data = loadValues();
    if (data) {
      fs.writeFileSync(BACKUP_FILE, JSON.stringify(data, null, 2));
      console.log('✅ Backup created');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error creating backup:', error.message);
    return false;
  }
}

function restoreValues() {
  try {
    if (fs.existsSync(BACKUP_FILE)) {
      fs.copyFileSync(BACKUP_FILE, VALUES_FILE);
      fs.unlinkSync(BACKUP_FILE);
      console.log('✅ Values restored from backup');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error restoring values:', error.message);
    return false;
  }
}

// Test functions
function testAddValue(arrayType, value) {
  console.log(`\n🧪 Testing ADD: ${arrayType} = "${value}"`);
  
  const data = loadValues();
  if (!data) return false;
  
  // Determine array key
  let arrayKey;
  switch (arrayType) {
    case 'teamNames':
      arrayKey = 'validTeamNames';
      break;
    case 'cmdbGroups':
      arrayKey = 'validCmdbTeamNames';
      break;
    case 'businessGroups':
      arrayKey = 'validBusinessGroups';
      break;
    default:
      console.log('❌ Invalid array type');
      return false;
  }
  
  // Check for duplicates
  if (data[arrayKey].includes(value)) {
    console.log(`❌ Value "${value}" already exists in ${arrayKey}`);
    return false;
  }
  
  // Add the value
  data[arrayKey].push(value);
  
  // Save updated data
  if (saveValues(data)) {
    console.log(`✅ Added "${value}" to ${arrayKey}`);
    return true;
  } else {
    console.log('❌ Failed to save data');
    return false;
  }
}

function testDeleteValue(arrayType, value) {
  console.log(`\n🧪 Testing DELETE: ${arrayType} = "${value}"`);
  
  const data = loadValues();
  if (!data) return false;
  
  // Determine array key
  let arrayKey;
  switch (arrayType) {
    case 'teamNames':
      arrayKey = 'validTeamNames';
      break;
    case 'cmdbGroups':
      arrayKey = 'validCmdbTeamNames';
      break;
    case 'businessGroups':
      arrayKey = 'validBusinessGroups';
      break;
    default:
      console.log('❌ Invalid array type');
      return false;
  }
  
  // Check if value exists
  if (!data[arrayKey].includes(value)) {
    console.log(`❌ Value "${value}" does not exist in ${arrayKey}`);
    return false;
  }
  
  // Check for dependencies if deleting team name
  if (arrayKey === 'validTeamNames') {
    const teamFile = `src/data/${value.toLowerCase().replace(/\s+/g, '-')}-mule-apis.json`;
    if (fs.existsSync(teamFile)) {
      console.log(`⚠️  Warning: Team "${value}" has API files. Consider redistributing APIs first.`);
    }
  }
  
  // Remove the value
  data[arrayKey] = data[arrayKey].filter(item => item !== value);
  
  // Save updated data
  if (saveValues(data)) {
    console.log(`✅ Deleted "${value}" from ${arrayKey}`);
    return true;
  } else {
    console.log('❌ Failed to save data');
    return false;
  }
}

// Main test execution
async function runTests() {
  console.log('🚀 Starting Workflow Functionality Tests\n');
  
  // Create backup
  if (!backupValues()) {
    console.log('❌ Cannot proceed without backup');
    return;
  }
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  for (const testCase of testCases) {
    console.log(`\n📋 Test: ${testCase.name}`);
    
    let result = false;
    if (testCase.action === 'add') {
      result = testAddValue(testCase.arrayType, testCase.value);
    } else if (testCase.action === 'delete') {
      result = testDeleteValue(testCase.arrayType, testCase.value);
    }
    
    if (result === testCase.expected) {
      console.log(`✅ PASS: Expected ${testCase.expected}, got ${result}`);
      passedTests++;
    } else {
      console.log(`❌ FAIL: Expected ${testCase.expected}, got ${result}`);
    }
    
    // Show current state
    const currentData = loadValues();
    if (currentData) {
      console.log(`   Current ${testCase.arrayType}: [${currentData[`valid${testCase.arrayType.charAt(0).toUpperCase() + testCase.arrayType.slice(1)}`].join(', ')}]`);
    }
  }
  
  // Test summary
  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed! The workflow logic is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please review the logic.');
  }
  
  // Restore original values
  restoreValues();
  
  console.log('\n✨ Testing complete!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testAddValue, testDeleteValue, loadValues, saveValues }; 