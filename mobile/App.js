import React from 'react';
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useDarkMode } from './src/hooks/useDarkMode';
import { useAuthStore } from './src/store/authStore';

// Auth Screens
import SplashScreen from './src/screens/auth/SplashScreen';
import BiometricLoginScreen from './src/screens/auth/BiometricLoginScreen';
import EmailPasswordLoginScreen from './src/screens/auth/EmailPasswordLoginScreen';

// Teacher Screens
import DashboardScreen from './src/screens/teacher/DashboardScreen';
import ClassesScreen from './src/screens/teacher/ClassesScreen';
import MarksScreen from './src/screens/teacher/MarksScreen';
import AttendanceScreen from './src/screens/teacher/AttendanceScreen';
import StudentDetailsScreen from './src/screens/teacher/StudentDetailsScreen';
import SettingsScreen from './src/screens/teacher/SettingsScreen';
import ReportsScreen from './src/screens/teacher/ReportsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="BiometricLogin" component={BiometricLoginScreen} />
      <Stack.Screen name="EmailPasswordLogin" component={EmailPasswordLoginScreen} />
    </Stack.Navigator>
  );
};

const TeacherTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#9CA3AF',
        headerStyle: {
          backgroundColor: '#1F2937',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Classes"
        component={ClassesScreen}
        options={{
          title: 'My Classes',
          tabBarLabel: 'Classes',
        }}
      />
      <Tab.Screen
        name="Marks"
        component={MarksScreen}
        options={{
          title: 'Mark Entry',
          tabBarLabel: 'Marks',
        }}
      />
      <Tab.Screen
        name="Attendance"
        component={AttendanceScreen}
        options={{
          title: 'Attendance',
          tabBarLabel: 'Attendance',
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          title: 'Reports',
          tabBarLabel: 'Reports',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};

const TeacherStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TeacherTabs" component={TeacherTabs} />
      <Stack.Screen name="StudentDetails" component={StudentDetailsScreen} />
    </Stack.Navigator>
  );
};

export default function App() {
  const isDark = useDarkMode();
  const isSignedIn = useAuthStore((state) => state.isSignedIn);

  const theme = isDark ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer theme={theme}>
      {isSignedIn ? <TeacherStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
