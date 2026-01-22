# iOS App Store Deployment Guide

**Version**: 1.0.0  
**Last Updated**: January 22, 2026

---

## 📋 Prerequisites

### Requirements
- macOS (Xcode required)
- Apple Developer Account ($99/year)
- iPhone or iPad for testing
- Xcode 14.0+
- CocoaPods installed
- Valid Apple ID

### Accounts & Certificates
1. **Apple Developer Account** - https://developer.apple.com
2. **App Store Connect** - https://appstoreconnect.apple.com
3. Valid code signing certificates
4. Provisioning profiles

---

## 🔑 Step 1: Set Up Apple Developer Account

### Create Apple Developer Account
1. Go to https://developer.apple.com
2. Click "Account" → Sign In or Create Account
3. Complete enrollment process ($99/year)
4. Accept Apple Developer Agreement

### Create App ID
1. Go to App Store Connect → My Apps
2. Click "Create an App"
3. Fill in app details:
   - **App Name**: ELIMUCORE Teacher
   - **Primary Language**: English
   - **Bundle ID**: com.elimucore.teacher (unique)
   - **SKU**: teacher-mobile-001
   - **User Access**: Full Access

### Generate Certificates

#### 1. Create Certificate Signing Request (CSR)
```bash
# Open Keychain Access on Mac
# Keychain Access → Certificate Assistant → Request a Certificate from a Certificate Authority
# Email: your-apple-email@example.com
# Common Name: Your Name
# Uncheck "Email to" option
# Click Continue
# Save file as CertificateSigningRequest.certSigningRequest
```

#### 2. Create Production Certificate
1. Go to Apple Developer → Certificates, IDs & Profiles
2. Click "Certificates" → "Create a New Certificate"
3. Select "iOS Distribution"
4. Upload CSR file
5. Download certificate
6. Double-click to install in Keychain

#### 3. Create Provisioning Profile
1. Go to "Provisioning Profiles" → "Create a New Profile"
2. Select "App Store"
3. Select your App ID
4. Select certificate you created
5. Name: ELIMUCORE_Teacher_Distribution
6. Download and open in Xcode

---

## 🔨 Step 2: Build for iOS Distribution

### 1. Configure Xcode Project

```bash
cd mobile/ios

# Open Xcode
open ELIMUCORE.xcworkspace

# (NOT .xcodeproj - use the workspace!)
```

### 2. Set Build Settings

In Xcode:

1. **Select Project** → ELIMUCORE
2. **Select Target** → ELIMUCORE
3. **General Tab**:
   - Bundle Identifier: `com.elimucore.teacher`
   - Version: `1.0.0`
   - Build: `1`

4. **Signing & Capabilities Tab**:
   - Team: Select your Apple Team
   - Provisioning Profile: Select the distribution profile

### 3. Configure App Icons & Launch Screen

```bash
# Add app icons
# Place in: ios/ELIMUCORE/Images.xcassets/AppIcon.appiconset/

# Required sizes:
# 1024x1024 - App Store
# 180x180 - iPhone 6s Plus, 7 Plus, 8 Plus
# 167x167 - iPad Pro (2nd Gen)
# 152x152 - iPad (3rd Gen), iPad mini (2nd Gen)
# 120x120 - iPhone 6s, 7, 8
# 87x87 - iPhone Spotlight
# 80x80 - iPhone Spotlight
# 58x58 - iPhone Settings
```

### 4. Build Archive

```bash
# Clean build
cd mobile
rm -rf node_modules/.cache

# Build for release
cd ios
xcodebuild -workspace ELIMUCORE.xcworkspace \
  -scheme ELIMUCORE \
  -configuration Release \
  -derivedDataPath build \
  -archivePath build/ELIMUCORE.xcarchive \
  archive

# Or use Xcode GUI:
# Product → Scheme → ELIMUCORE
# Product → Build For → Profiling (or Archive)
# Product → Archive
```

### 5. Export Archive

```bash
# Using Xcode:
# Window → Organizer
# Select the archive
# Click "Distribute App"
# Select "App Store Connect"
# Select "Upload"
# Sign with certificate
# Submit
```

Or via command line:

```bash
xcodebuild -exportArchive \
  -archivePath build/ELIMUCORE.xcarchive \
  -exportOptionsPlist ExportOptions.plist \
  -exportPath build/export
```

**ExportOptions.plist:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>signingStyle</key>
    <string>automatic</string>
    <key>stripSwiftSymbols</key>
    <true/>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>uploadBitcode</key>
    <false/>
</dict>
</plist>
```

---

## 📱 Step 3: Submit to App Store Connect

### 1. Prepare App Information

In App Store Connect → Your App:

1. **App Information**
   - Privacy Policy URL (required)
   - Support URL
   - Copyright: © 2026 ELIMUCORE

2. **Pricing and Availability**
   - Price: Free
   - Availability: Select countries/regions

3. **General App Information**
   - Category: Education
   - Subcategory: Teaching Tools
   - Content Rating: Moderate

### 2. Add Screenshots

Required for each device type:
- iPhone 14 Pro Max (6.7") - 3 minimum
- iPhone 14 Pro (6.1") - 3 minimum
- iPad Pro (6th Gen) - 3 minimum
- iPad Pro (7th Gen) - 3 minimum

**Screenshot Requirements:**
- PNG or JPEG
- Minimum 1024×768 pixels
- Maximum 5.0 MB
- At least 3, maximum 10 per device type

**Sample Screenshots to Include:**
1. Login with Biometric
2. Dashboard with Statistics
3. Attendance Marking
4. Mark Entry
5. Reports & Analytics

### 3. Add App Preview

- MP4 or MOV format
- 40-30 seconds long
- Shows app functionality
- Optional but recommended

### 4. Write App Description

```
ELIMUCORE Teacher Mobile App

Manage your classes, mark attendance, and enter student marks 
from your iPhone or iPad with secure biometric authentication.

KEY FEATURES:
✓ Biometric Login (Fingerprint & Face ID)
✓ Class Management
✓ Attendance Tracking
✓ Mark Entry
✓ Performance Reports
✓ Student Details
✓ Secure & Private
✓ Offline Support

Perfect for Kenyan High School Teachers

Support: support@elimucore.app
Privacy: elimucore.app/privacy
```

### 5. App Privacy

1. Go to "App Privacy"
2. Select data types collected:
   - User ID
   - Email Address (if applicable)
   - Device ID
3. Set data usage practices
4. Submit

### 6. Build Information

1. **Select Build**
   - Your uploaded build appears here
   - May take 10-20 minutes
   - Must be processed before selection

2. **Certificates**
   - Automatically verified
   - Ensure signing is valid

### 7. Review Information

1. **Content Rights**
   - Check all required boxes
   - Confirm no third-party content issues

2. **Age Rating**
   - Complete questionnaire
   - Select appropriate rating
   - Usually 4+ for education apps

3. **Version Release**
   - Select "Automatically release"
   - Or manually release after approval

---

## ✅ Step 4: Submit for Review

1. Click "Submit for Review"
2. Confirm all information
3. Click "Submit"
4. Check your email for confirmation

**Review Timeline:**
- Typical: 24-48 hours
- Peak times: 3-5 days
- May require updates: 24 hours to fix

---

## 📬 Review Process

### Apple Review Guidelines

Ensure your app:
- ✅ Works as described
- ✅ Follows app guidelines
- ✅ Includes privacy policy
- ✅ Uses appropriate permissions
- ✅ Doesn't crash on startup
- ✅ Contains no bugs

### Common Rejection Reasons

| Reason | Solution |
|--------|----------|
| Crashes on launch | Test thoroughly on device |
| Missing privacy policy | Add privacy policy URL |
| Incomplete metadata | Fill all required fields |
| Uses private APIs | Use only public APIs |
| No meaningful app | Add full functionality |

### If Rejected

1. Read the rejection reason
2. Make required changes
3. Update build number
4. Build new archive
5. Upload new build
6. Resubmit for review

---

## 🚀 After Approval

### App Goes Live
1. Notification email received
2. App appears on App Store (may take 1-2 hours)
3. Users can download

### Monitor App
- Crash reports
- User reviews
- Usage analytics
- Performance metrics

### Update Process

For future updates:
1. Increment version/build number
2. Build new archive
3. Upload to App Store Connect
4. Add release notes
5. Submit for review
6. Same approval process

---

## 🔧 Troubleshooting

### Build Fails

```bash
# Clean and rebuild
cd ios
rm -rf Pods Podfile.lock
cd ..
cd ios && pod install && cd ..
npx react-native run-ios --configuration Release
```

### Certificate Issues

```bash
# List certificates
security find-certificate -c "iPhone Distribution" -a

# Revoke and recreate if needed
# App Store Connect → Certificates
# Delete old certificate
# Create new one
```

### Submission Fails

- Verify Team ID is correct
- Check provisioning profile is valid
- Ensure build is signed
- Verify certificate not expired

### App Crashes

```bash
# Check crash logs
# App Store Connect → TestFlight → Crashes
# Fix issues and resubmit
```

---

## 📊 Monitoring & Analytics

### App Store Connect Dashboard

1. **Sales & Trends**
   - Downloads per day
   - Revenue trends
   - Geographic distribution

2. **Usage Metrics**
   - Active users
   - Session length
   - Feature usage

3. **Crash Logs**
   - Crash rate
   - Stack traces
   - Device/OS affected

4. **Reviews & Ratings**
   - Star rating
   - User feedback
   - Responses

---

## 🔄 Version Management

### Version Numbering
- Format: `X.Y.Z` (Major.Minor.Patch)
- Example: `1.0.0`, `1.1.0`, `2.0.0`

### Build Numbers
- Increment for each submission
- Format: Sequential integers
- Example: `1`, `2`, `3`

### Update Strategy

```
Initial Release: 1.0.0 (Build 1)
Bug Fixes: 1.0.1 (Build 2)
New Features: 1.1.0 (Build 3)
Major Overhaul: 2.0.0 (Build 4)
```

---

## 💡 Best Practices

### Before Submission
- [x] Test on real device
- [x] Test all features
- [x] Check battery usage
- [x] Test on slow network
- [x] Verify all buttons work
- [x] Check spelling/grammar
- [x] Test biometric auth
- [x] Verify API endpoints

### After Launch
- [x] Monitor crash reports
- [x] Read user reviews
- [x] Respond to feedback
- [x] Plan next update
- [x] Track analytics
- [x] Fix bugs quickly

### Marketing
- [x] Announce on social media
- [x] Email user list
- [x] Create landing page
- [x] Request reviews
- [x] Feature highlights
- [x] Video demo

---

## 📞 Support Resources

- **Apple Developer**: https://developer.apple.com/support
- **App Store Connect**: https://help.apple.com/app-store-connect
- **Xcode Documentation**: https://developer.apple.com/xcode
- **React Native iOS**: https://reactnative.dev/docs/ios-guide

---

## ✨ Checklist

- [ ] Apple Developer Account created
- [ ] App ID created in App Store Connect
- [ ] Certificates generated and installed
- [ ] Provisioning profiles downloaded
- [ ] Xcode project configured
- [ ] App icons added
- [ ] Build archive created
- [ ] App information filled
- [ ] Screenshots added
- [ ] Privacy policy provided
- [ ] Build uploaded
- [ ] App submitted for review
- [ ] Approval received
- [ ] App live on App Store

---

**Status**: Ready for Deployment ✅  
**Estimated Time**: 30-45 minutes setup + 24-48 hours review

Made with ❤️ for Kenyan Teachers
