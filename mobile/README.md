# ELIMUCORE Teacher Mobile App

A React Native mobile application for teachers in Kenyan schools to manage their classes, mark attendance, enter student marks, and view performance reports - with secure biometric authentication.

## ✨ Features

### 🔐 Secure Authentication
- **Biometric Login**: Fingerprint and Face ID support
- **Email/Password Fallback**: Secure credential storage
- **Session Management**: Automatic token refresh
- **Secure Keychain**: Hardware-backed credential storage

### 📚 Class Management
- View all assigned classes
- Filter by stream and subject
- Quick access to student lists
- Class performance overview

### ✓ Attendance Tracking
- Fast mark attendance interface
- Visual student list with real-time summary
- Bulk submission capability
- Attendance statistics per class

### 📊 Mark Entry
- Select exam/assessment
- Bulk mark entry interface
- Mark validation
- Submission tracking

### 📈 Reports & Analytics
- Class performance analysis
- Attendance reports
- Student rankings
- Performance trends

### ⚙️ Settings & Customization
- Account management
- Security preferences
- Notification settings
- App information

---

## 📱 Tech Stack

### Frontend
- **React Native**: Cross-platform mobile development
- **React Navigation**: Navigation and routing
- **Zustand**: State management
- **React Native Biometrics**: Fingerprint/Face ID integration
- **React Native Keychain**: Secure credential storage

### Backend Integration
- **Axios**: HTTP client
- **AsyncStorage**: Local data persistence
- **REST API**: Communication with ELIMUCORE backend

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- React Native CLI
- Android Studio or Xcode

### Installation

```bash
cd mobile
npm install
```

### Run on Device

**Android:**
```bash
npx react-native run-android
```

**iOS:**
```bash
npx react-native run-ios
```

---

## 📖 Documentation

- [Setup Guide](./SETUP_GUIDE.md) - Detailed setup instructions
- [API Integration](./API_INTEGRATION.md) - Backend API reference
- [Biometric Guide](./BIOMETRIC_GUIDE.md) - Biometric authentication setup

---

## 🎯 Screen Overview

### Authentication Flows
1. **Splash Screen** - App initialization
2. **Biometric Login** - Fingerprint/Face ID
3. **Email/Password** - Traditional login

### Main App
1. **Dashboard** - Quick overview and actions
2. **Classes** - View all teaching classes
3. **Attendance** - Mark student attendance
4. **Marks** - Enter assessment marks
5. **Reports** - View analytics and reports
6. **Settings** - App configuration

---

## 🔐 Security Features

✅ **Biometric Authentication**
- Device-level fingerprint/face recognition
- No password transmission during biometric auth
- Automatic re-authentication after app restart

✅ **Secure Storage**
- Hardware-backed credential storage via Keychain
- Encrypted AsyncStorage for sensitive data
- Token expiration and refresh

✅ **API Security**
- JWT token-based authentication
- HTTPS only communication
- Request signing

---

## 📊 Attendance UI

```
┌─────────────────────────────┐
│ Present: 35 | Absent: 3     │
└─────────────────────────────┘

┌─────────────────────────────┐
│ John Mwangi    ✓ Present    │
├─────────────────────────────┤
│ Jane Kipchoge  ✗ Absent     │
├─────────────────────────────┤
│ Samuel Ochieng    Mark      │
├─────────────────────────────┤
│ Grace Nyambura ✓ Present    │
└─────────────────────────────┘

[Submit Attendance Button]
```

---

## 📝 Marks Entry UI

```
Select Exam/Assessment:
├─ Term 1 - Unit 1 (Form 1A)
├─ Term 1 - Unit 2 (Form 2B)
└─ Midterm Exam (Form 3C)

Enter Marks:
├─ Student Name        [78]
├─ Another Student     [82]
└─ [Submit Marks Button]
```

---

## 🔧 Configuration

### API Endpoint
Update `src/store/authStore.js`:
```javascript
const API_URL = 'http://your-backend.com:5000';
```

### Environment
Create `.env`:
```env
API_URL=http://localhost:5000
LOG_LEVEL=info
ENABLE_BIOMETRICS=true
```

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Debug tests
npm test -- --debug
```

---

## 📦 Building for Production

### Android
```bash
cd android
./gradlew assembleRelease
```

### iOS
```bash
# Build for iPhone
npx react-native run-ios --configuration Release
```

---

## 🐛 Troubleshooting

### Biometric not working
- Check device biometric enrollment
- Verify app permissions
- Try password fallback

### API errors
- Check backend server status
- Verify network connectivity
- Check API URL configuration

### Build errors
```bash
# Clear cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📱 Device Requirements

### Minimum Versions
- **Android**: 6.0 (API 23)
- **iOS**: 12.4

### Biometric Support
- **Android**: 6.0+ (fingerprint), 10+ (face)
- **iOS**: 9.0+ (fingerprint), 11.2+ (face)

---

## 🎨 UI/UX Features

- **Dark Theme**: Eye-friendly dark interface
- **Responsive Design**: Optimized for all screen sizes
- **Smooth Animations**: Transition effects
- **Intuitive Navigation**: Easy screen navigation
- **Real-time Feedback**: Immediate user feedback

---

## 🔄 Update Notifications

The app checks for updates via:
- App Store (iOS)
- Play Store (Android)

Users are notified when new versions are available.

---

## 📞 Support

- **Documentation**: See [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **Issues**: Report via GitHub Issues
- **Features**: Request via GitHub Discussions

---

## 📄 License

MIT License - ELIMUCORE Teacher Mobile App
© 2026 ELIMUCORE Project

---

## 🙏 Credits

Built for Kenyan education with ❤️

**Version**: 1.0.0  
**Last Updated**: January 22, 2026  
**Status**: Production Ready
