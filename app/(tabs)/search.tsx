// app/(tabs)/search.tsx with chat bubble
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text,
  FlatList, 
  SafeAreaView, 
  TouchableOpacity, 
  Image,
  ScrollView,
  StyleSheet,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, fontSize } from '../styles/defaultStyles';
import { 
  Card, 
  Heading, 
  Paragraph, 
  Button, 
  Input, 
  Row, 
  Divider, 
  LoadingIndicator,
  EmptyState,
  OutlineButton
} from '../styles/defaultComponents';
import BookDetailModal from '../components/bookDetail';
import ChatBotBubble from '../components/chatbotBubble';
import { useTheme } from '../styles/themeContext';
import { useRouter } from 'expo-router';
import { Get, Post } from '@/services/serviceProvider';
import { getCurrentUserID, getIsLoggedIn } from '../services/authService';

// Define Book interface if not already defined
interface Book {
  isbn: string;
  title: string;
  author: string;
  cover: string;
  genre: string;
  rating: number;
  year: number;
  totalPages: number;
  description?: string;
}

export default function SearchPage(): JSX.Element {
  const { baseStyles, colors } = useTheme();
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [activeGenreFilter, setActiveGenreFilter] = useState<string>('All');
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  // State for the detail modal
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);

  // Get unique genres for filter - we'll get these from the API
  const [genres, setGenres] = useState<string[]>(['All']);
  
  const router = useRouter();

  const getAllBooks = async (): Promise<Book[]> => {
    try {
      const resp = await Get('books');

      if (!resp || !resp.ok) {
        console.log("Error fetching books:", resp?.status);
        return [];
      }

      const responseData = await resp.json();
      return responseData.data || [];
    }
    catch (err) {
      console.log("Error in getAllBooks:", err);
      return [];
    }
  };

  const extractGenres = (books: Book[]): string[] => {
    const uniqueGenres = [...new Set(books.map(book => book.genre))];
    return ['All', ...uniqueGenres];
  };

  const checkLogin = async () => {
    try {
      const loggedIn = await getIsLoggedIn();

      if (!loggedIn) {
        router.replace('/auth/login');
        return false;
      }
      return true;
    }
    catch (err) {
      console.log("Error checking login:", err);
      return false;
    }
  };

  // Load initial data
  useEffect(() => {
    const initializeData = async () => {
      const isLoggedIn = await checkLogin();
      if (!isLoggedIn) return;
      
      setLoading(true);
      try {
        const books = await getAllBooks();
        setSearchResults(books);
        setGenres(extractGenres(books));
        setHasSearched(true);
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeData();
  }, []);

  const handleSearch = async (): Promise<void> => {
    setLoading(true);
    setHasSearched(true);

    try {
      let results = await getAllBooks();
      
      // Filter by search query if provided
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        results = results.filter(book => 
          book.title.toLowerCase().includes(query) || 
          book.author.toLowerCase().includes(query)
        );
      }
      
      // Apply genre filter if not "All"
      if (activeGenreFilter !== 'All') {
        results = results.filter(book => book.genre === activeGenreFilter);
      }

      setSearchResults(results);
    } catch (error) {
      console.error("Error during search:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle genre filter change
  const handleGenreFilter = (genre: string): void => {
    setActiveGenreFilter(genre);
    if (hasSearched) {
      // Re-apply search with new filter
      setLoading(true);
      
      setTimeout(async () => {
        try {
          let results = await getAllBooks();
          
          if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            results = results.filter(book => 
              book.title.toLowerCase().includes(query) || 
              book.author.toLowerCase().includes(query)
            );
          }
          
          if (genre !== 'All') {
            results = results.filter(book => book.genre === genre);
          }

          setSearchResults(results);
        } catch (error) {
          console.error("Error applying genre filter:", error);
        } finally {
          setLoading(false);
        }
      }, 300);
    }
  };

  // Open detail modal for a book
  const openBookDetail = (book: Book): void => {
    setSelectedBook(book);
    setShowDetailModal(true);
  };

  // Handle adding a book to library
  const handleAddToLibrary = async (book: any): Promise<void> => {
    try {
      const currentUserID = await getCurrentUserID();
      
      if (!currentUserID) {
        console.log("Cannot find UserID in local storage");
        return;
      }
      
      // Create the new book record
      const newBook: BookRecord = {
        userID: parseInt(currentUserID) || 0,
        isbn: book.isbn,
        title: book.title,
        author: book.author,
        cover: book.cover,
        genre: book.genre,
        status: 'to read',
        currentPage: 0,
        totalPages: book.totalPages || 0,
        dateAdded: new Date().toISOString(),
      };
      
      // Send to API
      const resp = await Post("records", JSON.stringify(newBook));
      
      if (!resp || !resp.ok) {
        throw new Error("Failed to add book to library");
      }
      
      // Show success message
      Alert.alert(
        "Success", 
        `"${book.title}" has been added to your library.`,
        [{ text: "OK" }]
      );
      
    } catch (error) {
      console.error('Error adding to library:', error);
      Alert.alert(
        "Error", 
        "Could not add book to your library. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  // Dynamic styles using the current theme
  const styles = StyleSheet.create({
    bookCard: {
      marginBottom: spacing.md,
      borderRadius: 12,
      overflow: 'hidden',
    },
    bookContainer: {
      flexDirection: 'row',
      padding: 0,
    },
    coverContainer: {
      position: 'relative',
      borderRadius: 8,
      overflow: 'hidden',
    },
    coverImage: {
      width: 100,
      height: 150,
      borderRadius: 8,
    },
    ratingBadge: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      backgroundColor: colors.accent,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderTopRightRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
    },
    ratingText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 12,
      marginLeft: 2,
    },
    detailsContainer: {
      flex: 1,
      paddingHorizontal: spacing.md,
      justifyContent: 'space-between',
    },
    bookTitle: {
      fontSize: fontSize.lg,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    authorName: {
      fontSize: fontSize.md,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    tagsContainer: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    genreTag: {
      backgroundColor: colors.primary + '20', // 20% opacity
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: spacing.xs,
      marginRight: spacing.xs,
    },
    yearTag: {
      backgroundColor: colors.secondary + '20', // 20% opacity
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: spacing.xs,
    },
    tagText: {
      fontSize: fontSize.xs,
      fontWeight: '500',
      color: colors.text,
    },
    pagesContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    pagesText: {
      fontSize: fontSize.sm,
      color: colors.textSecondary,
      marginLeft: 4,
    },
    addButton: {
      height: 36,
      paddingVertical: 0,
      justifyContent: 'center',
      marginTop: 4,
    },
    filterItem: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.md,
      marginRight: spacing.sm,
      height: 36,
      borderRadius: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    activeFilterItem: {
      backgroundColor: colors.primary,
    },
    filterText: {
      color: colors.text,
    },
    activeFilterText: {
      color: 'white',
    }
  });

  // Book item renderer
  const renderBookItem = ({ item }: { item: Book }): JSX.Element => (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={() => openBookDetail(item)}
    >
      <Card style={styles.bookCard}>
        <View style={styles.bookContainer}>
          {/* Book Cover */}
          <View style={styles.coverContainer}>
            <Image 
              source={{ uri: item.cover }} 
              style={styles.coverImage}
              resizeMode="cover"
            />
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={12} color="#fff" />
              <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
            </View>
          </View>
          
          {/* Book Details */}
          <View style={styles.detailsContainer}>
            <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.authorName}>{item.author}</Text>
            
            <View style={styles.tagsContainer}>
              <View style={styles.genreTag}>
                <Text style={styles.tagText}>{item.genre}</Text>
              </View>
              <View style={styles.yearTag}>
                <Text style={styles.tagText}>{item.year}</Text>
              </View>
            </View>
            
            <View style={styles.pagesContainer}>
              <Ionicons name="book-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.pagesText}>{item.totalPages} pages</Text>
            </View>
            
            <OutlineButton 
              title="Add to Library" 
              style={styles.addButton} 
              onPress={(e) => {
                e.stopPropagation(); // Prevent opening detail modal
                handleAddToLibrary(item);
              }}
            />
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={baseStyles.container}>
      {/* Search Bar */}
      <Row style={{ marginBottom: spacing.md }}>
        <Input
          placeholder="Search by title or author"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={{ flex: 1, marginRight: spacing.sm }}
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />
        <Button 
          title="Search" 
          onPress={handleSearch}
          style={{ width: 100 }}
        />
      </Row>

      {/* Genre Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={{ marginBottom: spacing.lg }}
        contentContainerStyle={{ paddingBottom: spacing.md }}
      >
        {genres.map((genre) => (
          <TouchableOpacity
            key={genre}
            style={[
              styles.filterItem,
              activeGenreFilter === genre && styles.activeFilterItem
            ]}
            onPress={() => handleGenreFilter(genre)}
          >
            <Paragraph style={[
              styles.filterText,
              activeGenreFilter === genre && styles.activeFilterText
            ]}>
              {genre}
            </Paragraph>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Search Results */}
      {loading ? (
        <LoadingIndicator />
      ) : hasSearched ? (
        searchResults.length === 0 ? (
          <EmptyState
            title="No books found"
            message="Try adjusting your search or filters"
            icon={<Ionicons name="search-outline" size={50} color={colors.textSecondary} />}
          />
        ) : (
          <FlatList
            data={searchResults}
            renderItem={renderBookItem}
            keyExtractor={(item) => item.isbn}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )
      ) : (
        <EmptyState
          title="Search for books"
          message="Enter a title or author to get started"
          icon={<Ionicons name="book-outline" size={50} color={colors.textSecondary} />}
        />
      )}

      {/* Add ChatBot Bubble */}
      <ChatBotBubble onAddToLibrary={handleAddToLibrary} />

      {/* Book Detail Modal */}
      {selectedBook && (
        <BookDetailModal
          visible={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          book={{
            ...selectedBook,
            status: 'to read',
            currentPage: 0,
            userID: 0,
            dateAdded: new Date().toISOString()
          } as BookRecord}
          onUpdateProgress={() => {}}
          isInLibrary={false}
        />
      )}
    </SafeAreaView>
  );
}