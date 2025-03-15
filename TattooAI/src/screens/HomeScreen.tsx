import React, { useState, useRef, useEffect, Dispatch, SetStateAction } from 'react';
import { 
  View, StyleSheet, Image, ScrollView, Alert, TouchableOpacity, 
  StatusBar, Animated, Dimensions, KeyboardAvoidingView, 
  Platform, Keyboard, TouchableWithoutFeedback
} from 'react-native';
import { Button, TextInput, Text, useTheme, Appbar, IconButton, Menu, Divider, Chip } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import openaiService, { tattooStyles, bodyParts } from '../services/openai';
import LoadingOverlay from '../components/LoadingOverlay';
import authService from '../services/auth';
import FeatureCard from '../components/FeatureCard';
// Lucide React Native'den AlignRight ikonunu import ediyoruz
import { AlignRight } from 'lucide-react-native';

// KeyboardAwareTextInput bileşeni için props tipi tanımlama
interface KeyboardAwareTextInputProps {
  value: string;
  onChangeText: Dispatch<SetStateAction<string>>;
  placeholder: string;
  label: string;
  pickImage?: () => Promise<void>;
  takePhoto?: () => Promise<void>;
}

// Özel bileşen: Klavye kapatılmasını engellen TextInput kapsayıcısı
const KeyboardAwareTextInput = ({ 
  value, 
  onChangeText, 
  placeholder, 
  label,
  pickImage,
  takePhoto 
}: KeyboardAwareTextInputProps) => {
  const theme = useTheme();
  return (
    <View style={styles.keyboardAwareContainer} pointerEvents="auto">
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        multiline={true}
        numberOfLines={4}
        style={styles.input}
        placeholder={placeholder}
        blurOnSubmit={false}
        textAlignVertical="top"
        placeholderTextColor="#888" 
        mode="flat" // 'outlined' yerine 'flat' modunu kullanıyoruz
        underlineColor="transparent" // Alt çizgiyi transparan yapıyoruz
        theme={{
          colors: {
            text: '#FFFFFF', 
            placeholder: '#888888',
            primary: theme.colors.primary,
            background: '#1E1E1E',
            onSurfaceVariant: '#CCCCCC',
          }
        }}
        textColor="#FFFFFF"
        activeUnderlineColor="transparent" // Aktif durumdaki alt çizgiyi de transparanlıyoruz
      />
      
      {/* Fotoğraf değiştirmek için ikon - arka plansız */}
      <TouchableOpacity 
        style={styles.changePhotoIcon} 
        onPress={() => Alert.alert(
          'Fotoğraf Seçenekleri',
          'Ne yapmak istersiniz?',
          [
            {
              text: 'Galeriden Seç',
              onPress: () => pickImage && pickImage(),
            },
            {
              text: 'Fotoğraf Çek',
              onPress: () => takePhoto && takePhoto(),
            },
            {
              text: 'İptal',
              style: 'cancel'
            },
          ]
        )}
      >
        <IconButton 
          icon="plus" 
          size={24} 
          iconColor="#fff" 
          style={styles.iconButtonTransparent}
        />
      </TouchableOpacity>
    </View>
  );
};

type HomeScreenNavigationProp = {
  navigate: (screen: string, params?: any) => void;
  reset: (params: { index: number; routes: { name: string }[] }) => void;
}

// Örnek dövme promptları
const sampleTattooPrompts = [
  "Minimal bir pusula dövmesi",
  "Geometrik kurt tasarımı",
  "Mandala dövmesi",
  "Nazarlık dövmesi",
  "Lotus çiçeği",
  "Dağ silüeti"
];

const HomeScreen = () => {
  const [image, setImage] = useState<string | null>(null);
  const [tattooPrompt, setTattooPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Dövme tasarımı oluşturuluyor...');
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Varsayılan değerleri silmiyoruz çünkü bunları hala API'ye göndereceğiz
  const selectedStyle = tattooStyles.REALISTIC;
  const selectedBodyPart = bodyParts.ARM;

  const theme = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();

  const screenHeight = Dimensions.get('window').height;
  const imageHeight = screenHeight * 0.6;

  // Menü için state
  const [menuVisible, setMenuVisible] = useState(false);
  const menuAnimation = useRef(new Animated.Value(0)).current;
  const menuScale = menuAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1]
  });
  const menuOpacity = menuAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });
  // Create animation for text input movement
  const textInputPosition = useRef(new Animated.Value(0)).current;
  
  // Kullanıcı oturum durumunu kontrol et
  useEffect(() => {
    const checkAuthStatus = async () => {
      const authState = await authService.getAuthState();
      setIsAuthenticated(authState.isAuthenticated);
    };
    
    checkAuthStatus();
  }, []);

  const openMenu = () => {
    setMenuVisible(true);
    Animated.timing(menuAnimation, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(menuAnimation, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setMenuVisible(false);
    });
  };

  // Fotoğraf seçme fonksiyonunu dışarıya çıkaralım
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
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Kameraya erişmek için izin vermeniz gerekmektedir.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Profil sayfasına git
  const goToProfile = async () => {
    closeMenu();
    
    // Kullanıcı giriş yapmışsa profil sayfasına git
    // Giriş yapmamışsa login sayfasına yönlendir
    const authState = await authService.getAuthState();
    
    if (authState.isAuthenticated) {
      navigation.navigate('Profile');
    } else {
      navigation.navigate('Login');
    }
  };

  // Dövme oluşturma fonksiyonu
  const generateTattoo = async () => {
    if (!image) {
      Alert.alert('Hata', 'Lütfen önce bir fotoğraf seçin.');
      return;
    }

    if (!tattooPrompt.trim()) {
      Alert.alert('Hata', 'Lütfen dövme tasarımını açıklayan bir metin girin.');
      return;
    }

    setLoadingMessage('AI dövme tasarımı oluşturuluyor...');
    setLoading(true);
    try {
      // OpenAI servisini kullanarak dövme oluşturma - stil ve bölge varsayılan değerleri kullanacak
      const tattooImageUrl = await openaiService.generateTattooImage(
        tattooPrompt,
        selectedStyle,
        selectedBodyPart,
        '1024x1024'
      );

      if (tattooImageUrl) {
        navigation.navigate('TattooPreview', {
          userImage: image,
          tattooImage: tattooImageUrl,
          description: tattooPrompt,
          style: selectedStyle,
          bodyPart: selectedBodyPart
        });
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Hata', 'Dövme oluşturulurken bir sorun oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // Klavye durumunu takip eden useEffect
  useEffect(() => {
    let keyboardShown = false; // Klavye durumunu takip eden bayrak

    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => {
        // Eğer klavye zaten gösterilmişse ikinci animasyonu engelle
        if (keyboardShown) return;
        
        keyboardShown = true;
        setKeyboardVisible(true);
        
        // Klavye yüksekliğini alıyoruz
        const keyboardHeight = e.endCoordinates.height;
        
        // Klavyenin hemen üstünde küçük bir boşlukla konumlandırıyoruz
        // 10 değeri, klavyeyle arasındaki boşluğu belirtiyor (Daha küçük bir değer)
        Animated.timing(textInputPosition, {
          toValue: -(keyboardHeight - 60), // Biraz daha az yukarı çekmek için değer arttırıldı
          duration: 250,
          useNativeDriver: true
        }).start();
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        keyboardShown = false; // Bayrak sıfırlanıyor
        setKeyboardVisible(false);
        
        // Klavye kapandığında text input'u normal konumuna getir
        Animated.timing(textInputPosition, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        }).start();
      }
    );
    
    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.mainContainer}>
        <StatusBar backgroundColor="#121212" barStyle="light-content" />
        
        {/* Header with centered INKSCAPE logo and menu button */}
        <Appbar.Header style={styles.header}>
          <View style={styles.headerContent}>
            <View style={{width: 40}} /> {/* Boşluk için yer tutucu */}
            <Text style={styles.logoText}>INKSCAPE</Text>
            <TouchableOpacity onPress={openMenu} style={styles.menuButton}>
              <AlignRight color="#FFFFFF" size={24} />
            </TouchableOpacity>
          </View>
        </Appbar.Header>
        
        {/* Custom styled menu */}
        {menuVisible && (
          <View style={styles.menuOverlay} onTouchEnd={closeMenu}>
            <Animated.View 
              style={[
                styles.menuContainer, 
                { 
                  transform: [{ scale: menuScale }],
                  opacity: menuOpacity,
                }
              ]} 
              onTouchEnd={e => e.stopPropagation()}
            >
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>Menü</Text>
                <IconButton 
                  icon="close" 
                  size={20} 
                  iconColor="#FFFFFF" 
                  onPress={closeMenu}
                  style={styles.closeButton}
                />
              </View>

              <Divider style={styles.divider} />

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={goToProfile}
              >
                <IconButton icon="account-circle" size={24} iconColor="#9C27B0" style={styles.menuIcon} />
                <Text style={styles.menuText}>Profilim</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  closeMenu();
                  Alert.alert('Tasarımlarım', 'Kaydedilen tasarımlar sayfası henüz geliştirme aşamasındadır.');
                }}
              >
                <IconButton icon="palette" size={24} iconColor="#2196F3" style={styles.menuIcon} />
                <Text style={styles.menuText}>Tasarımlarım</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  closeMenu();
                  Alert.alert('Ayarlar', 'Ayarlar sayfası henüz geliştirme aşamasındadır.');
                }}
              >
                <IconButton icon="cog" size={24} iconColor="#4CAF50" style={styles.menuIcon} />
                <Text style={styles.menuText}>Ayarlar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  closeMenu();
                  Alert.alert('Yardım', 'Yardım sayfası henüz geliştirme aşamasındadır.');
                }}
              >
                <IconButton icon="help-circle" size={24} iconColor="#FF9800" style={styles.menuIcon} />
                <Text style={styles.menuText}>Yardım ve Destek</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  closeMenu();
                  Alert.alert('Hakkında', 'INKSCAPE\nAI Destekli Dövme Tasarım Uygulaması\nSürüm 1.0.0');
                }}
              >
                <IconButton icon="information" size={24} iconColor="#F44336" style={styles.menuIcon} />
                <Text style={styles.menuText}>Hakkında</Text>
              </TouchableOpacity>
              
              {isAuthenticated && (
                <TouchableOpacity 
                  style={[styles.menuItem, styles.logoutItem]}
                  onPress={async () => {
                    closeMenu();
                    Alert.alert(
                      'Çıkış Yap',
                      'Çıkış yapmak istediğinize emin misiniz?',
                      [
                        { text: 'İptal' },
                        { 
                          text: 'Evet', 
                          onPress: async () => {
                            await authService.logout();
                            setIsAuthenticated(false);
                          } 
                        },
                      ]
                    );
                  }}
                >
                  <IconButton icon="logout" size={24} iconColor="#F44336" style={styles.menuIcon} />
                  <Text style={[styles.menuText, styles.logoutText]}>Çıkış Yap</Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          </View>
        )}

        {/* Ana içerik - Sabit boyutlu */}
        <View style={styles.contentContainer}>
          {/* Image area */}
          <View style={styles.imageArea}>
            {image ? (
              <Image 
                source={{ uri: image }} 
                style={styles.image} 
                resizeMode="cover" 
              />
            ) : (
              <View style={styles.emptyImageContainer}>
                <FeatureCard
                  title="AI Destekli"
                  description="AI destekli benzersiz dövme tasarımları oluşturun"
                />
              </View>
            )}
          </View>

          {/* Dövme tarifi input alanı - Animasyonlu konumlandırma ile */}
          <Animated.View 
            style={[
              styles.bottomSection,
              { 
                transform: [{ translateY: textInputPosition }],
                zIndex: keyboardVisible ? 1000 : 50,
                position: 'relative',
              }
            ]}
          >
            {/* Prompt önerileri - yazı kutucuğunun üzerinde */}
            {!keyboardVisible && (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.promptsContainer}
                style={styles.promptsScrollView}
              >
                {sampleTattooPrompts.map((prompt, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.promptButton}
                    onPress={() => setTattooPrompt(prompt)}
                  >
                    <Text style={styles.promptButtonText}>{prompt}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Yazı kutucuğu ve buton yan yana olacak şekilde düzenleme */}
            <View style={styles.inputWithButtonContainer}>
              <View style={styles.inputContainer}>
                <KeyboardAwareTextInput
                  label="Dövmenizi tarif edin"
                  value={tattooPrompt}
                  onChangeText={setTattooPrompt}
                  placeholder="Nasıl bir dövme hayal ediyorsunuz?"
                  pickImage={pickImage}
                  takePhoto={takePhoto}
                />
              </View>
              
              <Button 
                mode="contained" 
                onPress={generateTattoo} 
                style={[styles.sideSubmitButton, { backgroundColor: theme.colors.primary }]}
                contentStyle={styles.buttonContentStyle}
                disabled={loading || !image}
              >
                <View style={styles.buttonTextContainer}>
                  <Text style={styles.buttonTextTop}>AI</Text>
                  <Text style={styles.buttonTextMiddle}>Dövme</Text>
                  <Text style={styles.buttonTextBottom}>Tasarla</Text>
                </View>
              </Button>
            </View>
          </Animated.View>
        </View>

        <LoadingOverlay 
          visible={loading} 
          message={loadingMessage} 
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    backgroundColor: '#121212',
    // Tüm gölge ve elevation özelliklerini kaldırıyorum
  },
  headerContent: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
    fontStyle: 'italic',
    flex: 1,
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#AAAAAA',
  },
  imageArea: {
    width: '100%',
    height: '60%',
    position: 'relative',
    marginBottom: 16,
    overflow: 'hidden',
  },
  uploadContainer: {
    width: '100%',
    height: '100%',
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  uploadText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    marginHorizontal: 5,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  emptyImageContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#121212',  // Ana sayfa ile aynı siyah renk tonu
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Kaldırılan changePhotoButton stilini çıkarıyoruz
  
  bottomSection: {
    width: '100%',
    zIndex: 50,
    paddingHorizontal: 20,
    backgroundColor: '#121212',
    paddingVertical: 10,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  fast_forward: {
    backgroundColor: '#333',
    borderRadius: 12, // köşe yuvarlama
    height: '14%',
    width: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promptsScrollView: {
    marginVertical: 10,
  },
  promptsContainer: {
    alignItems: 'center',
    paddingVertical: 5,
  },
  promptButton: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  promptButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  keyboardAwareContainer: {
    width: '100%',
    position: 'relative',
  },
  input: {
    backgroundColor: '#1E1E1E',
    textAlignVertical: 'top',
    borderRadius: 20, // Oval kenarları daha belirgin yapıyorum
    borderWidth: 1,
    borderColor: '#333',
    color: '#FFFFFF',
    minHeight: 80,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
  },
  submitButton: {
    width: '100%',
    paddingVertical: 8,
    marginTop: 12,
    borderRadius: 10,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Daha koyu arka plan
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 16,
    width: '80%',
    padding: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  divider: {
    backgroundColor: '#444',
    height: 1,
    marginVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginVertical: 2,
  },
  menuIcon: {
    margin: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  menuText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#FFFFFF',
  },
  logoutItem: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#444',
    paddingTop: 15,
  },
  logoutText: {
    color: '#F44336',
  },
  changePhotoIcon: {
    position: 'absolute',
    right: 15, // Sağa biraz daha kaydırıyoruz (10'dan 15'e)
    top: 5, // Yukarıya alıyoruz (10'dan 5'e)
    zIndex: 10,
  },
  iconButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    margin: 0,
  },
  iconButtonTransparent: {
    // Arka plan olmadan sadece icon
    margin: 0,
    backgroundColor: 'transparent',
  },
  inputWithButtonContainer: {
    flexDirection: 'row', // Yan yana yerleştirmek için
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  inputContainer: {
    flex: 1, // TextInput alanının genişliği
    marginRight: 10, // Buton ile arasında boşluk
  },
  sideSubmitButton: {
    height: 80,
    justifyContent: 'center',
    borderRadius: 10,
    width: 120, // Genişliği 100'den 120'ye çıkarıyoruz
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    padding: 0, // Padding'i sıfırlıyoruz
  },
  buttonLabelStyle: {
    fontSize: 16, // Font boyutunu biraz artırıyoruz
    fontWeight: 'bold',
    letterSpacing: 0.5,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 22, // Satır yüksekliğini artırıyoruz
  },
  buttonContentStyle: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0, // Padding'i sıfırlıyoruz
  },
  buttonTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  },
  buttonTextTop: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '500', // bold yerine daha ince font
    textAlign: 'center',
    marginBottom: 1,
  },
  buttonTextMiddle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '400', // 600 yerine daha ince font
    textAlign: 'center',
    marginBottom: 1,
  },
  buttonTextBottom: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '400', // 600 yerine daha ince font
    textAlign: 'center',
  },
});

export default HomeScreen;