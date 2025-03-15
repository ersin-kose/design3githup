import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Button, Text, useTheme, Chip, IconButton, ActivityIndicator } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import { tattooStyles, bodyParts } from '../services/openai';
import storageService from '../services/storage';

type TattooPreviewParams = {
  userImage: string;
  tattooImage: string;
  description: string;
  style: string;
  bodyPart: string;
};

type TattooPreviewScreenRouteProp = RouteProp<{ TattooPreview: TattooPreviewParams }, 'TattooPreview'>;

// Dövme stili adlarını Türkçeleştiren yardımcı fonksiyon
const getStyleLabel = (styleValue: string) => {
  const styles: {[key: string]: string} = {
    realistic: 'Gerçekçi',
    minimalist: 'Minimalist',
    geometric: 'Geometrik',
    tribal: 'Tribal',
    blackwork: 'Blackwork',
    watercolor: 'Suluboya',
    japanese: 'Japon',
    traditional: 'Geleneksel',
  };
  return styles[styleValue] || styleValue;
};

// Vücut bölgesi adlarını Türkçeleştiren yardımcı fonksiyon
const getBodyPartLabel = (bodyPartValue: string) => {
  const parts: {[key: string]: string} = {
    arm: 'Kol',
    forearm: 'Ön Kol',
    shoulder: 'Omuz',
    back: 'Sırt',
    chest: 'Göğüs',
    leg: 'Bacak',
    ankle: 'Ayak Bileği',
    wrist: 'El Bileği',
    neck: 'Boyun',
    hand: 'El',
    other: 'Diğer',
  };
  return parts[bodyPartValue] || bodyPartValue;
};

const TattooPreviewScreen = () => {
  const route = useRoute<TattooPreviewScreenRouteProp>();
  const { userImage, tattooImage, description, style = tattooStyles.REALISTIC, bodyPart = bodyParts.OTHER } = route.params;
  const theme = useTheme();
  const navigation = useNavigation();
  
  // Dövme pozisyonu için state'ler
  const [position, setPosition] = useState({ x: 150, y: 150 });
  const [scale, setScale] = useState(0.5);
  const [opacity, setOpacity] = useState(0.85);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [blendMode, setBlendMode] = useState<'normal' | 'multiply' | 'screen'>('multiply');

  // İşlemi takip eden state
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Dövme tasarımını taşıma fonksiyonu
  const moveTattoo = (event: any) => {
    if (isDragging) {
      const { locationX, locationY } = event.nativeEvent;
      setPosition({ x: locationX, y: locationY });
    }
  };

  // Fotoğrafı kaydetme fonksiyonu (gerçek bir kaydetme işlemi)
  const saveTattooDesign = async () => {
    try {
      setSaving(true);
      
      await storageService.saveDesign({
        userImage,
        tattooImage,
        description,
        style,
        bodyPart
      });
      
      setIsSaved(true);
      Alert.alert(
        'Tasarım Kaydedildi',
        'Dövme tasarımınız başarıyla kaydedildi. Tasarımlarınıza menüden erişebilirsiniz.',
        [{ text: 'Tamam' }]
      );
    } catch (error) {
      console.error('Error saving design:', error);
      Alert.alert('Hata', 'Tasarım kaydedilirken bir sorun oluştu. Lütfen tekrar deneyin.');
    } finally {
      setSaving(false);
    }
  };

  // Yeni bir dövme oluşturma fonksiyonu
  const createNewDesign = () => {
    navigation.goBack();
  };

  // Dövmeyi döndürme fonksiyonu
  const rotateTattoo = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setRotation(prev => prev - 15);
    } else {
      setRotation(prev => prev + 15);
    }
  };

  // Blend mode seçenekleri
  const blendModes = [
    { label: 'Normal', value: 'normal' },
    { label: 'Çarpma', value: 'multiply' },
    { label: 'Ekran', value: 'screen' }
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.title}>Dövme Önizleme</Text>
        
        {/* Dövme stili ve vücut bölgesi bilgisini göster */}
        <View style={styles.infoContainer}>
          <Chip 
            icon="brush" 
            style={styles.chip} 
            textStyle={styles.chipText}
          >
            Stil: {getStyleLabel(style)}
          </Chip>
          <Chip 
            icon="human" 
            style={styles.chip} 
            textStyle={styles.chipText}
          >
            Bölge: {getBodyPartLabel(bodyPart)}
          </Chip>
        </View>
        
        <View style={styles.imageContainer}>
          <TouchableOpacity
            activeOpacity={1}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            onTouchMove={moveTattoo}
            style={styles.touchableArea}
          >
            <Image source={{ uri: userImage }} style={styles.userImage} />
            <Image
              source={{ uri: tattooImage }}
              style={[
                styles.tattooImage,
                {
                  transform: [
                    { scale: scale },
                    { rotate: `${rotation}deg` }
                  ],
                  opacity: opacity,
                  left: position.x - 50 * scale,
                  top: position.y - 50 * scale,
                  // @ts-ignore - blendMode tiplemesi için
                  mixBlendMode: blendMode,
                }
              ]}
            />
          </TouchableOpacity>
        </View>

        {/* Döndürme butonları */}
        <View style={styles.rotationContainer}>
          <IconButton
            icon="rotate-left"
            size={24}
            iconColor="#FFFFFF"
            onPress={() => rotateTattoo('left')}
            style={styles.rotateButton}
          />
          <Text style={styles.controlLabel}>Döndür: {rotation}°</Text>
          <IconButton
            icon="rotate-right"
            size={24}
            iconColor="#FFFFFF"
            onPress={() => rotateTattoo('right')}
            style={styles.rotateButton}
          />
        </View>

        <View style={styles.controlsContainer}>
          <Text style={styles.controlLabel}>Boyut: {Math.round(scale * 100)}%</Text>
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderValue}>20%</Text>
            <Slider
              value={scale}
              onValueChange={setScale}
              minimumValue={0.2}
              maximumValue={1.5}
              style={styles.slider}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor="#333333"
              thumbTintColor={theme.colors.primary}
            />
            <Text style={styles.sliderValue}>150%</Text>
          </View>
          
          <Text style={styles.controlLabel}>Opaklık: {Math.round(opacity * 100)}%</Text>
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderValue}>30%</Text>
            <Slider
              value={opacity}
              onValueChange={setOpacity}
              minimumValue={0.3}
              maximumValue={1.0}
              style={styles.slider}
              minimumTrackTintColor={theme.colors.primary}
              maximumTrackTintColor="#333333"
              thumbTintColor={theme.colors.primary}
            />
            <Text style={styles.sliderValue}>100%</Text>
          </View>

          <Text style={styles.controlLabel}>Karışım Modu:</Text>
          <View style={styles.blendModesContainer}>
            {blendModes.map((mode) => (
              <Chip
                key={mode.value}
                selected={blendMode === mode.value}
                onPress={() => setBlendMode(mode.value as 'normal' | 'multiply' | 'screen')}
                style={[
                  styles.blendModeChip,
                  blendMode === mode.value && { backgroundColor: theme.colors.primaryContainer }
                ]}
              >
                {mode.label}
              </Chip>
            ))}
          </View>
        </View>

        <Text style={styles.descriptionTitle}>Dövme Açıklaması:</Text>
        <Text style={styles.description}>{description}</Text>
        
        <View style={styles.buttonContainer}>
          <Button 
            mode="contained"
            onPress={saveTattooDesign}
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            disabled={saving || isSaved}
            icon={isSaved ? "check" : "content-save"}
          >
            {saving ? (
              <>
                <ActivityIndicator size={16} color="#FFF" style={{ marginRight: 8 }} />
                Kaydediliyor...
              </>
            ) : isSaved ? 'Kaydedildi' : 'Tasarımı Kaydet'}
          </Button>
          <Button 
            mode="outlined"
            onPress={createNewDesign}
            style={styles.button}
            icon="brush"
          >
            Yeni Tasarım Oluştur
          </Button>
          <Button 
            mode="text"
            onPress={() => {
              // Sosyal medyada paylaşım özelliği (gelecekte eklenecek)
              Alert.alert('Bilgi', 'Paylaşım özelliği yakında eklenecektir.');
            }}
            style={styles.button}
            icon="share-variant"
          >
            Paylaş
          </Button>
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
  scrollView: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    alignSelf: 'center',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  chip: {
    backgroundColor: '#1E1E1E',
    marginHorizontal: 4,
  },
  chipText: {
    color: '#FFFFFF',
  },
  imageContainer: {
    width: '100%',
    height: 400,
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  touchableArea: {
    width: '100%',
    height: '100%',
  },
  userImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  tattooImage: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    position: 'absolute',
  },
  rotationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  rotateButton: {
    backgroundColor: 'rgba(100, 100, 100, 0.2)',
    margin: 0,
  },
  controlsContainer: {
    marginBottom: 20,
  },
  controlLabel: {
    color: '#AAAAAA',
    marginBottom: 5,
    textAlign: 'center',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderValue: {
    color: '#777777',
    width: 40,
    fontSize: 12,
  },
  blendModesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 5,
    marginBottom: 15,
  },
  blendModeChip: {
    marginHorizontal: 5,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#AAAAAA',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#1E1E1E',
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'column',
    marginBottom: 20,
  },
  button: {
    marginBottom: 10,
    paddingVertical: 5,
  },
});

export default TattooPreviewScreen;