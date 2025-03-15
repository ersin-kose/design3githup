import React, { useState, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import HomeScreen from './src/screens/HomeScreen';
import TattooPreviewScreen from './src/screens/TattooPreviewScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import PremiumScreen from './src/screens/PremiumScreen';
import authService from './src/services/auth';

// Stack navigator için tip tanımlaması
type RootStackParamList = {
  Home: undefined;
  TattooPreview: {
    userImage: string;
    tattooImage: string;
    description: string;
    style?: string;
    bodyPart?: string;
  };
  Login: undefined;
  Register: undefined;
  Profile: undefined;
  Premium: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Siyah-gri tonlarında tema oluşturma
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee',
    accent: '#03dac6',
    background: '#121212',
    surface: '#1e1e1e',
    text: '#ffffff',
    disabled: '#757575',
    placeholder: '#9e9e9e',
    backdrop: 'rgba(0,0,0,0.5)',
    surfaceVariant: '#424242',
  },
  dark: true,
};

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Uygulama açıldığında oturum kontrolü
  useEffect(() => {
    const checkAuth = async () => {
      const authState = await authService.getAuthState();
      setIsAuthenticated(authState.isAuthenticated);
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);
  
  // Yükleniyor ekranı gösterilebilir
  if (isLoading) {
    return null; // Veya bir yükleniyor ekranı render edilebilir
  }
  
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <StatusBar barStyle="light-content" backgroundColor="#121212" />
        <Stack.Navigator 
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#121212',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeScreen} 
            options={{ 
              title: 'TattooAI',
              headerShown: false,
            }} 
          />
          <Stack.Screen 
            name="TattooPreview" 
            component={TattooPreviewScreen} 
            options={{ 
              title: 'Dövme Önizleme',
              headerShown: true,
            }} 
          />
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ 
              title: 'Giriş Yap',
              headerShown: false,
            }} 
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen} 
            options={{ 
              title: 'Kayıt Ol',
              headerShown: false,
            }} 
          />
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen} 
            options={{ 
              title: 'Profilim',
              headerShown: false,
            }} 
          />
          <Stack.Screen 
            name="Premium" 
            component={PremiumScreen} 
            options={{ 
              title: 'Premium',
              headerShown: false,
              presentation: 'modal',
            }} 
          />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}