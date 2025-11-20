import React from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { colors } from '../../theme';

interface AvatarContainerProps {
  videoUrl?: string;
  imageUrl?: string;
  size?: number;
  style?: any;
}

const { width } = Dimensions.get('window');

export default function AvatarContainer({
  videoUrl,
  imageUrl,
  size = width * 0.6,
  style,
}: AvatarContainerProps) {
  // Pour l'instant, on utilise un placeholder
  // Plus tard, on pourra intégrer une vidéo avec react-native-video
  
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.avatar} resizeMode="contain" />
      ) : (
        <View style={styles.placeholder}>
          <View style={styles.avatarPlaceholder}>
            {/* Placeholder pour l'avatar - sera remplacé par la vidéo */}
            <View style={styles.face}>
              <View style={styles.eye} />
              <View style={styles.eye} />
              <View style={styles.mouth} />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholder: {
    width: '80%',
    height: '80%',
    borderRadius: 200,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  face: {
    width: '60%',
    height: '60%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eye: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    marginBottom: 10,
  },
  mouth: {
    width: 40,
    height: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderWidth: 3,
    borderColor: colors.primary,
    borderTopWidth: 0,
  },
});
