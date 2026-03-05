/* ============================
   BARBERPRO — Stories Viewer
   Componente para clientes verem stories
   ============================ */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { collection, query, onSnapshot, Timestamp, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Story } from '../types/models';
import { colors, spacing, fontSize } from '../theme';

const { width, height } = Dimensions.get('window');

interface StoriesViewerProps {
  shopId: string;
  visible: boolean;
  onClose: () => void;
}

export default function StoriesViewer({ shopId, visible, onClose }: StoriesViewerProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress] = useState(new Animated.Value(0));
  const [isPaused, setIsPaused] = useState(false);

  const STORY_DURATION = 5000; // 5 segundos por story

  useEffect(() => {
    if (!shopId || !visible) return;

    const now = Timestamp.now();
    const q = query(
      collection(db, 'barbershops', shopId, 'stories'),
      where('expiresAt', '>', now)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Story[];
      setStories(data.sort((a, b) => a.createdAt.seconds - b.createdAt.seconds));
    });

    return () => unsubscribe();
  }, [shopId, visible]);

  useEffect(() => {
    if (!visible || stories.length === 0 || isPaused) return;

    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: STORY_DURATION,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        nextStory();
      }
    });

    return () => {
      progress.stopAnimation();
    };
  }, [currentIndex, visible, stories.length, isPaused]);

  const nextStory = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  const prevStory = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  const handleTap = (event: any) => {
    const { locationX } = event.nativeEvent;
    const screenWidth = width;
    
    if (locationX < screenWidth / 2) {
      prevStory();
    } else {
      nextStory();
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: () => setIsPaused(true),
    onPanResponderRelease: () => setIsPaused(false),
  });

  if (!visible || stories.length === 0) return null;

  const currentStory = stories[currentIndex];

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Progress Bars */}
        <View style={styles.progressContainer}>
          {stories.map((_, index) => (
            <View key={index} style={styles.progressBarContainer}>
              <Animated.View
                style={[
                  styles.progressBar,
                  {
                    width: index === currentIndex
                      ? progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        })
                      : index < currentIndex
                      ? '100%'
                      : '0%',
                  },
                ]}
              />
            </View>
          ))}
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.storyNumber}>
            {currentIndex + 1} / {stories.length}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Story Content */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleTap}
          style={styles.storyContainer}
          {...panResponder.panHandlers}
        >
          <Image
            source={{ uri: currentStory.mediaUrl }}
            style={styles.storyImage}
            resizeMode="contain"
          />
          
          {currentStory.caption && (
            <View style={styles.captionContainer}>
              <Text style={styles.caption}>{currentStory.caption}</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Navigation Hints */}
        <View style={styles.hints} pointerEvents="none">
          <Text style={styles.hintText}>← Anterior</Text>
          <Text style={styles.hintText}>Próximo →</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  progressContainer: {
    flexDirection: 'row',
    padding: spacing.md,
    paddingTop: spacing.xl,
    gap: spacing.xs,
  },
  progressBarContainer: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    paddingTop: 0,
  },
  storyNumber: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
  closeButton: {
    padding: spacing.sm,
  },
  closeText: {
    color: colors.text,
    fontSize: fontSize.xl,
    fontWeight: 'bold',
  },
  storyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyImage: {
    width: width,
    height: height * 0.7,
  },
  captionContainer: {
    position: 'absolute',
    bottom: 100,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: spacing.md,
    borderRadius: 12,
  },
  caption: {
    color: colors.text,
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  hints: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  hintText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: fontSize.sm,
  },
});
