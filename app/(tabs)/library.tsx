// app/(tabs)/library.tsx with updated book model
import React, { useState, useEffect } from 'react';
import { 
  View, 
  FlatList, 
  SafeAreaView, 
  Modal, 
  Image, 
  TouchableOpacity, 
  RefreshControl, 
  Alert,
  ScrollView,
  ListRenderItem
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, shadows } from '../styles/defaultStyles';
import { 
  Card, 
  Heading, 
  Paragraph, 
  Button, 
  OutlineButton, 
  Input, 
  Row, 
  Divider, 
  StatusBadge, 
  LoadingIndicator,
  EmptyState
} from '../styles/defaultComponents';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import BookDetailModal from '../components/bookDetail';
import { useTheme } from '../styles/themeContext';
import { Get, GetWithQueryParams, Put, Post, Delete, DeleteWithQueryParams } from '@/services/serviceProvider';
import { getCurrentUserID, getIsLoggedIn } from '../services/authService';
import { useRouter } from 'expo-router';
import { getBookByISBN, searchBooks } from '../services/googleBookService';

export default function LibraryPage(): JSX.Element {
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [books, setBooks] = useState<BookRecord[]>([]);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showScannerModal, setShowScannerModal] = useState<boolean>(false);
  const [scanned, setScanned] = useState<boolean>(false);
  const [filter, setFilter] = useState<'all' | 'to read' | 'in progress' | 'finished'>('all');
  const [permission, requestPermission] = useCameraPermissions();
  const { baseStyles, colors } = useTheme();
  // State for the detail modal
  const [selectedBook, setSelectedBook] = useState<BookRecord | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  
  const router = useRouter();
  
  // New book form state
  const [formData, setFormData] = useState<RecordFormData>({
    userID: 0,
    title: '',
    author: '',
    isbn: '',
    cover: '',
    genre: '',
    status: 'to read',
    currentPage: 0,
    totalPages: 0,
    year: new Date().getFullYear(),
    rating: 0,
    description: '',
  });

  const checkLogin = async () => {
    try {
      const loggedin = await getIsLoggedIn();

      if (!loggedin) {
        router.replace('/auth/login');
        return false;
      }
      return true;
    }
    catch (err) {
      console.log("Error checking login:", err);
      return false;
    }
  }

  // Fetch books data
  const fetchUserBooks = async () => {
    try {
      setLoading(true);
      const currentUserID = await getCurrentUserID();
      
      if (!currentUserID) {
        console.log("Cannot find UserID in local storage");
        setLoading(false);
        return;
      }

      const queryParams = { userId: currentUserID };
      const resp = await GetWithQueryParams('records', queryParams);
      
      if (!resp || !resp.ok) {
        console.log("Error fetching user records:", resp?.status);
        setLoading(false);
        return;
      }

      const recordResp = await resp.json();
      const records: BookRecord[] = recordResp.data || [];
      console.log(records);
      setBooks(records);
    } catch (error) {
      console.error("Error fetching user books:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    const initializeData = async () => {
      const isLoggedIn = await checkLogin();
      if (!isLoggedIn) return;
      
      fetchUserBooks();
    };
    
    initializeData();
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchUserBooks();
    setRefreshing(false);
  }, []);

  const processGoogleBookAPI = (book: Book) => {
    try {
      setFormData({
        userID: 0,
        ...book,
        status: 'to read',
        currentPage: 0,
      });
    } catch (err: any) {
      console.error("Error processing Google Book API data:", err);
      Alert.alert(
        "Error", 
        "There was a problem processing the book information. Please enter details manually.",
        [{ text: "OK" }]
      );
    }
  };

  const handleAddBook = async (): Promise<void> => {
    // Validation
    if (!formData.title || !formData.author) {
      Alert.alert('Missing Information', 'Please enter at least title and author');
      return;
    }
    
    try {
      const currentUserID = await getCurrentUserID();
        
      if (!currentUserID) {
        console.log("Cannot find UserID in local storage");
        return;
      }

      // Generate ISBN as Date.now() if not provided by user
      const finalIsbn = formData.isbn.trim() ? formData.isbn.trim() : Date.now().toString();
      
      const newBook: BookRecord = {
        ...formData,
        isbn: finalIsbn, // Use the generated or provided ISBN
        userID: parseInt(currentUserID) || 0,
        dateAdded: new Date().toISOString(),
      };

      console.log(newBook);

      const resp = await Post("records", JSON.stringify(newBook));

      if (!resp || !resp.ok) {
        console.error("Error creating record:", resp?.status);
        const respErr = await resp?.json();
        console.log(respErr);
        Alert.alert('Error', "Failed to add book to library. Please try again.");
        return;
      }

      const createRecordResp = await resp.json();
      const newRecord: BookRecord = createRecordResp.data;

      setBooks(prevBooks => [newRecord, ...prevBooks]);
      setShowAddModal(false);
      resetForm();
      
      Alert.alert('Success', 'Book added to your library');
    } catch (error) {
      console.error("Error adding book:", error);
      Alert.alert('Error', "There was a problem adding the book. Please try again.");
    }
  };

  const resetForm = (): void => {
    setFormData({
      userID: 0,
      title: '',
      author: '',
      isbn: '',
      cover: '',
      genre: '',
      status: 'to read',
      currentPage: 0,
      totalPages: 0,
      year: new Date().getFullYear(),
      rating: 0,
      description: '',
    });
  };

  const handleBarCodeScanned = (result: { type: string; data: string }): void => {
    setScanned(true);
    setShowScannerModal(false);
    
    setTimeout(async () => {
      if (result.data) {
        try {
          const book = await getBookByISBN(result.data);

          if (!book) {
            console.error("Error fetching book by ISBN: ", result.data);
            Alert.alert(
              "Book Not Found", 
              "No information was found for this ISBN. Please enter details manually.",
              [{ text: "OK" }]
            );
            setTimeout(() => {
              setShowAddModal(true);
            }, 300);
            return;
          }
          
          processGoogleBookAPI(book);
          
          setTimeout(() => {
            setShowAddModal(true);
          }, 300);
        } catch (error) {
          console.error("Error processing scanned ISBN:", error);
          Alert.alert(
            "Error", 
            "There was a problem retrieving book information. Please try again or enter details manually.",
            [{ text: "OK" }]
          );
          setTimeout(() => {
            setShowAddModal(true);
          }, 300);
        }
      }
    }, 500);
  };

  const sortBooksByStatus = (books: BookRecord[]): BookRecord[] => {
    const statusPriority = {
      'to read': 1,
      'in progress': 2,
      'finished': 3
    };
  
    return [...books].sort((a, b) => {
      // First sort by status priority
      const statusDiff = statusPriority[a.status] - statusPriority[b.status];
      if (statusDiff !== 0) {
        return statusDiff;
      }
      
      // For books with the same status, sort by dateAdded (most recent first)
      const dateA = new Date(a.dateAdded || 0);
      const dateB = new Date(b.dateAdded || 0);
      return dateB.getTime() - dateA.getTime();
    });
  };

  const filteredBooks = sortBooksByStatus(filter === 'all' 
    ? books 
    : books.filter(book => book.status === filter));

  const updateBookProgress = async (isbn: string, progress: number): Promise<void> => {
    try {
      const bookToUpdate = books.find(book => book.isbn === isbn);
      
      if (!bookToUpdate) {
        console.error("Book not found for progress update:", isbn);
        return;
      }
      
      const newStatus = progress === bookToUpdate.totalPages ? 'finished' : (progress > 0 ? 'in progress' : bookToUpdate.status);
      
      const updatedBook = {
        ...bookToUpdate,
        currentPage: progress,
        status: newStatus as 'to read' | 'in progress' | 'finished',
      };
      
      const currentUserID = await getCurrentUserID();
      
      if (!currentUserID) {
        console.log("Cannot find UserID in local storage");
        setLoading(false);
        return;
      }

      // Update on server
      const queryParams = {
        userId: currentUserID,
        isbn,
      }

      const updateBookBody = {
        currentPage: progress,
        status: newStatus as 'to read' | 'in progress' | 'finished',
      }
      const resp = await Put(`records`, queryParams, JSON.stringify(updateBookBody));
      
      if (!resp || !resp.ok) {
        console.error(resp?.status);
        const data = await resp?.json();
        console.error("Error updating book progress:", JSON.stringify(data));
        Alert.alert("Error", "Failed to update progress. Please try again.");
        return;
      }
      
      // Update local state
      const updatedBooks = books.map(record => {
        if (record.isbn === isbn) {
          return updatedBook;
        }
        return record;
      });
      
      setBooks(updatedBooks);
      
      // If the detail modal is open, update the selected book
      if (selectedBook && selectedBook.isbn === isbn) {
        setSelectedBook(updatedBook);
      }
      
    } catch (error) {
      console.error("Error updating book progress:", error);
      Alert.alert("Error", "Failed to update progress. Please try again.");
    }
  };

  const removeBookRecord = async (isbn: string): Promise<void> => {
    try {
      // Show confirmation dialog
      Alert.alert(
        "Remove Book",
        "Are you sure you want to remove this book from your library?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Remove",
            style: "destructive",
            onPress: async () => {
              try {
                // Get current user ID
                const currentUserID = await getCurrentUserID();
                
                if (!currentUserID) {
                  console.log("Cannot find UserID in local storage");
                  return;
                }
                
                const queryParams = {
                  userId: currentUserID,
                  isbn,
                };
                
                // Call delete endpoint
                const resp = await DeleteWithQueryParams("records", queryParams);
                
                if (!resp || !resp.ok) {
                  console.error("Error removing book record:", resp?.status);
                  const errResp = await resp?.json();
                  console.error(errResp);
                  Alert.alert("Error", "Failed to remove book from library. Please try again.");
                  return;
                }
                
                // Update local state by filtering out the removed book
                setBooks(prevBooks => prevBooks.filter(book => book.isbn !== isbn));
                
                // Close detail modal if open
                if (selectedBook && selectedBook.isbn === isbn) {
                  setShowDetailModal(false);
                  setSelectedBook(null);
                }
                
                Alert.alert("Success", "Book removed from your library");
              } catch (error) {
                console.error("Error removing book:", error);
                Alert.alert("Error", "There was a problem removing the book. Please try again.");
              }
            }
          }
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error("Error in removeBookRecord:", error);
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    }
  };

  // Open detail modal for a book
  const openBookDetail = (book: BookRecord): void => {
    setSelectedBook(book);
    setShowDetailModal(true);
  };

  const renderBookItem: ListRenderItem<BookRecord> = ({ item }) => (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={() => openBookDetail(item)}
    >
      <Card>
        <Row>
          <Image 
            source={{ uri: item.cover || 'https://via.placeholder.com/70x100?text=No+Cover' }} 
            style={{ width: 70, height: 100, borderRadius: 8 }} 
          />
          <View style={{ marginLeft: spacing.md, flex: 1 }}>
            <Row justify="between">
              <Heading level={4} style={{ flex: 1 }}>{item.title}</Heading>
              <StatusBadge status={item.status} />
            </Row>
            <Paragraph secondary>{item.author}</Paragraph>
            <Paragraph secondary small>{item.genre}</Paragraph>
            
            {/* Progress section */}
            <View style={{ marginTop: spacing.sm }}>
              {item.status !== 'to read' && item.totalPages > 0 && (
                <>
                  <Row justify="between">
                    <Paragraph small>Progress</Paragraph>
                    <Paragraph small>{Math.round((item.currentPage / item.totalPages) * 100)}%</Paragraph>
                  </Row>
                  <View style={{ 
                    height: 6, 
                    backgroundColor: colors.border, 
                    borderRadius: 3, 
                    marginTop: 4 
                  }}>
                    <View style={{ 
                      height: '100%', 
                      width: `${(item.currentPage / item.totalPages) * 100}%`, 
                      backgroundColor: colors.secondary, 
                      borderRadius: 3 
                    }} />
                  </View>
                  <Row justify="between" style={{ marginTop: 4 }}>
                    <Paragraph small secondary>{item.currentPage} pages</Paragraph>
                    <Paragraph small secondary>of {item.totalPages}</Paragraph>
                  </Row>
                </>
              )}
              
              {/* Actions */}
              <Row style={{ marginTop: spacing.sm }}>
                {item.status === 'to read' && (
                  <OutlineButton 
                    title="Start Reading" 
                    onPress={(e) => {
                      e.stopPropagation(); // Prevent triggering the card touch
                      updateBookProgress(item.isbn, 1);
                    }}
                    style={{ flex: 1, marginRight: spacing.sm }}
                  />
                )}
                {item.status === 'in progress' && (
                  <OutlineButton 
                    title="Update Progress" 
                    onPress={(e) => {
                      e.stopPropagation(); // Prevent triggering the card touch
                      // Open detail modal to update progress
                      openBookDetail(item);
                    }}
                    style={{ flex: 1 }}
                  />
                )}
              </Row>
            </View>
          </View>
        </Row>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <SafeAreaView style={baseStyles.container}>
      {/* Filter tabs */}
      <Row style={{ marginBottom: spacing.md }}>
        <TouchableOpacity 
          style={{ 
            paddingVertical: spacing.sm, 
            paddingHorizontal: spacing.md, 
            borderRadius: spacing.sm,
            backgroundColor: filter === 'all' ? colors.secondary : 'transparent',
            marginRight: spacing.sm,
          }}
          onPress={() => setFilter('all')}
        >
          <Paragraph style={{ color: filter === 'all' ? 'white' : colors.text }}>All</Paragraph>
        </TouchableOpacity>
        <TouchableOpacity 
          style={{ 
            paddingVertical: spacing.sm, 
            paddingHorizontal: spacing.md, 
            borderRadius: spacing.sm,
            backgroundColor: filter === 'to read' ? colors.info : 'transparent',
            marginRight: spacing.sm,
          }}
          onPress={() => setFilter('to read')}
        >
          <Paragraph style={{ color: filter === 'to read' ? 'white' : colors.text }}>To Read</Paragraph>
        </TouchableOpacity>
        <TouchableOpacity 
          style={{ 
            paddingVertical: spacing.sm, 
            paddingHorizontal: spacing.md, 
            borderRadius: spacing.sm,
            backgroundColor: filter === 'in progress' ? colors.warning : 'transparent',
            marginRight: spacing.sm,
          }}
          onPress={() => setFilter('in progress')}
        >
          <Paragraph style={{ color: filter === 'in progress' ? 'white' : colors.text }}>In Progress</Paragraph>
        </TouchableOpacity>
        <TouchableOpacity 
          style={{ 
            paddingVertical: spacing.sm, 
            paddingHorizontal: spacing.md, 
            borderRadius: spacing.sm,
            backgroundColor: filter === 'finished' ? colors.success : 'transparent',
          }}
          onPress={() => setFilter('finished')}
        >
          <Paragraph style={{ color: filter === 'finished' ? 'white' : colors.text }}>Finished</Paragraph>
        </TouchableOpacity>
      </Row>

      {/* Book list */}
      {filteredBooks.length === 0 ? (
        <EmptyState
          title="No books found"
          message={filter === 'all' ? "You haven't added any books yet." : `You don't have any ${filter} books.`}
          icon={<Ionicons name="book-outline" size={50} color={colors.textSecondary} />}
          action={
            filter === 'all' ? (
              <Button 
                title="Add Your First Book" 
                onPress={() => setShowAddModal(true)} 
              />
            ) : (
              <OutlineButton 
                title="Show All Books" 
                onPress={() => setFilter('all')} 
              />
            )
          }
        />
      ) : (
        <FlatList
          data={filteredBooks}
          renderItem={renderBookItem}
          keyExtractor={(item) => item.isbn}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating action button */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: spacing.xl,
          right: spacing.xl,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.secondary,
          justifyContent: 'center',
          alignItems: 'center',
          ...shadows.medium,
        }}
        onPress={() => setShowAddModal(true)}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* Add Book Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={{ 
          flex: 1, 
          justifyContent: 'flex-end', 
          backgroundColor: 'rgba(0,0,0,0.5)' 
        }}>
          <View style={{ 
            backgroundColor: colors.background, 
            padding: spacing.md, 
            borderTopLeftRadius: spacing.lg, 
            borderTopRightRadius: spacing.lg,
            maxHeight: '90%',
          }}>
            <Row justify="between">
              <Heading level={2}>Add New Book</Heading>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </Row>
            <Divider />

            <ScrollView showsVerticalScrollIndicator={false}>
              <Row justify="between" style={{ marginBottom: spacing.md }}>
                <OutlineButton 
                  title="Scan ISBN" 
                  onPress={() => {
                    setShowAddModal(false);
                    setTimeout(() => {
                      setShowScannerModal(true);
                    }, 300);
                  }}
                  style={{ flex: 1 }}
                />
              </Row>

              <Paragraph style={{ marginBottom: spacing.sm }}>Title</Paragraph>
              <Input
                placeholder="Book title"
                value={formData.title}
                onChangeText={(text: string) => setFormData({...formData, title: text})}
                style={{ marginBottom: spacing.md }}
              />

              <Paragraph style={{ marginBottom: spacing.sm }}>Author</Paragraph>
              <Input
                placeholder="Author name"
                value={formData.author}
                onChangeText={(text: string) => setFormData({...formData, author: text})}
                style={{ marginBottom: spacing.md }}
              />

              <Row>
                <View style={{ flex: 1, marginRight: spacing.sm }}>
                  <Paragraph style={{ marginBottom: spacing.sm }}>ISBN (Optional)</Paragraph>
                  <Input
                    placeholder="ISBN"
                    value={formData.isbn}
                    onChangeText={(text: string) => setFormData({...formData, isbn: text})}
                    style={{ marginBottom: spacing.md }}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Paragraph style={{ marginBottom: spacing.sm }}>Genre</Paragraph>
                  <Input
                    placeholder="Genre"
                    value={formData.genre}
                    onChangeText={(text: string) => setFormData({...formData, genre: text})}
                    style={{ marginBottom: spacing.md }}
                  />
                </View>
              </Row>

              <Row>
                <View style={{ flex: 1, marginRight: spacing.sm }}>
                  <Paragraph style={{ marginBottom: spacing.sm }}>Total Pages</Paragraph>
                  <Input
                    placeholder="Total pages"
                    value={formData.totalPages.toString()}
                    onChangeText={(text: string) => setFormData({...formData, totalPages: parseInt(text) || 0})}
                    keyboardType="numeric"
                    style={{ marginBottom: spacing.md }}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.sm }}>
                  <Paragraph style={{ marginBottom: spacing.sm }}>Year</Paragraph>
                  <Input
                    placeholder="Publication year"
                    value={formData.year?.toString() || ''}
                    onChangeText={(text: string) => setFormData({...formData, year: parseInt(text) || 0})}
                    keyboardType="numeric"
                    style={{ marginBottom: spacing.md }}
                  />
                </View>
              </Row>

              <Paragraph style={{ marginBottom: spacing.sm }}>Status</Paragraph>
              <View style={{ 
                flexDirection: 'row', 
                marginBottom: spacing.md,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                overflow: 'hidden'
              }}>
                {(['to read', 'in progress', 'finished'] as const).map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={{
                      flex: 1,
                      padding: spacing.sm,
                      backgroundColor: formData.status === status ? colors.secondary : 'transparent',
                      alignItems: 'center',
                    }}
                    onPress={() => setFormData({...formData, status})}
                  >
                    <Paragraph style={{ 
                      color: formData.status === status ? 'white' : colors.text,
                      fontSize: 12,
                    }}>
                      {status === 'to read' ? 'To Read' : 
                       status === 'in progress' ? 'Reading' : 'Finished'}
                    </Paragraph>
                  </TouchableOpacity>
                ))}
              </View>

              <Paragraph style={{ marginBottom: spacing.sm }}>Cover Image URL (Optional)</Paragraph>
              <Input
                placeholder="Cover image URL"
                value={formData.cover}
                onChangeText={(text: string) => setFormData({...formData, cover: text})}
                style={{ marginBottom: spacing.md }}
              />

              <Paragraph style={{ marginBottom: spacing.sm }}>Description (Optional)</Paragraph>
              <Input
                placeholder="Book description"
                value={formData.description || ''}
                onChangeText={(text: string) => setFormData({...formData, description: text})}
                multiline
                style={{ marginBottom: spacing.md, height: 100, textAlignVertical: 'top' }}
              />

              <Button title="Add to Library" onPress={handleAddBook} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ISBN Scanner Modal */}
      <Modal
        visible={showScannerModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowScannerModal(false)}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ 
            padding: spacing.md, 
            flexDirection: 'row', 
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Heading level={2}>Scan ISBN</Heading>
            <TouchableOpacity onPress={() => {
              setShowScannerModal(false);
              setTimeout(() => setShowAddModal(true), 300);
            }}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <Divider />

          <View style={{ flex: 1 }}>
            {!permission ? (
              <EmptyState title="Requesting permission" message="Please wait..." />
            ) : !permission.granted ? (
              <EmptyState 
                title="No camera permission" 
                message="Please grant camera permission to use the scanner."
                action={<Button title="Grant Permission" onPress={requestPermission} />}
              />
            ) : (
              <CameraView
                style={{ flex: 1 }}
                barcodeScannerSettings={{
                  barcodeTypes: ["ean13", "ean8", "qr"]
                }}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              />
            )}
            {scanned && (
              <Button title="Tap to Scan Again" onPress={() => setScanned(false)} />
            )}
          </View>
        </SafeAreaView>
      </Modal>

      {/* Book Detail Modal */}
      {selectedBook && (
        <BookDetailModal
          visible={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          book={selectedBook}
          onUpdateProgress={(progress: number) => {
            updateBookProgress(selectedBook.isbn, progress);
          }}
          onRemoveRecord={() => removeBookRecord(selectedBook.isbn)}
          isInLibrary={true}
        />
      )}
    </SafeAreaView>
  );
}