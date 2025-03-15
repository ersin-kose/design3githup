import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { TextInput, Button, Text, useTheme, Appbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import authService from '../services/auth';

const RegisterScreen = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureConfirmTextEntry, setSecureConfirmTextEntry] = useState(true);
  
  const theme = useTheme();
  const navigation = useNavigation<any>();
  
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const handleRegister = async () => {
    // Form validasyonu
    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurunuz.');
      return;
    }
    
    if (!isValidEmail(email)) {
      Alert.alert('Hata', 'Lütfen geçerli bir e-posta adresi giriniz.');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor.');
      return;
    }
    
    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.');
      return;
    }
    
    try {
      setLoading(true);
      const result = await authService.register(email, username, password);
      
      if (result.success) {
        Alert.alert('Başarılı', result.message, [
          { text: 'Tamam', onPress: () => navigation.navigate('Home') }
        ]);
      } else {
        Alert.alert('Hata', result.message);
      }
    } catch (error) {
      console.error('Kayıt olma hatası:', error);
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
        <Appbar.Content title="Kayıt Ol" color="#FFFFFF" titleStyle={styles.headerTitle} />
      </Appbar.Header>
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>INKSCAPE'e Hoş Geldiniz!</Text>
        <Text style={styles.subtitle}>Dövme tasarımlarını keşfetmeye başlamak için hesap oluşturun</Text>
        
        <View style={styles.form}>
          <TextInput
            label="Kullanıcı Adı"
            value={username}
            onChangeText={setUsername}
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
            label="E-posta"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
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
          
          <TextInput
            label="Şifre Tekrar"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={secureConfirmTextEntry}
            style={styles.input}
            mode="outlined"
            outlineColor="#444444"
            activeOutlineColor={theme.colors.primary}
            right={
              <TextInput.Icon
                icon={secureConfirmTextEntry ? 'eye' : 'eye-off'}
                iconColor="#888888"
                onPress={() => setSecureConfirmTextEntry(!secureConfirmTextEntry)}
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
            onPress={handleRegister}
            style={styles.button}
            loading={loading}
            disabled={loading}
          >
            Kayıt Ol
          </Button>
          
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Zaten hesabınız var mı?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Giriş Yap</Text>
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    alignItems: 'center',
  },
  loginText: {
    color: '#AAAAAA',
    marginRight: 5,
  },
  loginLink: {
    color: '#9C27B0',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;