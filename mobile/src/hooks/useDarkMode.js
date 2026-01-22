import { useColorScheme } from 'react-native';

export const useDarkMode = () => {
  const colorScheme = useColorScheme();
  return colorScheme === 'dark';
};
