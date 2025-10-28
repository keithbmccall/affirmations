#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Version Update Script for Scheduled Affirmations
 *
 * Usage:
 *   node scripts/update-version.js patch   # 1.3.3 -> 1.3.4
 *   node scripts/update-version.js minor   # 1.3.3 -> 1.4.0
 *   node scripts/update-version.js major   # 1.3.3 -> 2.0.0
 */

const VERSION_TYPES = {
  PATCH: 'patch',
  MINOR: 'minor',
  MAJOR: 'major',
};

const FILES_TO_UPDATE = ['app.json', 'ios/ScheduledAffirmations/Info.plist'];

/**
 * Parse version string into major, minor, patch components
 * @param {string} version - Version string (e.g., "1.3.3")
 * @returns {Object} - { major, minor, patch }
 */
function parseVersion(version) {
  const parts = version.split('.').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    throw new Error(`Invalid version format: ${version}. Expected format: x.y.z`);
  }
  return {
    major: parts[0],
    minor: parts[1],
    patch: parts[2],
  };
}

/**
 * Increment version based on type
 * @param {string} currentVersion - Current version string
 * @param {string} type - Version type to increment (patch, minor, major)
 * @returns {string} - New version string
 */
function incrementVersion(currentVersion, type) {
  const { major, minor, patch } = parseVersion(currentVersion);

  switch (type) {
    case VERSION_TYPES.PATCH:
      return `${major}.${minor}.${patch + 1}`;
    case VERSION_TYPES.MINOR:
      return `${major}.${minor + 1}.0`;
    case VERSION_TYPES.MAJOR:
      return `${major + 1}.0.0`;
    default:
      throw new Error(
        `Invalid version type: ${type}. Must be one of: ${Object.values(VERSION_TYPES).join(', ')}`
      );
  }
}

/**
 * Update version in app.json
 * @param {string} newVersion - New version string
 */
function updateAppJson(newVersion) {
  const appJsonPath = path.join(process.cwd(), 'app.json');

  if (!fs.existsSync(appJsonPath)) {
    throw new Error('app.json not found');
  }

  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  const oldVersion = appJson.expo.version;

  appJson.expo.version = newVersion;

  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');
  console.log(`✅ Updated app.json: ${oldVersion} -> ${newVersion}`);
}

/**
 * Update version in Info.plist
 * @param {string} newVersion - New version string
 */
function updateInfoPlist(newVersion) {
  const infoPlistPath = path.join(process.cwd(), 'ios/ScheduledAffirmations/Info.plist');

  if (!fs.existsSync(infoPlistPath)) {
    throw new Error('Info.plist not found');
  }

  let plistContent = fs.readFileSync(infoPlistPath, 'utf8');

  // Update CFBundleShortVersionString
  const versionRegex = /(<key>CFBundleShortVersionString<\/key>\s*<string>)([^<]+)(<\/string>)/;
  const match = plistContent.match(versionRegex);

  if (!match) {
    throw new Error('CFBundleShortVersionString not found in Info.plist');
  }

  const oldVersion = match[2];
  plistContent = plistContent.replace(versionRegex, `$1${newVersion}$3`);

  fs.writeFileSync(infoPlistPath, plistContent);
  console.log(`✅ Updated Info.plist: ${oldVersion} -> ${newVersion}`);
}

/**
 * Get current version from app.json
 * @returns {string} - Current version string
 */
function getCurrentVersion() {
  const appJsonPath = path.join(process.cwd(), 'app.json');

  if (!fs.existsSync(appJsonPath)) {
    throw new Error('app.json not found');
  }

  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  return appJson.expo.version;
}

/**
 * Validate that all files have consistent version numbers
 * @param {string} expectedVersion - Expected version string
 */
function validateVersionConsistency(expectedVersion) {
  console.log('🔍 Validating version consistency...');

  // Check app.json
  const appJsonVersion = getCurrentVersion();
  if (appJsonVersion !== expectedVersion) {
    throw new Error(
      `Version mismatch in app.json: expected ${expectedVersion}, got ${appJsonVersion}`
    );
  }

  // Check Info.plist
  const infoPlistPath = path.join(process.cwd(), 'ios/ScheduledAffirmations/Info.plist');
  if (fs.existsSync(infoPlistPath)) {
    const plistContent = fs.readFileSync(infoPlistPath, 'utf8');
    const versionMatch = plistContent.match(
      /<key>CFBundleShortVersionString<\/key>\s*<string>([^<]+)<\/string>/
    );

    if (versionMatch && versionMatch[1] !== expectedVersion) {
      throw new Error(
        `Version mismatch in Info.plist: expected ${expectedVersion}, got ${versionMatch[1]}`
      );
    }
  }

  console.log('✅ All files have consistent version numbers');
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('📦 Version Update Script for Scheduled Affirmations');
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/update-version.js patch   # 1.3.3 -> 1.3.4');
    console.log('  node scripts/update-version.js minor   # 1.3.3 -> 1.4.0');
    console.log('  node scripts/update-version.js major   # 1.3.3 -> 2.0.0');
    console.log('');
    console.log('Available version types:');
    console.log('  patch  - Increment patch version (x.y.z -> x.y.z+1)');
    console.log('  minor  - Increment minor version (x.y.z -> x.y+1.0)');
    console.log('  major  - Increment major version (x.y.z -> x+1.0.0)');
    process.exit(1);
  }

  const versionType = args[0].toLowerCase();

  try {
    // Get current version
    const currentVersion = getCurrentVersion();
    console.log(`📋 Current version: ${currentVersion}`);

    // Calculate new version
    const newVersion = incrementVersion(currentVersion, versionType);
    console.log(`🚀 Updating to version: ${newVersion}`);

    // Update files
    updateAppJson(newVersion);
    updateInfoPlist(newVersion);

    // Validate consistency
    validateVersionConsistency(newVersion);

    console.log('');
    console.log('🎉 Version update completed successfully!');
    console.log(`   ${currentVersion} -> ${newVersion}`);
    console.log('');
    console.log('Next steps:');
    console.log('  1. Review the changes');
    console.log('  2. Commit the version update');
    console.log('  3. Build and test your app');
    console.log('  4. Create a release if needed');
  } catch (error) {
    console.error('❌ Error updating version:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  parseVersion,
  incrementVersion,
  updateAppJson,
  updateInfoPlist,
  getCurrentVersion,
  validateVersionConsistency,
};
