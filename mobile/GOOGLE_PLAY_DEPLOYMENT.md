# Google Play Store Deployment Guide

**Version**: 1.0.0  
**Last Updated**: January 22, 2026

---

## 📋 Prerequisites

### Requirements
- Google Play Developer Account ($25 one-time)
- Android SDK installed
- Java Development Kit (JDK) 11+
- Gradle 7.0+
- Keystore file for signing

### Accounts & Tools
1. **Google Play Console** - https://play.google.com/console
2. **Google Play Account** - Must be 18+
3. **Signing key** - For APK/AAB signing

---

## 🔑 Step 1: Set Up Google Play Developer Account

### Create Google Play Developer Account

1. Go to https://play.google.com/console
2. Sign in with Google Account
3. Accept Developer Agreement
4. Pay $25 one-time registration fee
5. Complete account setup:
   - Developer name
   - Contact information
   - Payment method
   - Address

### Create App in Play Console

1. Click "Create App"
2. Fill in app details:
   - **App Name**: ELIMUCORE Teacher
   - **Default Language**: English
   - **App Category**: Education
   - **App Type**: Application
3. Select "Free"
4. Accept declarations
5. Click "Create App"

---

## 🔑 Step 2: Generate Signing Key

### Create Keystore File

```bash
# Navigate to android folder
cd mobile/android/app

# Generate keystore
keytool -genkey -v -keystore elimucore-release.keystore \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias elimucore-key

# You'll be prompted for:
# Keystore password: [your-strong-password]
# Key password: [your-strong-password]
# Your name: [Your Name]
# Organization: ELIMUCORE
# City/Locality: Nairobi
# State/Province: Nairobi
# Country Code: KE

# Output: elimucore-release.keystore
```

### Back Up Keystore

```bash
# Save in secure location
cp elimucore-release.keystore ~/elimucore-release.keystore
chmod 600 ~/elimucore-release.keystore

# NEVER commit to git!
# Add to .gitignore:
echo "*.keystore" >> .gitignore
echo "android/app/*.keystore" >> .gitignore
```

**⚠️ Important**: Store keystore password securely - you need it for every update!

---

## 🔨 Step 3: Build Android App Bundle (AAB)

### 1. Update gradle.properties

Edit `mobile/android/gradle.properties`:

```properties
# Add signing configuration
ELIMUCORE_RELEASE_STORE_FILE=elimucore-release.keystore
ELIMUCORE_RELEASE_STORE_PASSWORD=your-keystore-password
ELIMUCORE_RELEASE_KEY_ALIAS=elimucore-key
ELIMUCORE_RELEASE_KEY_PASSWORD=your-key-password
```

### 2. Update build.gradle

Edit `mobile/android/app/build.gradle`:

```gradle
android {
    compileSdkVersion 33
    
    defaultConfig {
        applicationId "com.elimucore.teacher"
        minSdkVersion 21
        targetSdkVersion 33
        versionCode 1
        versionName "1.0.0"
        
        // For biometric
        multiDexEnabled true
    }
    
    signingConfigs {
        release {
            storeFile file(ELIMUCORE_RELEASE_STORE_FILE)
            storePassword ELIMUCORE_RELEASE_STORE_PASSWORD
            keyAlias ELIMUCORE_RELEASE_KEY_ALIAS
            keyPassword ELIMUCORE_RELEASE_KEY_PASSWORD
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 3. Build App Bundle

```bash
cd mobile/android

# Build App Bundle (AAB)
./gradlew bundleRelease

# Output: app/release/app-release.aab
# Or for APK:
# ./gradlew assembleRelease
# Output: app/release/app-release.apk
```

### Verify Build

```bash
# List generated files
ls -la app/release/

# Should see:
# app-release.aab (recommended for Play Store)
# app-release.apk (alternative, older format)
```

**Note**: Google Play Store prefers App Bundle (AAB) format as it's smaller and more efficient.

---

## 📱 Step 4: Create App Listing

### 1. App Store Listing

In Google Play Console:

1. **All apps** → Your app
2. **Main store listing**
3. Fill in required fields:

**Title** (50 characters max):
```
ELIMUCORE Teacher
```

**Short Description** (80 characters max):
```
Manage classes & mark attendance with biometric authentication
```

**Full Description** (4000 characters):
```
ELIMUCORE Teacher Mobile App

Manage your Kenyan high school from your phone with secure 
biometric authentication.

FEATURES:
✓ Fingerprint & Face ID Login
✓ Class Management
✓ Attendance Marking
✓ Student Mark Entry
✓ Performance Reports
✓ Student Details
✓ Secure & Private
✓ Offline Support

PERMISSIONS REQUESTED:
• Biometric data - for secure fingerprint/face login
• Account access - for authentication
• Storage - for app data

Perfect for Kenyan high school teachers

Support: support@elimucore.app
Privacy: elimucore.app/privacy
```

### 2. App Icon

- **Size**: 512×512 pixels
- **Format**: PNG (32-bit)
- **Requirements**: 
  - No transparency on edges
  - Clear, legible at small sizes
  - Representative of app

### 3. Feature Graphic

- **Size**: 1024×500 pixels
- **Format**: PNG or JPEG
- **Purpose**: Featured on store listing

### 4. Screenshots

Minimum 2, maximum 8 per device type:

**Phone Screenshots** (1080×1920):
1. Login screen with biometric
2. Dashboard with stats
3. Classes list
4. Attendance marking
5. Mark entry interface
6. Reports

**Tablet Screenshots** (2560×1440):
Same content, optimized for tablet

**Requirements**:
- PNG or JPEG
- Actual device screenshots (no mockups)
- Clear and readable text
- Show key features

### 5. Video (Optional)

- **MP4 or MOV format**
- **Duration**: 30-120 seconds
- **Resolution**: At least 1080p
- **Content**: App demo, features

---

## 📋 Step 5: Content Rating

### Complete Questionnaire

1. Go to "Content Rating"
2. Select **IARC questionnaire**
3. Answer questions about:
   - Violence
   - Sexual content
   - Profanity
   - Substance use
   - Gambling
   - Horror

**For Education App**:
- All typically "No" or "None"
- Results: Usually 3+ or 4+

### Content Rating Regions

- **ESRB** (North America)
- **PEGI** (Europe)
- **ClassInd** (Brazil)
- **USK** (Germany)
- **Others**

---

## 🔐 Step 6: Target Audience & Content

### Target Audience

1. Go to "Target audience"
2. Select:
   - **Age groups**: 13+
   - **Intended user**: Teachers/Educators
   - **Content**: Education

### Content Guidelines

1. Check all required boxes
2. Confirm:
   - ✓ App functions as described
   - ✓ Follows Google Play policies
   - ✓ No prohibited content
   - ✓ Appropriate for target age

---

## 🌍 Step 7: Configure Distribution

### Countries/Regions

1. Select "Countries/regions"
2. Choose where app available:
   - Kenya (primary)
   - Other African countries
   - Global (optional)

### Device Categories

1. Select devices app supports:
   - [x] Phones
   - [x] Tablets
   - [ ] Wear OS
   - [ ] Android TV

### Languages

- Primary: English
- Add translation if available

---

## 📱 Step 8: Upload Build

### 1. Create Release

In Play Console:

1. **Testing** → **Internal testing**
2. Click **Create new release**
3. Upload app bundle (AAB file):
   - Drag and drop `app-release.aab`
   - Or click "Browse files"
4. Select your signing key

### 2. Release Details

**Name**:
```
1.0.0
```

**Release notes**:
```
Initial Release

FEATURES:
- Biometric authentication (Fingerprint & Face ID)
- Class management
- Attendance tracking
- Mark entry
- Performance reports
- Secure login
- Dark theme UI
```

**Rollout percentage** (for gradual release):
- Start at 10% (test with 10% of users)
- Monitor for crashes
- Increase to 100% after 24-48 hours

### 3. Review and Submit

1. Review all information
2. Click **Save and submit for review**
3. Confirm submission

---

## 🧪 Step 9: Testing (Before Production)

### Internal Testing

1. **Testing** → **Internal testing**
2. Add internal testers (email addresses)
3. Send test link
4. Testers install from Play Console
5. Provide feedback

### Closed Testing

1. **Testing** → **Closed testing**
2. Create closed testing track
3. Add limited number of testers
4. Test for 1-2 weeks
5. Monitor crashes and reviews

### Open Testing

1. **Testing** → **Open testing**
2. Anyone can join and test
3. Get public feedback
4. Larger user base
5. Feedback before production

### Recommended Process

```
1. Internal Testing (1-2 days)
   ↓
2. Closed Testing (3-5 days)
   ↓
3. Open Testing (5-7 days)
   ↓
4. Production Release
```

---

## 🚀 Step 10: Release to Production

### Move to Production

1. **Testing** tracks complete
2. **Setup** → **Release**
3. Create production release:
   - Use same AAB or new version
   - Add release notes
   - Set rollout percentage (100%)

### Staged Rollout

Recommended approach:

```
Day 1: 10% of users
Day 2: 25% of users
Day 3: 50% of users
Day 4: 100% of users
```

Benefits:
- Catch issues early
- Monitor crash rates
- Gradual user feedback
- Easy to roll back if needed

### Full Release

1. Click **Release** button
2. Confirm all information
3. Click **Rollout**
4. App live in Google Play Store!

**Timeline**:
- Submission: Immediate
- Review: Usually 2-4 hours
- Available: Within 1-2 hours of approval

---

## ✅ Review Process

### Google Play Review Guidelines

App must:
- ✅ Work as advertised
- ✅ Not crash on startup
- ✅ Have valid privacy policy
- ✅ Collect minimal data
- ✅ Handle permissions properly
- ✅ No malware/viruses

### Common Rejection Reasons

| Reason | Solution |
|--------|----------|
| Crashes | Test on actual device |
| Missing privacy policy | Add privacy URL |
| Inappropriate permissions | Request only needed perms |
| Misleading description | Accurate description |
| Spam/low quality | Add full functionality |

### If Rejected

1. Read rejection reason
2. Fix the issue
3. Update version code
4. Build new AAB
5. Submit new release
6. Same review process

---

## 📊 Post-Launch Monitoring

### Google Play Console Dashboard

1. **Overview**
   - Active installs
   - Daily/total ratings
   - Reviews

2. **Crashes & ANRs**
   - Crash rate %
   - Affected devices
   - Stack traces

3. **Reviews**
   - Star distribution
   - Recent reviews
   - Trending issues

4. **Statistics**
   - User retention
   - Install source
   - Geographic data

5. **Performance**
   - Device types
   - Android versions
   - Screen sizes

### Monitor Metrics

```
✓ Crash rate (keep < 1%)
✓ ANR rate (keep < 0.5%)
✓ Ratings (target 4.0+)
✓ Uninstall rate
✓ User retention
```

---

## 🔄 Updates & Versioning

### Version Code

Increment for every release:

```
Release 1: versionCode 1
Release 2: versionCode 2
Release 3: versionCode 3
```

**Rules**:
- Must always increase
- Used for updates only
- Can't decrease
- Can skip numbers (1, 3, 5)

### Version Name

User-visible version:

```
1.0.0 (initial)
1.0.1 (bug fix)
1.1.0 (feature)
2.0.0 (major)
```

### Update Process

```
1. Update version code/name
2. Build new AAB
3. Test thoroughly
4. Upload new release
5. Add release notes
6. Submit for review
7. Monitor feedback
```

---

## 💡 Best Practices

### Before Launch
- [x] Test on 5+ devices
- [x] Test all Android versions (6-13)
- [x] Test all screen sizes
- [x] Test biometric auth
- [x] Test with slow network
- [x] Check battery usage
- [x] Verify all links work
- [x] Proof-read all text
- [x] Test privacy policy
- [x] Verify crash reporting

### After Launch
- [x] Monitor crash reports daily
- [x] Respond to user reviews
- [x] Track analytics
- [x] Plan next update
- [x] Fix critical bugs quickly
- [x] Gather user feedback
- [x] Promote app

### Marketing Strategy

1. **Soft Launch**
   - Internal/closed testing
   - Get early feedback
   - Fix issues

2. **Limited Release**
   - Staged rollout
   - Regional focus (Kenya first)
   - Monitor metrics

3. **Full Release**
   - 100% rollout
   - Marketing push
   - Social media
   - Teacher networks

4. **Growth**
   - User referrals
   - Reviews/ratings
   - App store optimization
   - Feature updates

---

## 🔧 Troubleshooting

### Build Fails

```bash
# Clean build
cd mobile/android
./gradlew clean

# Rebuild
./gradlew bundleRelease

# Check errors
./gradlew bundleRelease --stacktrace
```

### Signing Issues

```bash
# Verify keystore
keytool -list -v -keystore elimucore-release.keystore

# If password forgotten:
# Generate new keystore (use new key for future releases)
```

### Upload Fails

- Check file format (must be AAB or APK)
- Verify file size (< 1GB)
- Check signing certificate
- Try different browser
- Contact Google Support

### App Won't Install

- Check device Android version (min 6.0)
- Check permissions on device
- Try uninstall/reinstall
- Clear Play Store cache

### Crashes After Launch

```
1. Check crash reports in Play Console
2. Identify affected devices/Android versions
3. Fix in code
4. Build new AAB (increment versionCode)
5. Submit hotfix release
6. Monitor new crash rate
```

---

## 📞 Support Resources

- **Google Play Console**: https://play.google.com/console
- **Google Play Policies**: https://play.google.com/about/developer-content-policy/
- **Android Documentation**: https://developer.android.com
- **React Native Android**: https://reactnative.dev/docs/android-setup

---

## ✨ Checklist

- [ ] Google Play Developer Account created
- [ ] App created in Play Console
- [ ] Signing key generated and backed up
- [ ] gradle.properties configured
- [ ] build.gradle configured
- [ ] App Bundle built and tested
- [ ] App icon created (512×512)
- [ ] Screenshots added (6+ per device)
- [ ] Full description written
- [ ] Content rating completed
- [ ] Privacy policy linked
- [ ] Build uploaded to internal testing
- [ ] Internal testers verified app works
- [ ] Closed testing completed
- [ ] Open testing completed
- [ ] Final build submitted for production review
- [ ] Approval received
- [ ] App live on Google Play Store

---

**Status**: Ready for Deployment ✅  
**Estimated Time**: 30-45 minutes setup + 2-4 hours review

Made with ❤️ for Kenyan Teachers
