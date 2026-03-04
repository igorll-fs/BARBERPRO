/* ============================
   BARBERPRO — Chat em Tempo Real com Imagens
   Mensagens com Firestore onSnapshot, upload de imagens
   ============================ */
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Image, Alert } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { listenChat, sendMessage, sendImageMessage } from '../../services/chat';
import { colors, spacing, fontSize, radius, globalStyles } from '../../theme';
import { Header } from '../../components';
import { useUser } from '../../store/user';
import type { RootStackParamList } from '../../types/navigation';

type RouteParams = RouteProp<RootStackParamList, 'Chat'>;

interface ChatMsg {
  id: string;
  fromUid: string;
  text: string;
  imageURL?: string;
  createdAt: any;
  read?: boolean;
}

export default function ChatScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteParams>();
  const { uid, shopId: userShopId } = useUser();

  const shopId = route.params?.shopId || userShopId || 'demo';
  const roomId = route.params?.roomId || 'general';
  const title = route.params?.title || 'Chat';

  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [offline, setOffline] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    try {
      const unsub = listenChat(shopId, roomId, setMsgs);
      setOffline(false);
      return () => unsub();
    } catch (error) {
      console.error('❌ Erro ao conectar chat:', error);
      setOffline(true);
      return () => {};
    }
  }, [shopId, roomId]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || !uid) return;
    setSending(true);
    try {
      await sendMessage(shopId, roomId, uid, trimmed);
      setText('');
    } catch (e) {
      console.warn('Erro ao enviar:', e);
    } finally {
      setSending(false);
    }
  };

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos de permissão para acessar suas fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets[0] && uid) {
      setUploading(true);
      try {
        await sendImageMessage(shopId, roomId, uid, result.assets[0].uri);
      } catch (e) {
        console.error('Erro ao enviar imagem:', e);
        Alert.alert('Erro', 'Não foi possível enviar a imagem.');
      } finally {
        setUploading(false);
      }
    }
  };

  const isMe = (fromUid: string) => fromUid === uid;

  const formatTime = (ts: any) => {
    if (!ts) return '';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }: { item: ChatMsg }) => {
    const mine = isMe(item.fromUid);
    return (
      <View style={{
        alignSelf: mine ? 'flex-end' : 'flex-start',
        backgroundColor: mine ? colors.primary : colors.card,
        borderRadius: radius.lg,
        borderBottomRightRadius: mine ? 4 : radius.lg,
        borderBottomLeftRadius: mine ? radius.lg : 4,
        padding: item.imageURL ? spacing.xs : spacing.md,
        marginVertical: 3,
        maxWidth: '78%',
        borderWidth: mine ? 0 : 1,
        borderColor: colors.borderLight,
      }}>
        {!mine && !item.imageURL && (
          <Text style={{ color: colors.primary, fontSize: fontSize.xs, fontWeight: '600', marginBottom: 2 }}>
            {item.fromUid.replace('wa_', '').substring(0, 12)}
          </Text>
        )}
        
        {item.imageURL && (
          <Image
            source={{ uri: item.imageURL }}
            style={{ width: 200, height: 200, borderRadius: radius.md, marginBottom: item.text ? spacing.xs : 0 }}
            resizeMode="cover"
          />
        )}
        
        {item.text && (
          <Text style={{ color: mine ? '#fff' : colors.text, fontSize: fontSize.md, paddingHorizontal: item.imageURL ? spacing.sm : 0 }}>
            {item.text}
          </Text>
        )}
        
        <Text style={{
          color: mine ? 'rgba(255,255,255,0.6)' : colors.textMuted,
          fontSize: fontSize.xs,
          textAlign: 'right',
          marginTop: 2,
          paddingHorizontal: item.imageURL ? spacing.sm : 0,
        }}>
          {formatTime(item.createdAt)} {item.read && mine ? '✓✓' : ''}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={globalStyles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <Header title={title} leftIcon="←" onLeftPress={() => navigation.goBack()} />

      {offline && (
        <View style={{ backgroundColor: colors.danger, padding: spacing.sm, alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontSize: fontSize.sm, fontWeight: '600' }}>
            📡 Chat indisponível • Modo Offline
          </Text>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={msgs}
        keyExtractor={(m) => m.id}
        renderItem={renderMessage}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.lg }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 80 }}>
            <Text style={{ fontSize: 40, marginBottom: spacing.md }}>💬</Text>
            <Text style={{ color: colors.textSecondary, fontSize: fontSize.md }}>Nenhuma mensagem ainda</Text>
          </View>
        }
      />

      {/* Input bar */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', padding: spacing.md,
        backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.borderLight,
        opacity: offline ? 0.5 : 1,
      }}>
        <TouchableOpacity onPress={handleImagePick} disabled={uploading || offline} style={{ marginRight: spacing.sm }}>
          <Text style={{ fontSize: 24 }}>{uploading ? '⏳' : '📷'}</Text>
        </TouchableOpacity>
        
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={offline ? "Chat indisponível" : "Digite sua mensagem..."}
          placeholderTextColor={colors.textMuted}
          editable={!offline}
          style={{
            flex: 1, backgroundColor: colors.bg, borderRadius: radius.xl, paddingHorizontal: spacing.lg,
            paddingVertical: spacing.sm, color: colors.text, fontSize: fontSize.md, marginRight: spacing.sm,
            borderWidth: 1, borderColor: colors.borderLight,
          }}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        <TouchableOpacity
          onPress={handleSend}
          disabled={sending || !text.trim() || offline}
          style={{
            width: 44, height: 44, borderRadius: 22, backgroundColor: (text.trim() && !offline) ? colors.primary : colors.borderLight,
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 18 }}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
