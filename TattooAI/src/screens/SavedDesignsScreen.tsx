import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, IconButton, ActivityIndicator, Button, Divider } from 'react-native-paper';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import storageService, { SavedDesign } from '../services/storage';
import { getStyleLabel, getBodyPartLabel } from '../utils/helpers';

const SavedDesignsScreen = () => {
  const [designs, setDesigns] = useState<SavedDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  // Kayıtlı tasarımları yükle
  useEffect(() => {
    const loadDesigns = async () => {
      setLoading(true);
      try {
        const savedDesigns = await storageService.getSavedDesigns();
        setDesigns(savedDesigns);
      } catch (error) {
        console.error('Error loading designs:', error);
        Alert.alert('Hata', 'Tasarımlar yüklenirken bir sorun oluştu.');
      } finally {
        setLoading(false);
      }
    };

    // Ekran her odaklandığında yeniden yükle
    if (isFocused) {
      loadDesigns();
    }
  }, [isFocused]);

  // Tasarım silme fonksiyonu
  const handleDeleteDesign = (designId: string) => {
    Alert.alert(
      'Tasarımı Sil',
      'Bu dövme tasarımını silmek istediğinizden emin misiniz?',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await storageService.deleteDesign(designId);
              // Listeden kaldır
              setDesigns(designs.filter(design => design.id !== designId));
            } catch (error) {
              console.error('Error deleting design:', error);
              Alert.alert('Hata', 'Tasarım silinirken bir sorun oluştu.');
            }
          },
        },
      ]
    );
  };

  // Tasarıma tıklama fonksiyonu - önizleme için
  const handleViewDesign = (design: SavedDesign) => {
    navigation.navigate('TattooPreview', {
      userImage: design.userImage,
      tattooImage: design.tattooImage,
      description: design.description,
      style: design.style,
      bodyPart: design.bodyPart,
      fromSaved: true
    });
  };

  // Tarih formatını güzelleştirme
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Tasarım kartı bileşeni
  const renderDesignCard = ({ item }: { item: SavedDesign }) => (
    <Card style={styles.card} mode="elevated">
      <Card.Title
        title={`Tasarım - ${formatDate(item.createdAt)}`}
        titleStyle={styles.cardTitle}
        right={(props) => (
          <IconButton
            {...props}
            icon="delete"
            iconColor="rgba(255, 255, 255, 0.7)"
            onPress={() => handleDeleteDesign(item.id)}
          />
        )}
      />
      <Card.Content>
        <View style={styles.designInfo}>
          <Text style={styles.designInfoText}>Stil: {getStyleLabel(item.style)}</Text>
          <Text style={styles.designInfoText}>Bölge: {getBodyPartLabel(item.bodyPart)}</Text>
        </View>
      </Card.Content>
      <TouchableOpacity onPress={() => handleViewDesign(item)}>
        <View style={styles.imagesContainer}>
          <Image source={{ uri: item.userImage }} style={styles.userImage} />
          <Image source={{ uri: item.tattooImage }} style={styles.tattooImage} />
        </View>
      </TouchableOpacity>
      <Card.Content>
        <Text style={styles.descriptionText} numberOfLines={3}>
          {item.description}
        </Text>
      </Card.Content>
      <Card.Actions>
        <Button onPress={() => handleViewDesign(item)}>Görüntüle</Button>
        <Button 
          onPress={() => {
            Alert.alert('Bilgi', 'Bu özellik yakında eklenecektir.');
          }}
          icon="share-variant"
        >
          Paylaş
        </Button>
      </Card.Actions>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kaydedilen Tasarımlar</Text>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200EE" />
          <Text style={styles.loadingText}>Tasarımlar yükleniyor...</Text>
        </View>
      ) : designs.length > 0 ? (
        <FlatList
          data={designs}
          renderItem={renderDesignCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <IconButton icon="palette" size={64} iconColor="#6200EE" />
          <Text style={styles.emptyText}>Henüz kaydedilmiş dövme tasarımınız yok.</Text>
          <Button mode="contained" onPress={() => navigation.navigate('Home')}>
            Yeni Tasarım Oluştur
          </Button>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#AAAAAA',
    marginTop: 12,
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#1E1E1E',
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  designInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  designInfoText: {
    color: '#AAAAAA',
    fontSize: 14,
  },
  imagesContainer: {
    flexDirection: 'row',
    height: 150,
    marginVertical: 8,
  },
  userImage: {
    flex: 1,
    height: '100%',
    resizeMode: 'cover',
  },
  tattooImage: {
    width: 100,
    height: '100%',
    resizeMode: 'contain',
  },
  descriptionText: {
    color: '#CCCCCC',
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#AAAAAA',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default SavedDesignsScreen;