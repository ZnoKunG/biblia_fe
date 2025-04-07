// app/(tabs)/search.tsx with detail modal
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text,
  FlatList, 
  SafeAreaView, 
  TouchableOpacity, 
  Image,
  ScrollView,
  ListRenderItemInfo,
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
import bookDatabase from '@/utils/mockBooks';
import BookDetailModal from '../components/bookDetail';
import { useTheme } from '../styles/themeContext';

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

  // Get unique genres for filter
  const genres: string[] = ['All', ...Array.from(new Set(bookDatabase.map(book => book.genre)))];

  const handleSearch = (): void => {
    setLoading(true);
    setHasSearched(true);

    // Simulate API call
    setTimeout(() => {
      let results: Book[] = [...bookDatabase];
      
      // Filter by search query if provided
      if (searchQuery.trim() !== '') {
        const query: string = searchQuery.toLowerCase();
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
      setLoading(false);
    }, 500);
  };

  // Handle genre filter change
  const handleGenreFilter = (genre: string): void => {
    setActiveGenreFilter(genre);
    if (hasSearched) {
      // Re-apply search with new filter
      setLoading(true);
      
      setTimeout(() => {
        let results: Book[] = [...bookDatabase];
        
        if (searchQuery.trim() !== '') {
          const query: string = searchQuery.toLowerCase();
          results = results.filter(book => 
            book.title.toLowerCase().includes(query) || 
            book.author.toLowerCase().includes(query)
          );
        }
        
        if (genre !== 'All') {
          results = results.filter(book => book.genre === genre);
        }

        setSearchResults(results);
        setLoading(false);
      }, 300);
    }
  };

  // Open detail modal for a book
  const openBookDetail = (book: Book): void => {
    setSelectedBook(book);
    setShowDetailModal(true);
  };

  // Handle adding a book to library
  const handleAddToLibrary = (book: Book): void => {
    // In a real app, this would add to user's library in state/database
    Alert.alert(
      "Success", 
      `"${book.title}" has been added to your library.`,
      [{ text: "OK" }]
    );
  };

  // Dynamic styles using the current theme
  const dynamicStyles = StyleSheet.create({
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
  });

  // Enhanced book item rendering with improved design
  const renderBookItem = ({ item }: ListRenderItemInfo<Book>): JSX.Element => (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={() => openBookDetail(item)}
    >
      <Card style={dynamicStyles.bookCard}>
        <View style={dynamicStyles.bookContainer}>
          {/* Book Cover */}
          <View style={dynamicStyles.coverContainer}>
            <Image 
              source={{ uri: item.cover }} 
              style={dynamicStyles.coverImage}
              resizeMode="cover"
            />
            <View style={dynamicStyles.ratingBadge}>
              <Ionicons name="star" size={12} color="#fff" />
              <Text style={dynamicStyles.ratingText}>{item.rating.toFixed(1)}</Text>
            </View>
          </View>
          
          {/* Book Details */}
          <View style={dynamicStyles.detailsContainer}>
            <Text style={dynamicStyles.bookTitle} numberOfLines={2}>{item.title}</Text>
            <Text style={dynamicStyles.authorName}>{item.author}</Text>
            
            <View style={dynamicStyles.tagsContainer}>
              <View style={dynamicStyles.genreTag}>
                <Text style={dynamicStyles.tagText}>{item.genre}</Text>
              </View>
              <View style={dynamicStyles.yearTag}>
                <Text style={dynamicStyles.tagText}>{item.year}</Text>
              </View>
            </View>
            
            <View style={dynamicStyles.pagesContainer}>
              <Ionicons name="book-outline" size={14} color={colors.textSecondary} />
              <Text style={dynamicStyles.pagesText}>{item.totalPages} pages</Text>
            </View>
            
            <OutlineButton 
              title="Add to Library" 
              style={dynamicStyles.addButton} 
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

  useEffect(() => {
    // Auto-load all books on first render
    handleSearch();
  }, []);

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
            style={{
              paddingVertical: spacing.xs,
              paddingHorizontal: spacing.md,
              marginRight: spacing.sm,
              height: 36,
              backgroundColor: activeGenreFilter === genre ? colors.primary : colors.background,
              borderRadius: spacing.md,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => handleGenreFilter(genre)}
          >
            <Paragraph style={{ 
              color: activeGenreFilter === genre ? 'white' : colors.text 
            }}>
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
            keyExtractor={(item: Book) => item.id}
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

      {/* Book Detail Modal */}
      {selectedBook && (
        <BookDetailModal
          visible={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          book={selectedBook}
          onAddToLibrary={() => handleAddToLibrary(selectedBook)}
          isInLibrary={false}
        />
      )}
    </SafeAreaView>
  );
}