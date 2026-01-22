import { useEffect, useState } from 'react';
import ReactNativeBiometrics from 'react-native-biometrics';

export const useBiometrics = () => {
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState(null);

  useEffect(() => {
    const checkBiometrics = async () => {
      try {
        const rnb = new ReactNativeBiometrics();
        const { available, biometryType } = await rnb.isSensorAvailable();
        
        setBiometricsAvailable(available);
        setBiometricType(biometryType);
      } catch (error) {
        console.error('Biometrics check failed:', error);
        setBiometricsAvailable(false);
      }
    };

    checkBiometrics();
  }, []);

  const authenticate = async (reason = 'Authenticate to access ELIMUCORE') => {
    try {
      const rnb = new ReactNativeBiometrics();
      const { success } = await rnb.simplePrompt({
        promptMessage: reason,
        fallbackPromptMessage: 'Use passcode',
      });

      return success;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  };

  return {
    biometricsAvailable,
    biometricType,
    authenticate,
  };
};
