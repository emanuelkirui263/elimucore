# ELIMUCORE Teacher Mobile App - Setup Guide

## 📱 Overview

ELIMUCORE Teacher Mobile App is a React Native application built for teachers to manage their classes, mark attendance, enter marks, and view reports - all from their mobile devices.

### Key Features
- **Biometric Authentication**: Secure login with fingerprint or face recognition
- **Class Management**: View and manage all your teaching classes
- **Attendance Tracking**: Mark student attendance quickly with visual feedback
- **Mark Entry**: Submit student assessment marks efficiently
- **Student Reports**: View detailed student performance analytics
- **Settings Management**: Customize app preferences and security settings

### Supported Platforms
- **iOS**: 12.4+
- **Android**: 6.0+ (API 23+)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- React Native CLI: `npm install -g react-native-cli`
- Android Studio (for Android development)
- Xcode (for iOS development)
- CocoaPods (for iOS dependencies)

### Installation

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Install iOS dependencies (macOS only)
cd ios && pod install && cd ..
```

### Running the App

**Android:**
```bash
npx react-native run-android
```

**iOS:**
```bash
npx react-native run-ios
```

---

## 🔐 Biometric Authentication

### How It Works

1. **Initial Login**: Teachers log in with email and password
2. **Credential Storage**: Credentials are securely stored using React Native Keychain
3. **Biometric Option**: Next login can use fingerprint or face recognition
4. **Fallback**: Password login available if biometrics fail

### Supported Biometric Types
- **Fingerprint**: Android 6.0+, iOS 9.0+
- **Face ID**: iOS 11.2+, Android 10+
- **Passcode Fallback**: Always available

### Setup

1. Go to Settings → Security
2. Toggle "Biometric Authentication" ON
3. First login saves credentials automatically
4. Next login prompts for biometric authentication

---

## 📋 Features Guide

### Dashboard
- **Quick Stats**: View classes, attendance, pending marks, and total students
- **Quick Actions**: Fast access to common tasks
- **Welcome Message**: Personalized greeting with user avatar

### Classes
- **View All Classes**: List of teaching assignments
- **Class Details**: Subject, stream, student count
- **Quick Access**: Tap to view student details

### Attendance
- **Mark Attendance**: Simple tap to mark present/absent
- **Live Summary**: Real-time count of present/absent/unmarked students
- **Batch Submit**: Submit all records at once

### Mark Entry
- **Select Assessment**: Choose exam or assignment
- **Bulk Entry**: Enter multiple student marks
- **Validation**: Automatic mark range validation
- **Submit**: Submit to backend server

### Reports
- **Performance Analysis**: Class-wide analytics
- **Attendance Reports**: Attendance patterns and trends
- **Student Rankings**: Individual student performance

### Settings
- **Account Info**: View profile details
- **Security Options**: Biometric and notification settings
- **About Section**: App version and build information
- **Logout**: Secure logout with confirmation

---

## 🔧 Configuration

### Backend API Configuration

Update the API endpoint in `src/store/authStore.js`:

```javascript
// Change this URL to your backend server
const API_URL = 'http://your-backend-server.com:5000';
```

### Environment Variables

Create `.env` file in mobile directory:

```
API_URL=http://localhost:5000
API_TIMEOUT=30000
LOG_LEVEL=info
ENABLE_BIOMETRICS=true
```

---

## 🛠️ Development

### Project Structure

```
mobile/
├── App.js                           # Main app entry point
├── src/
│   ├── screens/
│   │   ├── auth/                   # Authentication screens
│   │   │   ├── SplashScreen.js
│   │   │   ├── BiometricLoginScreen.js
│   │   │   └── EmailPasswordLoginScreen.js
│   │   └── teacher/                # Teacher app screens
│   │       ├── DashboardScreen.js
│   │       ├── ClassesScreen.js
│   │       ├── AttendanceScreen.js
│   │       ├── MarksScreen.js
│   │       ├── ReportsScreen.js
│   │       ├── SettingsScreen.js
│   │       └── StudentDetailsScreen.js
│   ├── store/
│   │   └── authStore.js            # Auth state management (Zustand)
│   ├── hooks/
│   │   ├── useBiometrics.js        # Biometric authentication hook
│   │   └── useDarkMode.js          # Dark mode detection
│   ├── api/
│   │   └── client.js               # API client configuration
│   └── utils/
│       └── formatters.js           # Data formatting utilities
├── package.json
└── README.md
```

### Adding New Features

1. Create new screen in `src/screens/teacher/`
2. Add navigation route in `App.js`
3. Connect to auth store if needed
4. Test thoroughly on both platforms

### Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

---

## 🐛 Troubleshooting

### Biometrics Not Working
- Check device biometric setup in Settings
- Ensure app permissions are granted
- Try password fallback option

### API Connection Issues
- Verify backend server is running
- Check API URL in configuration
- Verify network connectivity
- Check server logs for errors

### iOS Build Issues
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
cd ..
npx react-native run-ios
```

### Android Build Issues
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

---

## 📱 iOS Specific

### Permissions Required
Add to `ios/ELIMUCORE_Teacher/Info.plist`:

```xml
<key>NSFaceIDUsageDescription</key>
<string>We use Face ID to authenticate you securely</string>
<key>NSBiometricsUsageDescription</key>
<string>We use biometrics to authenticate you securely</string>
```

### Signing & Building for Production
```bash
npx react-native run-ios --configuration Release
```

---

## 🤖 Android Specific

### Permissions Required
Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
<uses-permission android:name="android.permission.USE_FINGERPRINT" />
```

### Building for Production
```bash
cd android && ./gradlew assembleRelease
```

---

## 🔄 API Integration

### Authentication Flow

```
1. User enters credentials
2. POST /api/auth/login
3. Receive token + user data
4. Store token in AsyncStorage
5. Optional: Save credentials for biometric
6. Navigate to main app
```

### Sample API Calls

**Login:**
```javascript
POST /api/auth/login
{
  "email": "teacher@school.ac.ke",
  "password": "password"
}
```

**Get Classes:**
```javascript
GET /api/teacher/classes
Headers: { Authorization: `Bearer ${token}` }
```

**Submit Attendance:**
```javascript
POST /api/attendance/submit
{
  "classId": "class-id",
  "date": "2026-01-22",
  "records": [
    { "studentId": "id1", "status": "present" },
    { "studentId": "id2", "status": "absent" }
  ]
}
```

---

## 📊 Performance Tips

- Use React.memo for expensive components
- Implement FlatList for large lists
- Lazy load data with pagination
- Cache API responses
- Optimize images

---

## 🚀 Deployment

### iOS App Store
1. Create App Store Connect account
2. Generate certificates and provisioning profiles
3. Build with `--configuration Release`
4. Upload with Transporter or Xcode

### Google Play Store
1. Create Google Play Console account
2. Generate signing key
3. Build release APK: `cd android && ./gradlew assembleRelease`
4. Upload to Play Console

---

## 📞 Support

For issues or feature requests:
- **GitHub Issues**: Report bugs and request features
- **Email**: support@elimucore.app
- **Documentation**: Full API docs available at `/api/docs`

---

## 📄 License

MIT License - See LICENSE file for details

---

**Version**: 1.0.0  
**Last Updated**: January 22, 2026  
**Made for Kenyan Teachers** ❤️
