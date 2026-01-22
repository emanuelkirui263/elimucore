import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import * as Keychain from 'react-native-keychain';
import { useBiometrics } from '../../hooks/useBiometrics';
import { useAuthStore } from '../../store/authStore';

export default function BiometricLoginScreen({ navigation }) {
  const { biometricsAvailable, biometricType, authenticate } = useBiometrics();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPasswordOption, setShowPasswordOption] = useState(false);
  const { biometricLogin, login } = useAuthStore();

  useEffect(() => {
    if (biometricsAvailable) {
      handleBiometricAuth();
    }
  }, []);

  const handleBiometricAuth = async () => {
    if (!biometricsAvailable) {
      setShowPasswordOption(true);
      return;
    }

    setLoading(true);
    try {
      const authenticated = await authenticate('Login with ' + (biometricType || 'biometrics'));
      
      if (authenticated) {
        const credentials = await Keychain.getGenericPassword();
        if (credentials) {
          const result = await biometricLogin(credentials.username);
          if (!result.success) {
            Alert.alert('Error', result.error);
          }
        } else {
          setShowPasswordOption(true);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Biometric authentication failed');
      setShowPasswordOption(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailPasswordLogin = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        // Ask if user wants to save for biometric
        if (biometricsAvailable) {
          Alert.alert(
            'Save Credentials',
            'Save credentials for biometric login?',
            [
              {
                text: 'No',
                onPress: () => {},
              },
              {
                text: 'Yes',
                onPress: async () => {
                  try {
                    await Keychain.setGenericPassword(email, password);
                  } catch (error) {
                    console.error('Failed to save credentials:', error);
                  }
                },
              },
            ]
          );
        }
      } else {
        Alert.alert('Error', result.error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>ELIMUCORE</Text>
        <Text style={styles.subtitle}>Teacher Mobile App</Text>
      </View>

      {!showPasswordOption && biometricsAvailable ? (
        <View style={styles.biometricSection}>
          <View style={styles.biometricIcon}>
            <Text style={styles.iconText}>
              {biometricType === 'Fingerprint' ? '👆' : '👤'}
            </Text>
          </View>
          <Text style={styles.biometricText}>
            Login with {biometricType || 'Biometrics'}
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.biometricButton]}
            onPress={handleBiometricAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Authenticate</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowPasswordOption(true)}>
            <Text style={styles.toggleText}>Use Email & Password</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.formSection}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#94A3B8"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
            keyboardType="email-address"
          />
          <TouchableOpacity
            style={[styles.button, styles.loginButton]}
            onPress={handleEmailPasswordLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>
          {!biometricsAvailable && (
            <Text style={styles.note}>Biometrics not available on this device</Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
  },
  biometricSection: {
    alignItems: 'center',
  },
  biometricIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconText: {
    fontSize: 50,
  },
  biometricText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 32,
  },
  formSection: {
    width: '100%',
  },
  input: {
    backgroundColor: '#1E293B',
    color: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  biometricButton: {
    backgroundColor: '#3B82F6',
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: '#3B82F6',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleText: {
    color: '#3B82F6',
    fontSize: 14,
    marginTop: 16,
    textAlign: 'center',
  },
  note: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 16,
    textAlign: 'center',
  },
});
