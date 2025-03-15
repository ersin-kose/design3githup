import axios from 'axios';
import { Alert } from 'react-native';

// OpenAI API anahtarınızı buraya ekleyin
// NOT: Gerçek bir uygulamada, API anahtarınızı güvenli bir şekilde saklamalısınız
// ideal olarak bir backend sunucusunda tutulmalı veya env dosyasında saklanmalıdır
// TEST amacıyla aşağıdaki anahtar yerine gerçek bir OpenAI API anahtarı eklemelisiniz
const OPENAI_API_KEY = 'sk_test_placeholder_key_for_development';

// API anahtarı eksikse veya placeholder ise simüle edilmiş bir yanıt dönelim
const USE_MOCKED_DATA = !OPENAI_API_KEY || OPENAI_API_KEY.includes('placeholder');

const instance = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENAI_API_KEY}`
  }
});

// Dövme stilleri
export const tattooStyles = {
  REALISTIC: 'realistic',
  MINIMALIST: 'minimalist',
  GEOMETRIC: 'geometric',
  TRIBAL: 'tribal',
  BLACKWORK: 'blackwork',
  WATERCOLOR: 'watercolor',
  JAPANESE: 'japanese',
  TRADITIONAL: 'traditional'
};

// Vücut bölgeleri
export const bodyParts = {
  ARM: 'arm',
  FOREARM: 'forearm',
  SHOULDER: 'shoulder',
  BACK: 'back',
  CHEST: 'chest',
  LEG: 'leg',
  ANKLE: 'ankle',
  WRIST: 'wrist',
  NECK: 'neck',
  HAND: 'hand',
  OTHER: 'other'
};

// Simüle edilmiş resim URL'leri - test için
const MOCKED_IMAGE_URLS = [
  'https://placehold.co/1024x1024/png?text=Simulated+Tattoo+Design',
  'https://placehold.co/1024x1024/png?text=Tattoo+Preview'
];

/**
 * Verilen bilgilere göre dövme tasarımı oluşturur
 * @param prompt Kullanıcının dövme açıklaması
 * @param style Dövme stili (opsiyonel)
 * @param bodyPart Vücut bölgesi (opsiyonel)
 * @param size Görsel boyutu 
 * @returns Oluşturulan dövme görseli URL'i
 */
export const generateTattooImage = async (
  prompt: string,
  style: string = tattooStyles.REALISTIC,
  bodyPart: string = bodyParts.OTHER,
  size: '256x256' | '512x512' | '1024x1024' = '1024x1024'
) => {
  try {
    // Test modu etkinse, simüle edilmiş bir yanıt döndür
    if (USE_MOCKED_DATA) {
      console.log('[DEV] Using simulated tattoo image response');
      return MOCKED_IMAGE_URLS[0];
    }

    // Daha spesifik ve kaliteli dövme tasarımları için gelişmiş prompt
    let enhancedPrompt = `Create a unique ${style} tattoo design concept based on: "${prompt}".`;
    
    // Vücut bölgesine göre optimize et
    if (bodyPart !== bodyParts.OTHER) {
      enhancedPrompt += ` Design it specifically to fit well on the ${bodyPart}.`;
    }
    
    // Dövme tasarımının görsel özellikleri
    enhancedPrompt += ` The tattoo should be highly detailed with clean lines, using only black and shades of gray.`;
    enhancedPrompt += ` Create a realistic tattoo design that would look good on actual skin, with proper contrast and spacing.`;
    enhancedPrompt += ` The design should be isolated on a transparent or plain background to make it easy to visualize.`;

    const response = await instance.post('/images/generations', {
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: size,
      quality: "hd", // Daha yüksek kalite için
    });

    return response.data.data[0].url;
  } catch (error: any) {
    console.error('Error generating tattoo image:', error.response?.data || error.message);
    Alert.alert('Hata', 'Dövme tasarımı oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    return null;
  }
};

/**
 * Kullanıcının fotoğrafına göre uyarlanmış dövme önerileri oluşturur
 * @param userPhotoDescription Kullanıcı fotoğrafının analiz edilmiş açıklaması
 * @param userRequest Kullanıcının dövme isteği
 * @returns Dövme önerilerinin açıklaması
 */
export const generateTattooSuggestions = async (
  userPhotoDescription: string,
  userRequest: string
) => {
  try {
    // Test modu etkinse, simüle edilmiş bir yanıt döndür
    if (USE_MOCKED_DATA) {
      console.log('[DEV] Using simulated tattoo suggestions response');
      return `
# Dövme Önerileri

## 1. Minimal Geometrik Tasarım
Bu tasarım, basit geometrik şekillerden oluşan bir dövme. Temiz çizgiler ve minimal detaylar ile şık bir görünüm sağlar.

## 2. Doğa Temalı İllüstrasyon
Doğadan ilham alan bu dövme, yapraklar ve bitkiler kullanarak organik bir tasarım sunar.

## 3. Soyut Sanat Eseri
Modern sanat esintileriyle, soyut bir dövme tasarımı. Akışkan çizgiler ve dinamik formlar içerir.
      `;
    }

    const response = await instance.post('/chat/completions', {
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "Sen profesyonel bir dövme sanatçısısın. Kullanıcının fotoğrafına ve isteklerine göre benzersiz ve kişiselleştirilmiş dövme önerileri sunacaksın." 
        },
        { 
          role: "user", 
          content: `Fotoğraf açıklaması: ${userPhotoDescription}\n\nKullanıcının isteği: ${userRequest}\n\nLütfen bu kişiye özel 3 farklı dövme tasarımı öner. Her öneri için bir başlık, kısa açıklama ve DALL-E için kullanılabilecek bir prompt yaz.` 
        }
      ],
      max_tokens: 500
    });

    return response.data.choices[0].message.content;
  } catch (error: any) {
    console.error('Error generating tattoo suggestions:', error.response?.data || error.message);
    Alert.alert('Hata', 'Dövme önerileri oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    return null;
  }
};

export default {
  generateTattooImage,
  generateTattooSuggestions,
  tattooStyles,
  bodyParts
};