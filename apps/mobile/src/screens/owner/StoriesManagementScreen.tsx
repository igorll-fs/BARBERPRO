/* ============================
   BARBERPRO — Gestão de Stories
   Tela para donos postarem stories
   ============================ */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../../store/user';
import { Header, AppButton, AppInput, AppCard, EmptyState } from '../../components';
import { colors, spacing, fontSize, globalStyles } from '../../theme';
import { collection, query, onSnapshot, addDoc, deleteDoc, doc, Timestamp, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Story } from '../../types/models';
import * as ImagePicker from 'expo-image-picker';

const STORY_DURATION_HOURS = 24;

export default function StoriesManagementScreen() {
  const shopId = useUser((s) => s.shopId);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [caption, setCaption] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!shopId) return;

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
      setStories(data.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [shopId]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handlePostStory = async () => {
    if (!shopId || !selectedImage) {
      Alert.alert('Erro', 'Selecione uma imagem para o story');
      return;
    }

    setUploading(true);

    try {
      // Em produção, aqui faria upload para Firebase Storage
      // Por enquanto, simulamos com a URI local
      const expiresAt = Timestamp.fromDate(
        new Date(Date.now() + STORY_DURATION_HOURS * 60 * 60 * 1000)
      );

      await addDoc(collection(db, 'barbershops', shopId, 'stories'), {
        mediaUrl: selectedImage,
        caption: caption.trim() || null,
        createdAt: Timestamp.now(),
        expiresAt,
      });

      setCaption('');
      setSelectedImage(null);
      Alert.alert('Sucesso', 'Story publicado!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível publicar o story');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteStory = (story: Story) => {
    if (!shopId) return;

    Alert.alert(
      'Confirmar',
      'Deseja remover este story?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'barbershops', shopId, 'stories', story.id));
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível remover o story');
            }
          },
        },
      ]
    );
  };

  const formatTimeLeft = (expiresAt: Timestamp) => {
    const now = Date.now();
    const expires = expiresAt.toMillis();
    const diff = expires - now;
    
    if (diff <= 0) return 'Expirado';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="📸 Stories"
        showBack
        onBack={() => {}}
      />

      <ScrollView style={styles.content}>
        {/* Novo Story */}
        <AppCard style={styles.newStoryCard}>
          <Text style={styles.sectionTitle}>Novo Story</Text>
          
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderIcon}>📷</Text>
                <Text style={styles.imagePlaceholderText}>
                  Toque para selecionar imagem
                </Text>
                <Text style={styles.imagePlaceholderSubtext}>
                  Proporção 9:16 recomendada
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <AppInput
            label="Legenda (opcional)"
            value={caption}
            onChangeText={setCaption}
            placeholder="Adicione uma descrição..."
            multiline
            numberOfLines={2}
          />

          <AppButton
            title={uploading ? 'Publicando...' : 'Publicar Story'}
            onPress={handlePostStory}
            disabled={!selectedImage || uploading}
            style={styles.postButton}
          />

          <Text style={styles.hint}>
            💡 O story expira automaticamente em {STORY_DURATION_HOURS}h
          </Text>
        </AppCard>

        {/* Stories Ativos */}
        <Text style={styles.sectionTitle}>Stories Ativos ({stories.length})</Text>

        {loading ? (
          <Text style={styles.loading}>Carregando...</Text>
        ) : stories.length === 0 ? (
          <EmptyState
            icon="📸"
            title="Nenhum story ativo"
            message="Poste stories para seus clientes verem na home"
          />
        ) : (
          <View style={styles.storiesList}>
            {stories.map((story) => (
              <AppCard key={story.id} style={styles.storyCard}>
                <Image source={{ uri: story.mediaUrl }} style={styles.storyImage} />
                
                <View style={styles.storyInfo}>
                  {story.caption && (
                    <Text style={styles.storyCaption} numberOfLines={2}>
                      {story.caption}
                    </Text>
                  )}
                  
                  <View style={styles.storyMeta}>
                    <Text style={styles.timeLeft}>
                      ⏰ Expira em: {formatTimeLeft(story.expiresAt)}
                    </Text>
                    <Text style={styles.postedAt}>
                      Postado: {story.createdAt.toDate().toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteStory(story)}
                >
                  <Text style={styles.deleteText}>🗑️ Remover</Text>
                </TouchableOpacity>
              </AppCard>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  newStoryCard: {
    marginBottom: spacing.xl,
  },
  imagePicker: {
    width: '100%',
    height: 300,
    backgroundColor: colors.bgSecondary,
    borderRadius: 12,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  imagePlaceholderIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  imagePlaceholderText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  imagePlaceholderSubtext: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  postButton: {
    marginTop: spacing.md,
  },
  hint: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  loading: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  storiesList: {
    gap: spacing.md,
  },
  storyCard: {
    flexDirection: 'row',
    padding: spacing.md,
  },
  storyImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
    backgroundColor: colors.bgSecondary,
  },
  storyInfo: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'space-between',
  },
  storyCaption: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 20,
  },
  storyMeta: {
    marginTop: spacing.sm,
  },
  timeLeft: {
    fontSize: fontSize.sm,
    color: colors.warning,
    fontWeight: '500',
  },
  postedAt: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  deleteButton: {
    justifyContent: 'center',
    paddingLeft: spacing.md,
  },
  deleteText: {
    color: colors.danger,
    fontSize: fontSize.sm,
    fontWeight: '500',
  },
});
