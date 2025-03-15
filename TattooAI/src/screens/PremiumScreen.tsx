import React, { useState, memo, useCallback, useMemo } from 'react';
import { 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  Platform, 
  ActivityIndicator, 
  Alert,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Appbar, useTheme, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

// Premium planları
const plans = [
  {
    id: 'weekly',
    name: 'Haftalık',
    price: '₺49.99/hafta',
    features: [
      'Sınırsız dövme tasarımı',
      'Tüm düzenleme araçları',
      'HD kalitede tasarımlar',
      'Topluluk desteği'
    ],
    recommended: false
  },
  {
    id: 'monthly',
    name: 'Aylık',
    price: '₺129.99/ay',
    features: [
      'Sınırsız dövme tasarımı',
      'Tüm düzenleme araçları',
      'HD kalitede tasarımlar',
      'Öncelikli destek',
      'Özel tasarım şablonları'
    ],
    recommended: true
  }
];

// Özellik öğesi bileşeni
const FeatureItem = memo(({ feature }: { feature: string }) => {
  return (
    <View style={styles.featureItem}>
      <View style={styles.checkCircle}>
        <Text style={styles.checkIcon}>✓</Text>
      </View>
      <Text style={styles.featureText}>{feature}</Text>
    </View>
  );
});

// Özellik listesi bileşeni
const FeatureList = memo(({ features }: { features: string[] }) => {
  return (
    <View style={styles.featureList}>
      {features.map((feature, index) => (
        <FeatureItem key={index} feature={feature} />
      ))}
    </View>
  );
});

// Fiyat etiketi bileşeni
const PriceTag = memo(({ price }: { price: string }) => {
  return (
    <View style={styles.priceTag}>
      <Text style={styles.priceText}>{price}</Text>
    </View>
  );
});

// Gradient düğme bileşeni
const GradientButton = memo(({ title, onPress, loading, disabled }: { title: string; onPress: () => void; loading?: boolean; disabled?: boolean }) => {
  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={onPress}
      disabled={loading || disabled}
    >
      <LinearGradient
        colors={disabled ? ['#555555', '#333333'] : ['#9C27B0', '#6200EE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradientButton, disabled && styles.disabledButton]}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.buttonText}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
});

// Premium kart bileşeni
const PremiumCard = memo(({ 
  plan, 
  onSelect, 
  loading, 
  selected 
}: { 
  plan: typeof plans[0]; 
  onSelect: () => void; 
  loading?: boolean;
  selected: boolean;
}) => {
  
  const cardStyles = useMemo(() => [
    styles.premiumCard,
    plan.recommended ? styles.recommendedCard : {},
    selected ? styles.selectedCard : {}
  ], [plan.recommended, selected]);

  return (
    <LinearGradient
      colors={plan.recommended ? ['#290049', '#1A0033'] : ['#1E1E1E', '#121212']}
      style={cardStyles}
    >
      {plan.recommended && (
        <View style={styles.recommendedBadge}>
          <Text style={styles.recommendedText}>POPÜLER</Text>
        </View>
      )}
      <Text style={styles.planName}>{plan.name}</Text>
      <PriceTag price={plan.price} />
      <FeatureList features={plan.features} />
      <GradientButton 
        title={loading && selected ? "İşlem yapılıyor..." : "Seç"}
        onPress={onSelect}
        loading={loading && selected}
        disabled={!plan.recommended}
      />
    </LinearGradient>
  );
});

const PremiumScreen = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation();
  const theme = useTheme();

  // Plan seçimi işleyicisi
  const handleSelectPlan = useCallback((planId: string) => {
    setSelectedPlan(planId);
    
    if (planId === 'monthly') {
      setLoading(true);
      
      // Simüle edilmiş satın alma işlemi
      setTimeout(() => {
        setLoading(false);
        Alert.alert(
          'Premium Abonelik',
          'Aylık premium aboneliğiniz aktif edildi! Tüm premium özelliklere erişebilirsiniz.',
          [{ text: 'Harika!', onPress: () => navigation.goBack() }]
        );
      }, 2000);
    } else {
      // Haftalık plan için kullanıcıya tavsiye göster
      Alert.alert(
        'Daha İyi Bir Teklif',
        'Aylık planımız daha fazla özellik sunar ve daha ekonomiktir. Aylık plana geçmek ister misiniz?',
        [
          { text: 'Hayır', style: 'cancel' },
          { text: 'Evet', onPress: () => handleSelectPlan('monthly') }
        ]
      );
    }
  }, [navigation]);

  // Image yerine IconButton kullanıyoruz
  const renderPremiumBadge = useMemo(() => (
    <IconButton
      icon="crown"
      size={80}
      iconColor="#FFD700"
      style={styles.premiumIcon}
    />
  ), []);

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color="#FFFFFF" />
        <Appbar.Content title="Premium" titleStyle={styles.headerTitle} color="#FFFFFF" />
      </Appbar.Header>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          {renderPremiumBadge}
        </View>

        <Text style={styles.titleText}>Premium'a Yüksel</Text>
        <Text style={styles.subtitleText}>
          Sınırsız dövme tasarımı, gelişmiş düzenleme araçları ve daha fazlası için premium'a geçin.
        </Text>

        {plans.map((plan) => (
          <PremiumCard
            key={plan.id}
            plan={plan}
            onSelect={() => handleSelectPlan(plan.id)}
            loading={loading}
            selected={selectedPlan === plan.id}
          />
        ))}

        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>Premium Avantajları</Text>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitNumber}>1</Text>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Sınırsız Tasarım</Text>
              <Text style={styles.benefitDescription}>
                Günlük tasarım limitini kaldırın ve dilediğiniz kadar dövme tasarlayın.
              </Text>
            </View>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitNumber}>2</Text>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>HD Kalite</Text>
              <Text style={styles.benefitDescription}>
                Yüksek çözünürlüklü, detaylı dövme tasarımlarına erişin.
              </Text>
            </View>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitNumber}>3</Text>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Öncelikli Destek</Text>
              <Text style={styles.benefitDescription}>
                Size özel müşteri desteği ve öncelikli yanıt alma imkanı.
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.termsText}>
          Abonelik otomatik olarak yenilenir. İstediğiniz zaman hesap ayarlarınızdan iptal edebilirsiniz.
          Kullanım koşullarımızı kabul etmiş olursunuz.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');
const cardWidth = width - 40;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    backgroundColor: 'transparent',
    elevation: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  premiumIcon: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 50,
    width: 100,
    height: 100,
  },
  titleText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 16,
    color: '#AAAAAA',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  premiumCard: {
    width: cardWidth,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  recommendedCard: {
    padding: 24,
    borderWidth: 2,
    borderColor: '#9C27B0',
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#6200EE',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -12,
    right: 20,
    backgroundColor: '#9C27B0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  recommendedText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  planName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  priceTag: {
    marginBottom: 20,
  },
  priceText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  featureList: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#9C27B0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  featureText: {
    color: '#FFFFFF',
    marginLeft: 10,
    fontSize: 16,
  },
  gradientButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  benefitsContainer: {
    width: '100%',
    marginTop: 20,
    marginBottom: 30,
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  benefitNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#9C27B0',
    textAlign: 'center',
    textAlignVertical: 'center',
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 15,
    overflow: 'hidden',
    paddingTop: Platform.OS === 'android' ? 2 : 6,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#AAAAAA',
    lineHeight: 20,
  },
  termsText: {
    fontSize: 12,
    color: '#777777',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
});

export default PremiumScreen;