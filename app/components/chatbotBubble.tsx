// app/components/chatbotBubble.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  FlatList, 
  ActivityIndicator, 
  Animated, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, shadows } from '../styles/defaultStyles';
import { 
  Card, 
  Paragraph, 
  OutlineButton, 
  Row, 
  Divider 
} from '../styles/defaultComponents';
import { useTheme } from '../styles/themeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Get, Post } from '@/services/serviceProvider';
import { getCurrentUserID } from '../services/authService';

// API configuration
const API_ENDPOINTS = {
  chat: `${process.env.EXPO_PUBLIC_CHATBOT_ENDPOINT}/api/chat`,
  chatStream: `${process.env.EXPO_PUBLIC_CHATBOT_ENDPOINT}/api/chat/stream`
};

// Define message types
type MessageType = 'user' | 'bot' | 'book-recommendation';

// Define message interface
interface ChatMessage {
  id: string;
  content: string;
  type: MessageType;
  timestamp: Date;
  books?: BookRecord[];
}

// Book recommendation component
const BookRecommendation = ({ book, onAddToLibrary }: { book: BookRecord, onAddToLibrary: (book: BookRecord) => void }) => {
  const { colors, baseStyles } = useTheme();
  
  return (
    <Card style={{ marginVertical: spacing.xs }}>
      <Row>
        {book.cover ? (
          <Image 
            source={{ uri: book.cover }} 
            style={{ width: 60, height: 90, borderRadius: 8 }}
            onError={(e) => console.log("Image load error", e.nativeEvent.error)}
          />
        ) : (
          <View style={{ 
            width: 60, 
            height: 90, 
            borderRadius: 8,
            backgroundColor: colors.border,
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Paragraph small secondary>{book.title.substring(0, 1)}</Paragraph>
          </View>
        )}
        <View style={{ marginLeft: spacing.md, flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.text }}>
            {book.title}
          </Text>
          <Paragraph secondary>{book.author}</Paragraph>
          <Paragraph secondary small>{book.genre}</Paragraph>
          <Paragraph small style={{ marginTop: spacing.xs }}>
            {book.totalPages} pages
          </Paragraph>
          
          <OutlineButton 
            title="Add to Library" 
            onPress={() => onAddToLibrary(book)}
            style={{ marginTop: spacing.sm }}
          />
        </View>
      </Row>
    </Card>
  );
};

// Chat message component
const ChatMessageItem = ({ 
  message, 
  onAddToLibrary 
}: { 
  message: ChatMessage, 
  onAddToLibrary: (book: BookRecord) => void 
}) => {
  const { colors } = useTheme();
  
  // Determine message style based on type
  const isUser = message.type === 'user';
  
  if (message.type === 'book-recommendation' && message.books && message.books.length > 0) {
    return (
      <View style={{ 
        alignSelf: 'flex-start',
        maxWidth: '85%',
        marginBottom: spacing.sm,
      }}>
        <Paragraph secondary small style={{ marginBottom: spacing.xs }}>
          BookBot
        </Paragraph>
        <Paragraph style={{ backgroundColor: colors.card, padding: spacing.md, borderRadius: spacing.md }}>
          {message.content}
        </Paragraph>
        {message.books.map((book, index) => (
          <BookRecommendation 
            key={index}
            book={book} 
            onAddToLibrary={onAddToLibrary} 
          />
        ))}
      </View>
    );
  }
  
  return (
    <View style={{ 
      alignSelf: isUser ? 'flex-end' : 'flex-start',
      backgroundColor: isUser ? colors.secondary : colors.card,
      padding: spacing.md,
      borderRadius: spacing.md,
      maxWidth: '85%',
      marginBottom: spacing.sm,
    }}>
      {!isUser && (
        <Paragraph secondary small style={{ marginBottom: spacing.xs }}>
          BookBot
        </Paragraph>
      )}
      <Paragraph style={{ color: isUser ? 'white' : colors.text }}>
        {message.content}
      </Paragraph>
    </View>
  );
};

// Default greeting messages
const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    content: "Hello! I'm your BookBot assistant. I can help you find books you'll love.",
    type: 'bot',
    timestamp: new Date(),
  },
  {
    id: '2',
    content: "Try asking me questions like:\n- Recommend fantasy books\n- Find books about AI\n- What books are like Mistborn?",
    type: 'bot',
    timestamp: new Date(),
  }
];

interface ChatBotBubbleProps {
  onAddToLibrary?: (book: BookRecord) => void;
}

const ChatBotBubble = ({ onAddToLibrary }: ChatBotBubbleProps): JSX.Element => {
  const [messages, setMessages] = useState<ChatMessage[]>(DEFAULT_MESSAGES);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isBouncing, setIsBouncing] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [useStreamingApi, setUseStreamingApi] = useState<boolean>(false);
  
  const bubbleAnimation = useRef(new Animated.Value(1)).current;
  const chatModalAnimation = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  
  const { baseStyles, colors } = useTheme();

  // Load user ID on mount
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const id = await getCurrentUserID();
        setUserId(id);
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    };
    
    fetchUserId();
    
    // Start the bounce animation every 5 seconds
    const interval = setInterval(() => {
      if (!isOpen && !isBouncing) {
        setIsBouncing(true);
        Animated.sequence([
          Animated.timing(bubbleAnimation, {
            toValue: 1.2,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(bubbleAnimation, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          })
        ]).start(() => {
          setIsBouncing(false);
        });
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isOpen, isBouncing]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollViewRef.current && isOpen) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isOpen]);

  // Open chat modal with animation
  const openChat = () => {
    setIsOpen(true);
    Animated.timing(chatModalAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Close chat modal with animation
  const closeChat = () => {
    Animated.timing(chatModalAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setIsOpen(false);
    });
  };

  // Handle non-streaming API request
  const sendNonStreamingRequest = async (userQuery: string) => {
    try {
      const reqBody = {
        query: userQuery,
        userId: userId || '0',
        stream: false
      };

      console.log(`Sending chat request at ${API_ENDPOINTS.chat} with body ${JSON.stringify(reqBody)}`)
      const response = await fetch(API_ENDPOINTS.chat, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reqBody),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get response from chatbot: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Check if response contains book recommendations
      if (data.recommendations && data.recommendations.length > 0) {
        const botMessage: ChatMessage = {
          id: Date.now().toString(),
          content: data.message || 'Here are some books you might enjoy:',
          type: 'book-recommendation',
          timestamp: new Date(),
          books: data.recommendations.map((book: any) => ({
            isbn: book.isbn,
            title: book.title,
            author: book.author,
            cover: book.cover,
            genre: book.genre,
            totalPages: book.pageCount || 0,
            status: 'to read',
            currentPage: 0,
            userID: userId ? parseInt(userId) : 0,
            dateAdded: new Date().toISOString(),
          })),
        };
        setMessages(prevMessages => [...prevMessages, botMessage]);
      } else {
        const botMessage: ChatMessage = {
          id: Date.now().toString(),
          content: data.message || 'I couldn\'t find any specific recommendations at the moment.',
          type: 'bot',
          timestamp: new Date(),
        };
        setMessages(prevMessages => [...prevMessages, botMessage]);
      }
      
      setIsTyping(false);
    } catch (error) {
      console.error('Error in non-streaming chat request:', error);
      throw error;
    }
  };

  // Function to handle sending a message
  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    
    // Create user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputText,
      type: 'user',
      timestamp: new Date(),
    };
    
    // Add user message to chat
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Clear input and show typing indicator
    const userQuery = inputText;
    setInputText('');
    setIsTyping(true);
    
    try {
      if (useStreamingApi) {
        try {
          // Create empty bot message that will be filled by the stream
          const streamMessage: ChatMessage = {
            id: Date.now().toString(),
            content: '',
            type: 'bot',
            timestamp: new Date()
          };
          
          // Add empty message that will be updated
          setMessages(prevMessages => [...prevMessages, streamMessage]);
          
          const reqBody = {
            query: userQuery,
            userId: userId || '0',
            stream: true
          };

          // Make API call to chatbot service
          console.log(`Requesting stream chatbot at ${API_ENDPOINTS.chatStream} with body ${JSON.stringify(reqBody)}`);
          const response = await fetch(API_ENDPOINTS.chatStream, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(reqBody),
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get response from chatbot: ${response.statusText}`);
          }
          
          // Handle streaming response
          const reader = response.body?.getReader();
          if (!reader) throw new Error('Response body cannot be read');
          
          let accumulatedContent = '';
          
          // Read stream chunks
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = new TextDecoder().decode(value);
            
            // Parse SSE format (data: {...}\n\n)
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const eventData = JSON.parse(line.substring(6));
                  
                  if (eventData.chunk) {
                    accumulatedContent += eventData.chunk;
                    
                    // Update the last message with new content
                    setMessages(prevMessages => {
                      const updatedMessages = [...prevMessages];
                      const lastMessage = updatedMessages[updatedMessages.length - 1];
                      lastMessage.content = accumulatedContent;
                      return updatedMessages;
                    });
                  }
                  
                  // If this is the final chunk with recommendations
                  if (eventData.done && eventData.recommendations && eventData.recommendations.length > 0) {
                    // Replace the current bot message with a book recommendation message
                    setMessages(prevMessages => {
                      const updatedMessages = [...prevMessages];
                      // Remove the last message
                      updatedMessages.pop();
                      
                      // Add a new book recommendation message
                      updatedMessages.push({
                        id: Date.now().toString(),
                        content: accumulatedContent,
                        type: 'book-recommendation',
                        timestamp: new Date(),
                        books: eventData.recommendations.map((book: any) => ({
                          isbn: book.isbn,
                          title: book.title,
                          author: book.author,
                          cover: book.cover,
                          genre: book.genre,
                          totalPages: book.pageCount || 0,
                          status: 'to read',
                          currentPage: 0,
                          userID: userId ? parseInt(userId) : 0,
                          dateAdded: new Date().toISOString(),
                        })),
                      });
                      
                      return updatedMessages;
                    });
                  }
                } catch (error) {
                  console.error('Error parsing SSE data:', error);
                }
              }
            }
          }
          
        } catch (streamError) {
          console.warn('Streaming request failed, falling back to regular request:', streamError);
          // Remove the last message (the empty stream message)
          setMessages(prevMessages => prevMessages.slice(0, -1));
          // Fall back to non-streaming request
          await sendNonStreamingRequest(userQuery);
        }
      } else {
        // Use non-streaming API directly if streaming is disabled
        await sendNonStreamingRequest(userQuery);
      }
      
      setIsTyping(false);
    } catch (error) {
      console.error('Error in chat request:', error);
      // Add error message
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        content: 'Sorry, I encountered an error while processing your request. Please try again later.',
        type: 'bot',
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
      setIsTyping(false);
    }
  };

  // Function to add a book to the user's library
  const handleAddToLibrary = async (book: BookRecord) => {
    try {
      // Create a new record
      const newBook: BookRecord = {
        ...book,
        userID: userId ? parseInt(userId) : 0,
        status: 'to read',
        currentPage: 0,
        dateAdded: new Date().toISOString(),
      };
      
      // If parent provided a handler, use it
      if (onAddToLibrary) {
        onAddToLibrary(newBook);
      } else {
        // Otherwise, handle it internally
        const response = await Post('records', JSON.stringify(newBook));
        
        if (!response || !response.ok) {
          throw new Error('Failed to add book to library');
        }
      }
      
      // Show success message
      const successMessage: ChatMessage = {
        id: Date.now().toString(),
        content: `I've added "${book.title}" to your library!`,
        type: 'bot',
        timestamp: new Date(),
      };
      
      setMessages(prevMessages => [...prevMessages, successMessage]);
    } catch (error) {
      console.error('Error adding book to library:', error);
      
      // Show error message
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        content: 'Sorry, I couldn\'t add the book to your library. Please try again later.',
        type: 'bot',
        timestamp: new Date(),
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    }
  };

  // Function to clear chat history
  const clearChat = () => {
    setMessages(DEFAULT_MESSAGES);
  };

  // Toggle streaming API
  const toggleStreamingApi = () => {
    setUseStreamingApi(!useStreamingApi);
  };

  // Generate styles using the theme
  const styles = StyleSheet.create({
    bubbleContainer: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      zIndex: 1000,
    },
    bubble: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.secondary,
      justifyContent: 'center',
      alignItems: 'center',
      ...shadows.medium,
    },
    modalBackground: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    chatContainer: {
      backgroundColor: colors.background,
      borderTopLeftRadius: spacing.lg,
      borderTopRightRadius: spacing.lg,
      height: '80%',
      ...shadows.large,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
    },
    chatBody: {
      flex: 1,
      padding: spacing.md,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: colors.border,
      padding: spacing.md,
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: spacing.md,
      padding: spacing.sm,
      paddingHorizontal: spacing.md,
      marginRight: spacing.sm,
      color: colors.text,
      backgroundColor: colors.card,
      maxHeight: 100,
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.secondary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    typingIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.sm,
      backgroundColor: colors.card,
      borderRadius: spacing.md,
      alignSelf: 'flex-start',
      marginBottom: spacing.sm,
    },
    toggleButton: {
      marginRight: spacing.md,
      padding: spacing.xs,
      backgroundColor: colors.card,
      borderRadius: spacing.sm,
    }
  });

  return (
    <>
      {/* Chat bubble */}
      <Animated.View 
        style={[
          styles.bubbleContainer,
          { transform: [{ scale: bubbleAnimation }] }
        ]}
      >
        <TouchableOpacity
          style={styles.bubble}
          onPress={openChat}
        >
          <Ionicons name="chatbubble-ellipses" size={30} color="white" />
        </TouchableOpacity>
      </Animated.View>

      {/* Chat modal */}
      {isOpen && (
        <Modal
          visible={isOpen}
          transparent={true}
          animationType="none"
          onRequestClose={closeChat}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <View style={styles.modalBackground}>
              <Animated.View 
                style={[
                  styles.chatContainer,
                  {
                    transform: [
                      { translateY: chatModalAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [500, 0]
                      })}
                    ]
                  }
                ]}
              >
                {/* Header */}
                <View style={styles.header}>
                  <Text style={styles.headerTitle}>BookBot Assistant</Text>
                  <Row>
                    <TouchableOpacity onPress={toggleStreamingApi} style={styles.toggleButton}>
                      <Ionicons 
                        name={useStreamingApi ? "flash" : "flash-off"} 
                        size={20} 
                        color={useStreamingApi ? colors.primary : colors.textSecondary} 
                      />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={clearChat} style={{ marginRight: spacing.md }}>
                      <Ionicons name="refresh-outline" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={closeChat}>
                      <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                  </Row>
                </View>

                {/* Chat messages */}
                <View style={{ flex: 1 }}>
                  <ScrollView
                    ref={scrollViewRef}
                    style={styles.chatBody}
                    contentContainerStyle={{ paddingBottom: spacing.md }}
                    showsVerticalScrollIndicator={false}
                  >
                    {messages.map((message) => {
                      return (
                        <ChatMessageItem 
                          key={message.id} 
                          message={message} 
                          onAddToLibrary={handleAddToLibrary} 
                        />
                      )
                    })}
                    
                    {isTyping && (
                      <View style={styles.typingIndicator}>
                        <ActivityIndicator size="small" color={colors.secondary} />
                        <Paragraph style={{ marginLeft: spacing.sm }}>Thinking...</Paragraph>
                      </View>
                    )}
                  </ScrollView>
                </View>
                
                {/* Input area */}
                <View style={styles.inputContainer}>
                  <TextInput
                    ref={inputRef}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Ask me about books..."
                    placeholderTextColor={colors.textSecondary}
                    style={styles.input}
                    multiline
                    onSubmitEditing={() => handleSendMessage()}
                  />
                  <TouchableOpacity
                    style={[
                      styles.sendButton,
                      { opacity: inputText.trim() ? 1 : 0.5 }
                    ]}
                    onPress={() => handleSendMessage()}
                    disabled={!inputText.trim()}
                  >
                    <Ionicons name="send" size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      )}
    </>
  );
};

export default ChatBotBubble;