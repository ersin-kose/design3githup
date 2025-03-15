import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, StatusBar, Image, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, useTheme, Appbar, Avatar, Divider, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import authService, { User } from '../services/auth';

const ProfileScreen = () => {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const theme = useTheme();
  const navigation = useNavigation<any>();
  
  // Kullanıcı bilgilerini yükle
  useEffect(() => {
    const loadUserData = async () => {
      const authState = await authService.getAuthState();
      if (authState.user) {
        setUser(authState.user);
        setName(authState.user.name || '');
        setUsername(authState.user.username || '');
        setEmail(authState.user.email || '');
        setPhone(authState.user.phone || '');
        setAvatar(authState.user.avatar || null);
      } else {
        navigation.navigate('Login');
      }
    };
    
    loadUserData();
  }, []);
  
  // Profil fotoğrafı seç
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Fotoğraflarınıza erişmek için izin vermeniz gerekmektedir.');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    
    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };
  
  // Profil güncellemesi
  const handleUpdateProfile = async () => {
    if (!user) return;
    
    if (!username.trim() || !email.trim()) {
      Alert.alert('Hata', 'Kullanıcı adı ve e-posta alanları zorunludur.');
      return;
    }
    
    if (name && name.length > 50) {
      Alert.alert('Hata', 'Ad Soyad alanı en fazla 50 karakter olabilir.');
      return;
    }
    
    try {
      setLoading(true);
      
      const result = await authService.updateUserProfile(user.id, {
        name: name.trim() || undefined,
        username: username !== user.username ? username.trim() : undefined,
        email: email !== user.email ? email.trim() : undefined,
        phone: phone.trim() || undefined,
        avatar: avatar || undefined,
      });
      
      if (result.success) {
        setUser(result.user || null);
        Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi.');
      } else {
        Alert.alert('Hata', result.message);
      }
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      Alert.alert('Hata', 'Bir sorun oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinize emin misiniz?',
      [
        { text: 'İptal' },
        { 
          text: 'Evet', 
          onPress: async () => {
            await authService.logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' }],
            });
          } 
        },
      ]
    );
  };
  
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#121212" barStyle="light-content" />
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="#FFFFFF" />
        <Appbar.Content title="Profilim" color="#FFFFFF" titleStyle={styles.headerTitle} />
      </Appbar.Header>
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {user ? (
          <>
            <View style={styles.avatarContainer}>
              {avatar ? (
                <Avatar.Image 
                  size={120} 
                  source={{ uri: avatar }} 
                  style={styles.avatar} 
                />
              ) : (
                <Avatar.Text 
                  size={120} 
                  label={username.substring(0, 2).toUpperCase()} 
                  style={styles.avatarText} 
                  labelStyle={{ fontSize: 42 }}
                />
              )}
              
              <TouchableOpacity 
                style={styles.editAvatarButton}
                onPress={pickImage}
              >
                <IconButton
                  icon="camera"
                  size={20}
                  iconColor="#FFFFFF"
                  style={styles.editIcon}
                />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.usernameText}>@{username}</Text>
            <Text style={styles.memberSinceText}>
              Üyelik: {new Date(user.createdAt).toLocaleDateString('tr-TR')}
            </Text>
            
            <Divider style={styles.divider} />
            
            <Text style={styles.sectionTitle}>Profil Bilgileri</Text>
            
            <View style={styles.form}>
              <TextInput
                label="Ad Soyad"
                value={name}
                onChangeText={setName}
                style={styles.input}
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
                label="Telefon (opsiyonel)"
                value={phone}
                onChangeText={setPhone}
                style={styles.input}
                keyboardType="phone-pad"
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
              
              <Button
                mode="contained"
                onPress={handleUpdateProfile}
                style={styles.button}
                loading={loading}
                disabled={loading}
                icon="content-save"
              >
                Değişiklikleri Kaydet
              </Button>
              
              <Button
                mode="outlined"
                onPress={handleLogout}
                style={styles.logoutButton}
                textColor="#F44336"
                icon="logout"
              >
                Çıkış Yap
              </Button>
            </View>
          </>
        ) : (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Yükleniyor...</Text>
          </View>
        )}
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
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  avatar: {
    backgroundColor: '#2A2A2A',
  },
  avatarText: {
    backgroundColor: theme => theme.colors.primary,
  },
  editAvatarButton: {
    position: 'absolute',
    right: '35%',
    bottom: 0,
  },
  editIcon: {
    backgroundColor: '#9C27B0',
  },
  usernameText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  memberSinceText: {
    fontSize: 14,
    color: '#AAAAAA',
    textAlign: 'center',
    marginTop: 5,
  },
  divider: {
    backgroundColor: '#333',
    height: 1,
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
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
  logoutButton: {
    marginTop: 30,
    paddingVertical: 6,
    borderRadius: 10,
    borderColor: '#F44336',
    borderWidth: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default ProfileScreen;