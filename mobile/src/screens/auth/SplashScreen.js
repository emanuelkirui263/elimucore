import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../store/authStore';

export default function SplashScreen({ navigation }) {
  const restoreToken = useAuthStore((state) => state.restoreToken);
  const isSignedIn = useAuthStore((state) => state.isSignedIn);

  useEffect(() => {
    const bootstrap = async () => {
      await restoreToken();
    };

    bootstrap();
  }, []);

  useEffect(() => {
    if (!useAuthStore.getState().loading) {
      if (isSignedIn) {
        navigation.replace('TeacherTabs');
      } else {
        navigation.replace('BiometricLogin');
      }
    }
  }, [isSignedIn]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>ELIMUCORE</Text>
      <Text style={styles.subtitle}>Teacher Mobile App</Text>
      <ActivityIndicator size="large" color="#3B82F6" style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 30,
  },
  loader: {
    marginTop: 20,
  },
});
