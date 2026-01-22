# Biometric Authentication Implementation Guide

## 🔐 Overview

The ELIMUCORE Teacher Mobile App uses biometric authentication (fingerprint/face recognition) for secure and convenient login.

---

## ✨ How It Works

### 1. First Login (Email & Password)

```
User enters email → User enters password → Backend validates
→ Token received → Optionally save credentials to Keychain
```

### 2. Subsequent Login (Biometric)

```
Biometric prompt → Device authentication → Retrieve saved credentials
→ Auto login → Navigate to app
```

---

## 🔧 Implementation Details

### Biometric Detection

```javascript
import { useBiometrics } from '../../hooks/useBiometrics';

const { biometricsAvailable, biometricType, authenticate } = useBiometrics();

// biometricType: 'Fingerprint' | 'FaceID' | null
```

### Credential Storage

Credentials are stored securely in device's secure storage:

**iOS**: Keychain  
**Android**: Keystore

```javascript
import * as Keychain from 'react-native-keychain';

// Save credentials
await Keychain.setGenericPassword(email, password);

// Retrieve credentials
const credentials = await Keychain.getGenericPassword();
// credentials = { username: 'email', password: 'password' }
```

### Authentication Flow

```javascript
const authenticate = async () => {
  const authenticated = await authenticate('Authenticate to access ELIMUCORE');
  
  if (authenticated) {
    const credentials = await Keychain.getGenericPassword();
    const result = await biometricLogin(credentials.username);
    // Navigate if successful
  }
};
```

---

## 📱 Platform-Specific Setup

### iOS

#### Info.plist Configuration
```xml
<key>NSFaceIDUsageDescription</key>
<string>We use Face ID to securely authenticate you</string>

<key>NSBiometricsUsageDescription</key>
<string>We use biometrics to securely authenticate you</string>
```

#### Capabilities Required
- [x] Keychain Sharing (for credential storage)
- [x] Face ID permission

#### Testing on iOS Simulator
1. Enable biometric simulation:
   - Simulator → Features → Face ID
   - Simulator → Features → Face ID → Enrolled

2. Test biometric authentication:
   - Simulator → Features → Face ID → Matching Face
   - Simulator → Features → Face ID → Non-Matching Face

### Android

#### Manifest Permissions
```xml
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
<uses-permission android:name="android.permission.USE_FINGERPRINT" />
```

#### Runtime Permissions
```java
// android/app/src/main/AndroidManifest.xml
<uses-permission android:name="android.permission.USE_BIOMETRIC" />
```

#### Testing on Android Emulator
1. Enable fingerprint in emulator:
   - Extended controls → Fingerprints → Add fingerprint
   
2. Test authentication:
   - Extended controls → Fingerprints → Touch sensor

---

## 🔒 Security Considerations

### ✅ Best Practices Implemented

1. **No Password Transmission During Biometric Auth**
   - Credentials retrieved from local Keychain
   - Only after successful device authentication
   
2. **Secure Credential Storage**
   - Hardware-backed storage when available
   - Encrypted on all platforms
   
3. **Session Management**
   - JWT tokens with expiration
   - Automatic token refresh
   - Logout clears credentials
   
4. **Fallback Options**
   - Password login always available
   - Biometric failures handled gracefully

### ⚠️ Security Warnings

- ❌ Don't store passwords in plain text
- ❌ Don't send passwords over HTTP
- ❌ Don't hardcode API credentials
- ❌ Don't cache biometric responses

---

## 🛠️ Integration with Backend

### Token-Based Authentication

```javascript
// After successful biometric auth
const result = await biometricLogin(email);

// Response includes JWT token
// {
//   success: true,
//   user: { id, firstName, lastName, email, role },
//   token: 'eyJhbGciOiJIUzI1NiIs...'
// }

// Token stored in AsyncStorage
await AsyncStorage.setItem('token', result.token);

// Used in all subsequent API calls
const config = {
  headers: {
    Authorization: `Bearer ${token}`
  }
};
```

### API Endpoints

**Login with credentials:**
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "teacher@school.ac.ke",
  "password": "password"
}

Response:
{
  "user": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "teacher@school.ac.ke",
    "role": "teacher"
  },
  "token": "jwt_token_here"
}
```

**Logout:**
```
POST /api/auth/logout
Authorization: Bearer {token}
```

---

## 🧪 Testing Biometric Auth

### Unit Tests

```javascript
jest.mock('react-native-biometrics');

describe('Biometric Authentication', () => {
  it('should authenticate with valid biometric', async () => {
    const { authenticate } = useBiometrics();
    const result = await authenticate();
    expect(result).toBe(true);
  });

  it('should fallback on biometric failure', async () => {
    // Test fallback to password
  });
});
```

### Manual Testing

1. **Enable Biometric**
   - Go to Settings
   - Toggle Biometric Authentication ON
   - Login with email/password
   
2. **Test Fingerprint/Face**
   - Logout
   - Login screen shows biometric prompt
   - Use device biometric
   - Should authenticate successfully
   
3. **Test Fallback**
   - Disable biometric on device
   - Try app login
   - Should show password option

---

## 📊 Error Handling

### Common Biometric Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Biometric not enrolled` | Device has no biometric | Use password login |
| `User cancelled` | User tapped cancel | Offer password option |
| `Authentication failed` | Wrong fingerprint/face | Retry or use password |
| `No saved credentials` | First login | Show password login |

### Handling Errors

```javascript
try {
  const authenticated = await authenticate();
  
  if (authenticated) {
    // Proceed with login
  }
} catch (error) {
  if (error.code === 'USER_CANCELLED') {
    showPasswordOption();
  } else if (error.code === 'NOT_ENROLLED') {
    showMessage('Set up biometric on your device first');
  } else {
    showMessage('Authentication failed. Please try password login.');
  }
}
```

---

## 🔄 Credential Refresh Flow

### Token Expiration

```
1. User logs in (biometric or password)
2. Receives JWT token with 7-day expiration
3. Token stored in AsyncStorage
4. On app startup: Check if token exists and valid
5. If expired: Use refresh token to get new token
6. If no refresh token: Prompt for login again
```

### Implementation

```javascript
useEffect(() => {
  const checkToken = async () => {
    const token = await AsyncStorage.getItem('token');
    
    if (token) {
      // Verify token is still valid
      const isValid = await verifyToken(token);
      
      if (!isValid) {
        // Try to refresh
        const newToken = await refreshToken();
        if (newToken) {
          await AsyncStorage.setItem('token', newToken);
        } else {
          // Logout and show login
        }
      }
    }
  };
  
  checkToken();
}, []);
```

---

## 🎯 Best Practices

### ✅ Do's

✅ **Always** provide password fallback  
✅ **Always** handle biometric failures gracefully  
✅ **Always** store credentials securely  
✅ **Always** clear credentials on logout  
✅ **Always** validate tokens on app startup  

### ❌ Don'ts

❌ **Never** store credentials in code  
❌ **Never** transmit passwords unencrypted  
❌ **Never** cache biometric responses  
❌ **Never** skip token validation  
❌ **Never** ignore user cancellations  

---

## 📱 Device Support Matrix

### iOS
| Feature | Version | Support |
|---------|---------|---------|
| Fingerprint | 9.0+ | ✅ |
| Face ID | 11.2+ | ✅ |
| Keychain | All | ✅ |

### Android
| Feature | API | Support |
|---------|-----|---------|
| Fingerprint | 23+ | ✅ |
| Face Recognition | 29+ | ✅ |
| Biometric | 23+ | ✅ |
| Keystore | 23+ | ✅ |

---

## 🚀 Deployment Checklist

- [ ] Credentials stored securely in Keychain
- [ ] Password fallback working on all devices
- [ ] Token refresh implemented
- [ ] Logout clears all credentials
- [ ] Error messages are user-friendly
- [ ] Biometric prompts are clear
- [ ] iOS permissions configured
- [ ] Android permissions configured
- [ ] Tested on both platforms
- [ ] Privacy policy updated

---

## 📞 Troubleshooting

### Biometric not detecting device has biometric
```javascript
const rnb = new ReactNativeBiometrics();
const { available, biometryType } = await rnb.isSensorAvailable();
console.log('Biometric available:', available);
console.log('Biometric type:', biometryType);
```

### Credentials not saving
- Check Keychain permissions (iOS)
- Check device security settings (Android)
- Verify app has required permissions

### Token not persisting
- Check AsyncStorage configuration
- Verify storage path exists
- Check for storage permission denials

---

## 📚 References

- [React Native Biometrics](https://github.com/naoufal/react-native-biometrics)
- [React Native Keychain](https://github.com/oblador/react-native-keychain)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Mobile Security](https://owasp.org/www-project-mobile-top-10/)

---

**Version**: 1.0.0  
**Updated**: January 22, 2026  
**Status**: Production Ready
