/**
 * Dövme stili adlarını Türkçeleştiren yardımcı fonksiyon
 */
export const getStyleLabel = (styleValue: string): string => {
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

/**
 * Vücut bölgesi adlarını Türkçeleştiren yardımcı fonksiyon
 */
export const getBodyPartLabel = (bodyPartValue: string): string => {
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

/**
 * Tarihi formatlar
 */
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Güncel ekran boyutlarını alır
 */
export const getScreenDimensions = (): {width: number; height: number} => {
  return {
    width: 0,
    height: 0
  };
  // Bu fonksiyon React Native'in Dimensions API'sini kullanarak
  // güncel ekran boyutlarını almak için kullanılabilir.
  // Şimdilik sadece placeholder olarak burada.
};

export default {
  getStyleLabel,
  getBodyPartLabel,
  formatDate,
  getScreenDimensions
};