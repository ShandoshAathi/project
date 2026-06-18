/**
 * mobile/src/components/AICoachDrawer.js
 * Premium AI Coach chatbot drawer sheet with glowing microphone pulse animations.
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Modal, 
  Animated, 
  ActivityIndicator, 
  Dimensions, 
  Image 
} from 'react-native';
import { useApp } from '../context/AppContext.js';
import { sendChatMessage } from '../services/ai.js';
import { startListening, stopListening, speak, stopSpeaking } from '../services/voice.js';

const MOCK_ATTACHMENTS = [
  { name: 'Python Error', url: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400&q=80' },
  { name: 'Syllabus Chart', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80' }
];

export default function AICoachDrawer() {
  const { 
    currentUser, 
    chatHistory, 
    setChatHistoryState,
    appendChatMessage, 
    clearChat, 
    coachPersonality, 
    setCoachPersonality,
    isChatOpen, 
    setIsChatOpen,
    settings,
    updateSettings,
    addXPPoints,
    activeColors
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [imageAttached, setImageAttached] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const scrollViewRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for recording or thinking status
  useEffect(() => {
    let animation;
    if (isListening || loading) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.4,
            duration: 1000,
            useNativeDriver: true
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true
          })
        ])
      );
      animation.start();
    } else {
      pulseAnim.setValue(1);
    }
    return () => {
      if (animation) animation.stop();
    };
  }, [isListening, loading]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }, 200);
    }
  }, [chatHistory, isChatOpen]);

  const handleSendMessage = async (textToSend = inputText) => {
    if (!textToSend.trim() && !imageAttached) return;

    setInputText('');
    setLoading(true);

    // 1. Add user message locally
    await appendChatMessage('user', textToSend, imageAttached);
    
    // Reset image
    setImageAttached(null);

    try {
      // 2. Fetch AI response
      const result = await sendChatMessage(
        currentUser,
        chatHistory,
        textToSend,
        imageAttached,
        coachPersonality
      );

      // 3. Update global chat state
      setChatHistoryState(result.updatedHistory);
      await addXPPoints(15); // Reward 15 XP

      // 4. TTS speech if enabled
      if (settings.aiVoice) {
        speak(result.assistantMessage.content);
      }
    } catch (err) {
      console.error(err);
      await appendChatMessage('assistant', "I'm having trouble connecting to the AI Coach. Please check your network and API keys.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMic = () => {
    if (isListening) {
      stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      startListening(
        (transcript) => {
          setInputText(prev => prev + ' ' + transcript);
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        },
        "What is the bisection method root solver in C++?"
      );
    }
  };

  const toggleVoiceOutput = () => {
    const nextVoice = !settings.aiVoice;
    updateSettings({ aiVoice: nextVoice });
    if (!nextVoice) {
      stopSpeaking();
    }
  };

  const handleQuickPrompt = (promptText) => {
    handleSendMessage(promptText);
  };

  const attachMockFile = () => {
    // Alternate mock files for simulation
    const randomMock = MOCK_ATTACHMENTS[Math.floor(Math.random() * MOCK_ATTACHMENTS.length)];
    setImageAttached(randomMock.url);
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      {!isChatOpen && (
        <TouchableOpacity 
          style={[styles.fab, { backgroundColor: activeColors.primary }]}
          onPress={() => setIsChatOpen(true)}
        >
          <Text style={styles.fabIcon}>🤖</Text>
        </TouchableOpacity>
      )}

      {/* Full screen Drawer Modal */}
      <Modal
        visible={isChatOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsChatOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.drawerContainer, { backgroundColor: activeColors.bgPrimary }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: activeColors.borderLight, backgroundColor: activeColors.bgSecondary }]}>
              <View style={styles.headerLeft}>
                <View style={styles.avatarWrap}>
                  {loading && (
                    <Animated.View style={[
                      styles.avatarPulse, 
                      { 
                        backgroundColor: activeColors.primary,
                        transform: [{ scale: pulseAnim }],
                        opacity: pulseAnim.interpolate({
                          inputRange: [1, 1.4],
                          outputRange: [0.6, 0]
                        })
                      }
                    ]} />
                  )}
                  <View style={[styles.coachAvatar, { backgroundColor: activeColors.primary }]}>
                    <Text style={styles.coachAvatarText}>✨</Text>
                  </View>
                </View>
                <View style={styles.headerInfo}>
                  <Text style={[styles.title, { color: activeColors.textPrimary }]}>AI Smart Coach</Text>
                  <View style={styles.badgeRow}>
                    <View style={styles.statusDot} />
                    <TouchableOpacity onPress={toggleVoiceOutput} style={styles.voiceToggle}>
                      <Text style={{ fontSize: 14 }}>{settings.aiVoice ? '🔊' : '🔇'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.headerRight}>
                <TouchableOpacity onPress={clearChat} style={styles.actionBtn}>
                  <Text style={[styles.actionBtnText, { color: activeColors.textSecondary }]}>↺</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { stopSpeaking(); setIsChatOpen(false); }} style={styles.actionBtn}>
                  <Text style={[styles.actionBtnText, { color: activeColors.textSecondary }]}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Chat Feed */}
            <ScrollView 
              ref={scrollViewRef}
              style={styles.chatFeed}
              contentContainerStyle={styles.chatFeedContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Introduction bubble */}
              <View style={[styles.bubble, styles.coachBubble, { backgroundColor: activeColors.bgSecondary, borderColor: activeColors.borderLight }]}>
                <Text style={[styles.sourceBadge, { color: activeColors.primary }]}>✨ VaaniAI Coach</Text>
                <Text style={[styles.bubbleText, { color: activeColors.textPrimary }]}>
                  Hello! I'm your <Text style={{ fontWeight: 'bold' }}>VaaniAI Smart Coach</Text>. Ask me anything — grammar, vocabulary, practice tips, or any question! 🚀
                </Text>
              </View>

              {chatHistory.map((msg, index) => (
                <View 
                  key={index}
                  style={[
                    styles.bubble, 
                    msg.role === 'user' ? styles.userBubble : styles.coachBubble,
                    msg.role === 'user' 
                      ? { backgroundColor: activeColors.primary } 
                      : { backgroundColor: activeColors.bgSecondary, borderColor: activeColors.borderLight }
                  ]}
                >
                  <Text style={[
                    styles.sourceBadge, 
                    msg.role === 'user' ? { color: '#ffffff' } : { color: activeColors.primary }
                  ]}>
                    {msg.role === 'user' ? 'You' : '✨ VaaniAI Coach'}
                  </Text>
                  <Text style={[
                    styles.bubbleText,
                    msg.role === 'user' ? { color: '#ffffff' } : { color: activeColors.textPrimary }
                  ]}>
                    {msg.content}
                  </Text>
                  {msg.imageData && (
                    <Image source={{ uri: msg.imageData }} style={styles.bubbleImage} />
                  )}
                </View>
              ))}

              {loading && (
                <View style={[styles.bubble, styles.coachBubble, { backgroundColor: activeColors.bgSecondary, borderColor: activeColors.borderLight }]}>
                  <Text style={[styles.sourceBadge, { color: activeColors.primary }]}>✨ Coach is thinking...</Text>
                  <ActivityIndicator size="small" color={activeColors.primary} style={{ marginTop: 8, alignSelf: 'flex-start' }} />
                </View>
              )}
            </ScrollView>

            {/* Quick Prompts */}
            <View style={styles.quickPrompts}>
              <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.quickPromptsScroll}>
                <TouchableOpacity 
                  style={[styles.quickBtn, { backgroundColor: activeColors.bgTertiary }]}
                  onPress={() => handleQuickPrompt('Explain Python List Comprehension')}
                >
                  <Text style={[styles.quickBtnText, { color: activeColors.textSecondary }]}>🐍 List Comprehension</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.quickBtn, { backgroundColor: activeColors.bgTertiary }]}
                  onPress={() => handleQuickPrompt('Give me 5 practice tips to improve English fluency')}
                >
                  <Text style={[styles.quickBtnText, { color: activeColors.textSecondary }]}>💡 Fluency Tips</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.quickBtn, { backgroundColor: activeColors.bgTertiary }]}
                  onPress={() => handleQuickPrompt('What is call by reference in C++?')}
                >
                  <Text style={[styles.quickBtnText, { color: activeColors.textSecondary }]}>⚙️ C++ Reference</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {/* Attachment preview */}
            {imageAttached && (
              <View style={[styles.attachmentPreview, { backgroundColor: activeColors.bgSecondary, borderTopColor: activeColors.borderLight }]}>
                <Image source={{ uri: imageAttached }} style={styles.previewImage} />
                <TouchableOpacity style={styles.removePreviewBtn} onPress={() => setImageAttached(null)}>
                  <Text style={styles.removePreviewText}>×</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Input Row */}
            <View style={[styles.inputRow, { backgroundColor: activeColors.bgSecondary, borderTopColor: activeColors.borderLight }]}>
              <TouchableOpacity style={styles.attachBtn} onPress={attachMockFile}>
                <Text style={styles.attachBtnIcon}>📎</Text>
              </TouchableOpacity>
              
              <TextInput
                style={[styles.input, { color: activeColors.textPrimary, backgroundColor: activeColors.bgTertiary }]}
                placeholder="Ask anything..."
                placeholderTextColor={activeColors.textTertiary}
                value={inputText}
                onChangeText={setInputText}
              />

              <TouchableOpacity 
                style={[styles.micBtn, isListening && { backgroundColor: activeColors.danger }]} 
                onPress={toggleMic}
              >
                {isListening ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.micBtnIcon}>🎙️</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.sendBtn, { backgroundColor: activeColors.primary }]} 
                onPress={() => handleSendMessage()}
              >
                <Text style={styles.sendBtnText}>➔</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 96,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 999,
  },
  fabIcon: {
    fontSize: 28,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  drawerContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: Dimensions.get('window').height * 0.85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  header: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: 68,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarPulse: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  coachAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coachAvatarText: {
    fontSize: 20,
  },
  headerInfo: {
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  voiceToggle: {
    paddingHorizontal: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    padding: 8,
    marginLeft: 8,
  },
  actionBtnText: {
    fontSize: 20,
    fontWeight: '600',
  },
  chatFeed: {
    flex: 1,
  },
  chatFeedContent: {
    padding: 16,
    paddingBottom: 32,
  },
  bubble: {
    maxWidth: '85%',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  coachBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  sourceBadge: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bubbleImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginTop: 8,
    resizeMode: 'cover',
  },
  quickPrompts: {
    height: 44,
    paddingVertical: 4,
  },
  quickPromptsScroll: {
    paddingHorizontal: 16,
  },
  quickBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    height: 32,
  },
  quickBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  attachmentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
  },
  previewImage: {
    width: 60,
    height: 44,
    borderRadius: 4,
  },
  removePreviewBtn: {
    position: 'absolute',
    top: 6,
    left: 60,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePreviewText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 14,
  },
  inputRow: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderTopWidth: 1,
  },
  attachBtn: {
    padding: 8,
  },
  attachBtnIcon: {
    fontSize: 22,
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    fontSize: 14,
  },
  micBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  micBtnIcon: {
    fontSize: 20,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
