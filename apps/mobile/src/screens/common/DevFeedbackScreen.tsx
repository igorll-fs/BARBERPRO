/**
 * DevFeedbackScreen - Sistema de feedback para o desenvolvedor
 * Ideias de melhorias, bugs e votação de features
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  increment,
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import { colors, spacing, fontSize, radius, globalStyles } from '../../theme';
import { Header, AppButton, AppCard, Badge } from '../../components';
import { useUser } from '../../store/user';

type FeedbackType = 'bug' | 'feature' | 'improvement' | 'other';
type FeedbackStatus = 'new' | 'under_review' | 'planned' | 'in_progress' | 'completed' | 'rejected';

interface FeedbackItem {
  id: string;
  type: FeedbackType;
  title: string;
  description: string;
  authorUid: string;
  authorName: string;
  authorRole: string;
  authorCountry: string;
  votes: number;
  votedBy: string[];
  status: FeedbackStatus;
  adminComment?: string;
  createdAt: any;
}

const FEEDBACK_TYPES: Record<FeedbackType, { label: string; emoji: string; color: string }> = {
  bug: { label: 'Bug', emoji: '🐛', color: colors.error },
  feature: { label: 'Nova Feature', emoji: '✨', color: colors.success },
  improvement: { label: 'Melhoria', emoji: '💡', color: colors.warning },
  other: { label: 'Outro', emoji: '💬', color: colors.textSecondary },
};

const STATUS_LABELS: Record<FeedbackStatus, string> = {
  new: '🆕 Novo',
  under_review: '🔍 Em Análise',
  planned: '📋 Planejado',
  in_progress: '🚧 Em Desenvolvimento',
  completed: '✅ Concluído',
  rejected: '❌ Não Implementado',
};

export default function DevFeedbackScreen() {
  const { uid, name, role } = useUser();
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'bugs' | 'features' | 'my'>('all');
  const [isCreating, setIsCreating] = useState(false);
  
  // Form
  const [newType, setNewType] = useState<FeedbackType>('feature');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [userCountry, setUserCountry] = useState('BR');

  useEffect(() => {
    const feedbacksQuery = query(
      collection(db, 'devFeedback', 'items', 'all'),
      orderBy('votes', 'desc')
    );

    const unsubscribe = onSnapshot(feedbacksQuery, (snapshot) => {
      const items: FeedbackItem[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as FeedbackItem);
      });
      setFeedbacks(items);
    });

    return () => unsubscribe();
  }, []);

  const submitFeedback = async () => {
    if (!uid) {
      Alert.alert('Login necessário', 'Faça login para enviar feedback');
      return;
    }

    if (!newTitle.trim() || !newDescription.trim()) {
      Alert.alert('Campos obrigatórios', 'Preencha título e descrição');
      return;
    }

    try {
      await addDoc(collection(db, 'devFeedback', 'items', 'all'), {
        type: newType,
        title: newTitle.trim(),
        description: newDescription.trim(),
        authorUid: uid,
        authorName: name || 'Usuário',
        authorRole: role,
        authorCountry: userCountry,
        votes: 0,
        votedBy: [],
        status: 'new',
        createdAt: serverTimestamp(),
      });

      Alert.alert('✅ Enviado!', 'Obrigado pelo feedback! Sua sugestão ajuda a melhorar o BarberPro.');
      setIsCreating(false);
      setNewTitle('');
      setNewDescription('');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível enviar o feedback');
    }
  };

  const voteFeedback = async (feedbackId: string) => {
    if (!uid) {
      Alert.alert('Login necessário', 'Faça login para votar');
      return;
    }

    const feedbackRef = doc(db, 'devFeedback', 'items', 'all', feedbackId);
    const feedback = feedbacks.find(f => f.id === feedbackId);
    
    if (!feedback) return;

    const hasVoted = feedback.votedBy?.includes(uid);

    try {
      if (hasVoted) {
        await updateDoc(feedbackRef, {
          votes: increment(-1),
          votedBy: feedback.votedBy.filter(id => id !== uid),
        });
      } else {
        await updateDoc(feedbackRef, {
          votes: increment(1),
          votedBy: [...(feedback.votedBy || []), uid],
        });
      }
    } catch (error) {
      console.error('Erro ao votar:', error);
    }
  };

  const getFilteredFeedbacks = () => {
    switch (activeTab) {
      case 'bugs':
        return feedbacks.filter(f => f.type === 'bug');
      case 'features':
        return feedbacks.filter(f => f.type === 'feature');
      case 'my':
        return feedbacks.filter(f => f.authorUid === uid);
      default:
        return feedbacks;
    }
  };

  const renderFeedback = ({ item }: { item: FeedbackItem }) => {
    const typeInfo = FEEDBACK_TYPES[item.type];
    const hasVoted = item.votedBy?.includes(uid || '');
    const isMine = item.authorUid === uid;

    return (
      <AppCard style={{ marginBottom: spacing.md }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 24, marginRight: spacing.xs }}>{typeInfo.emoji}</Text>
            <View>
              <Text style={{ fontSize: fontSize.sm, color: typeInfo.color, fontWeight: '600' }}>
                {typeInfo.label}
              </Text>
              <Text style={{ fontSize: fontSize.xs, color: colors.textMuted }}>
                {STATUS_LABELS[item.status]}
              </Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: fontSize.xs, color: colors.textMuted }}>
              🗳 {item.votes} votos
            </Text>
            <Text style={{ fontSize: fontSize.xs, color: colors.textMuted }}>
              👤 {item.authorName} • {item.authorCountry}
            </Text>
          </View>
        </View>

        {/* Conteúdo */}
        <Text style={{ fontSize: fontSize.md, fontWeight: '700', color: colors.text, marginBottom: spacing.xs }}>
          {item.title}
        </Text>
        <Text style={{ fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.sm }}>
          {item.description}
        </Text>

        {/* Comentário do admin */}
        {item.adminComment && (
          <View style={{ backgroundColor: colors.primaryBg, padding: spacing.sm, borderRadius: radius.md, marginBottom: spacing.sm }}>
            <Text style={{ fontSize: fontSize.xs, color: colors.primary, fontWeight: '600' }}>
              💬 Resposta do Dev:
            </Text>
            <Text style={{ fontSize: fontSize.sm, color: colors.text }}>
              {item.adminComment}
            </Text>
          </View>
        )}

        {/* Ações */}
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <TouchableOpacity
            onPress={() => voteFeedback(item.id)}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: spacing.sm,
              backgroundColor: hasVoted ? colors.primary : colors.bg,
              borderRadius: radius.md,
              borderWidth: 1,
              borderColor: hasVoted ? colors.primary : colors.border,
            }}
          >
            <Text style={{ fontSize: 16, marginRight: 4 }}>{hasVoted ? '👍' : '🤚'}</Text>
            <Text style={{ color: hasVoted ? colors.white : colors.text, fontWeight: '600' }}>
              {hasVoted ? 'Votado' : 'Votar'}
            </Text>
          </TouchableOpacity>
        </View>
      </AppCard>
    );
  };

  if (isCreating) {
    return (
      <View style={globalStyles.screen}>
        <Header
          title="Novo Feedback"
          leftIcon="←"
          onLeftPress={() => setIsCreating(false)}
        />
        <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
          {/* Tipo */}
          <Text style={{ fontSize: fontSize.md, fontWeight: '600', marginBottom: spacing.sm }}>
            Tipo de Feedback
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.lg }}>
            {(Object.keys(FEEDBACK_TYPES) as FeedbackType[]).map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setNewType(type)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  marginRight: spacing.sm,
                  marginBottom: spacing.sm,
                  backgroundColor: newType === type ? FEEDBACK_TYPES[type].color : colors.bg,
                  borderRadius: radius.full,
                  borderWidth: 1,
                  borderColor: newType === type ? FEEDBACK_TYPES[type].color : colors.border,
                }}
              >
                <Text style={{ marginRight: 4 }}>{FEEDBACK_TYPES[type].emoji}</Text>
                <Text style={{ color: newType === type ? colors.white : colors.text }}>
                  {FEEDBACK_TYPES[type].label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Título */}
          <Text style={{ fontSize: fontSize.md, fontWeight: '600', marginBottom: spacing.sm }}>
            Título
          </Text>
          <TextInput
            value={newTitle}
            onChangeText={setNewTitle}
            placeholder="Ex: Adicionar modo escuro"
            style={{
              backgroundColor: colors.bg,
              borderRadius: radius.md,
              padding: spacing.md,
              fontSize: fontSize.md,
              color: colors.text,
              marginBottom: spacing.lg,
            }}
          />

          {/* Descrição */}
          <Text style={{ fontSize: fontSize.md, fontWeight: '600', marginBottom: spacing.sm }}>
            Descrição Detalhada
          </Text>
          <TextInput
            value={newDescription}
            onChangeText={setNewDescription}
            placeholder="Descreva sua sugestão ou bug em detalhes..."
            multiline
            numberOfLines={5}
            style={{
              backgroundColor: colors.bg,
              borderRadius: radius.md,
              padding: spacing.md,
              fontSize: fontSize.md,
              color: colors.text,
              marginBottom: spacing.lg,
              minHeight: 120,
              textAlignVertical: 'top',
            }}
          />

          <AppButton
            title="Enviar Feedback 📤"
            onPress={submitFeedback}
            size="lg"
          />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={globalStyles.screen}>
      <Header
        title="Feedback para Dev"
        subtitle="Ajude a melhorar o BarberPro"
        rightIcon="➕"
        onRightPress={() => setIsCreating(true)}
      />

      {/* Tabs */}
      <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border, marginHorizontal: spacing.md }}>
        {[
          { key: 'all', label: 'Todos' },
          { key: 'bugs', label: '🐛 Bugs' },
          { key: 'features', label: '✨ Features' },
          { key: 'my', label: 'Meus' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key as any)}
            style={{
              flex: 1,
              paddingVertical: spacing.md,
              alignItems: 'center',
              borderBottomWidth: 2,
              borderBottomColor: activeTab === tab.key ? colors.primary : 'transparent',
            }}
          >
            <Text
              style={{
                fontSize: fontSize.sm,
                fontWeight: activeTab === tab.key ? '600' : '400',
                color: activeTab === tab.key ? colors.primary : colors.textSecondary,
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Lista */}
      <FlatList
        data={getFilteredFeedbacks()}
        keyExtractor={(item) => item.id}
        renderItem={renderFeedback}
        contentContainerStyle={{ padding: spacing.md }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', padding: spacing.xxl }}>
            <Text style={{ fontSize: 48, marginBottom: spacing.md }}>💭</Text>
            <Text style={{ fontSize: fontSize.lg, color: colors.text, textAlign: 'center' }}>
              Nenhum feedback ainda
            </Text>
            <Text style={{ fontSize: fontSize.md, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm }}>
              Seja o primeiro a sugerir uma melhoria!
            </Text>
          </View>
        }
      />
    </View>
  );
}
