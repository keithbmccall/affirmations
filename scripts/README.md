# Version Update Script

This script automatically updates the version number in both `app.json` and `ios/ScheduledAffirmations/Info.plist` files.

## Usage

### Using npm scripts (recommended)

```bash
# Update patch version (1.3.3 -> 1.3.4)
npm run version:patch

# Update minor version (1.3.3 -> 1.4.0)
npm run version:minor

# Update major version (1.3.3 -> 2.0.0)
npm run version:major
```

### Using the script directly

```bash
# Update patch version (1.3.3 -> 1.3.4)
node scripts/update-version.js patch

# Update minor version (1.3.3 -> 1.4.0)
node scripts/update-version.js minor

# Update major version (1.3.3 -> 2.0.0)
node scripts/update-version.js major
```

## Version Types

- **patch**: Increments the patch version (x.y.z -> x.y.z+1)
  - Use for bug fixes and small improvements
  - Example: 1.3.3 -> 1.3.4

- **minor**: Increments the minor version (x.y.z -> x.y+1.0)
  - Use for new features that are backward compatible
  - Example: 1.3.3 -> 1.4.0

- **major**: Increments the major version (x.y.z -> x+1.0.0)
  - Use for breaking changes or major updates
  - Example: 1.3.3 -> 2.0.0

## Features

- ✅ **Automatic file updates**: Updates both `app.json` and `Info.plist`
- ✅ **Version validation**: Ensures consistent version numbers across files
- ✅ **Error handling**: Comprehensive error messages and validation
- ✅ **Dry run safe**: Shows what will be updated before making changes
- ✅ **Help text**: Built-in usage instructions

## Files Updated

The script updates the following files:

1. **`app.json`**: Updates `expo.version`
2. **`ios/ScheduledAffirmations/Info.plist`**: Updates `CFBundleShortVersionString`

## Error Handling

The script includes comprehensive error handling for:

- Invalid version formats
- Missing files
- Version inconsistencies
- Invalid version type arguments

## Example Output

```
📋 Current version: 1.3.3
🚀 Updating to version: 1.3.4
✅ Updated app.json: 1.3.3 -> 1.3.4
✅ Updated Info.plist: 1.3.3 -> 1.3.4
🔍 Validating version consistency...
✅ All files have consistent version numbers

🎉 Version update completed successfully!
   1.3.3 -> 1.3.4

Next steps:
  1. Review the changes
  2. Commit the version update
  3. Build and test your app
  4. Create a release if needed
```

## Integration with Git

After running the version update script:

1. Review the changes: `git diff`
2. Commit the version update: `git add . && git commit -m "Bump version to X.X.X"`
3. Tag the release: `git tag vX.X.X`
4. Push changes: `git push && git push --tags`

## Troubleshooting

### Version mismatch errors

If you get version mismatch errors, ensure all files have the same version number before running the script.

### Permission errors

Make sure the script has execute permissions:

```bash
chmod +x scripts/update-version.js
```

### File not found errors

Ensure you're running the script from the project root directory.
