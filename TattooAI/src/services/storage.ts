import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SavedDesign {
  id: string;
  userImage: string;
  tattooImage: string;
  description: string;
  style: string;
  bodyPart: string;
  createdAt: number;
}

const STORAGE_KEY = 'INKSCAPE_SAVED_DESIGNS';

/**
 * Kaydedilmiş tüm dövme tasarımlarını getirir
 */
export const getSavedDesigns = async (): Promise<SavedDesign[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (jsonValue !== null) {
      return JSON.parse(jsonValue);
    }
    return [];
  } catch (error) {
    console.error('Error getting saved designs:', error);
    return [];
  }
};

/**
 * Yeni bir dövme tasarımını kaydeder
 */
export const saveDesign = async (design: Omit<SavedDesign, 'id' | 'createdAt'>): Promise<SavedDesign> => {
  try {
    const savedDesigns = await getSavedDesigns();
    
    // Yeni tasarım objesi oluştur
    const newDesign: SavedDesign = {
      ...design,
      id: `design_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      createdAt: Date.now()
    };
    
    // Tasarımı listeye ekle ve kaydet
    const updatedDesigns = [newDesign, ...savedDesigns];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDesigns));
    
    return newDesign;
  } catch (error) {
    console.error('Error saving design:', error);
    throw error;
  }
};

/**
 * Belirli bir dövme tasarımını siler
 */
export const deleteDesign = async (designId: string): Promise<void> => {
  try {
    const savedDesigns = await getSavedDesigns();
    const updatedDesigns = savedDesigns.filter(design => design.id !== designId);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDesigns));
  } catch (error) {
    console.error('Error deleting design:', error);
    throw error;
  }
};

export default {
  getSavedDesigns,
  saveDesign,
  deleteDesign,
};