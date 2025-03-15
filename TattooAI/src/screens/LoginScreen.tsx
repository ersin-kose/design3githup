import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, StatusBar, ScrollView } from 'react-native';
import { TextInput, Button, Text, useTheme, Appbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import authService from '../services/auth';

const LoginScreen = () => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  
  const theme = useTheme();
  const navigation = useNavigation<any>();
  
  const handleLogin = async () => {
    // Form validasyonu
    if (!emailOrUsername.trim() || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurunuz.');
      return;
    }
    
    try {
      setLoading(true);
      const result = await authService.login(emailOrUsername, password);
      
      if (result.success) {
        Alert.alert('Başarılı', result.message, [
          { text: 'Tamam', onPress: () => navigation.navigate('Home') }
        ]);
      } else {
        Alert.alert('Hata', result.message);
      }
    } catch (error) {
      console.error('Giriş hatası:', error);
      Alert.alert('Hata', 'Bir sorun oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#121212" barStyle="light-content" />
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="#FFFFFF" />
        <Appbar.Content title="Giriş Yap" color="#FFFFFF" titleStyle={styles.headerTitle} />
      </Appbar.Header>
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Tekrar Hoş Geldiniz!</Text>
        <Text style={styles.subtitle}>Hesabınıza giriş yaparak kaldığınız yerden devam edin</Text>
        
        <View style={styles.form}>
          <TextInput
            label="E-posta veya Kullanıcı Adı"
            value={emailOrUsername}
            onChangeText={setEmailOrUsername}
            style={styles.input}
            autoCapitalize="none"
            mode="outlined"
            outlineColor="#444444"
            activeOutlineColor={theme.colors.primary}
            theme={{
              colors: {
                text: '#FFFFFF',
                placeholder: '#888888',
                background: '#1E1E1E',
              }
            }}
            textColor="#FFFFFF"
          />
          
          <TextInput
            label="Şifre"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secureTextEntry}
            style={styles.input}
            mode="outlined"
            outlineColor="#444444"
            activeOutlineColor={theme.colors.primary}
            right={
              <TextInput.Icon
                icon={secureTextEntry ? 'eye' : 'eye-off'}
                iconColor="#888888"
                onPress={() => setSecureTextEntry(!secureTextEntry)}
              />
            }
            theme={{
              colors: {
                text: '#FFFFFF',
                placeholder: '#888888',
                background: '#1E1E1E',
              }
            }}
            textColor="#FFFFFF"
          />
          
          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.button}
            loading={loading}
            disabled={loading}
          >
            Giriş Yap
          </Button>
          
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Hesabınız yok mu?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Kayıt Ol</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    backgroundColor: '#121212',
    elevation: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#AAAAAA',
    marginBottom: 30,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#1E1E1E',
  },
  button: {
    marginTop: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    alignItems: 'center',
  },
  registerText: {
    color: '#AAAAAA',
    marginRight: 5,
  },
  registerLink: {
    color: '#9C27B0',
    fontWeight: 'bold',
  },
});

export default LoginScreen;