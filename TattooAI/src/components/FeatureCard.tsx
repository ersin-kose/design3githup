import React, { memo } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { SvgXml } from 'react-native-svg';

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

const { width } = Dimensions.get('window');
const cardWidth = width * 0.85;

// Şimşek ikonu için SVG kodu
const lightningIcon = `
  <svg viewBox="0 0 24 24" fill="none" stroke="#8B5CF6">
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M13 10V3L4 14h7v7l9-11h-7z"
    />
  </svg>
`;

const FeatureCard: React.FC<FeatureCardProps> = memo(({
  title,
  description,
  icon
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          {icon || <SvgXml xml={lightningIcon} width="32" height="32" />}
        </View>
        
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    alignSelf: 'center',
    marginVertical: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  card: {
    padding: 32,
    backgroundColor: 'rgba(31, 41, 55, 0.5)', // Gri tonlarında yarı saydam
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#AAAAAA',
    textAlign: 'center',
    lineHeight: 22,
  }
});

export default FeatureCard;