// app/(tabs)/library.tsx with detail modal
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
import mockRecords from '@/utils/mockRecords';
import BookDetailModal from '../components/bookDetail';
import { useTheme } from '../styles/themeContext';
import { Get, GetISBNBook, GetWithQueryParams, Post } from '@/services/serviceProvider';
import { getCurrentUserID, getIsLoggedIn } from '../services/authService';
import { useRouter } from 'expo-router';

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
  });

  const checkLogin = async () => {
    try {
      const loggedin = await getIsLoggedIn();

      if (!loggedin) {
        router.replace('/auth/login');
        return;
      }
    }
    catch (err) {
      console.log(err);
    }
  }

  // Fetch books data
  useEffect(() => {
    checkLogin();

    const timer = setTimeout(async () => {
      const currentUserID = await getCurrentUserID();
      // Fetch book record data of the user

      if (!currentUserID)
      {
        console.log("cannot find UserID in local storage");
        return;
      }

      const queryParams = { userID: currentUserID };
      const resp = await GetWithQueryParams('records', queryParams);
      
      if (!resp) {
        console.log("cannot query record data from the user ", currentUserID);
        return;
      }

      if (!resp.ok) {
        console.log("Error: " + resp.status);
        return;
      }

      const recordResp = await resp.json();
      console.log(recordResp);

      const records: BookRecord[] = recordResp.data;
      setBooks(records);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const onRefresh = React.useCallback((): void => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const processGoogleBookAPI = (data: any) => {
    try {
      const item = data.items[0];

      // Safely extract industry identifiers (ISBN)
    const isbn = item.volumeInfo.industryIdentifiers ? 
      item.volumeInfo.industryIdentifiers[0].identifier : '';
    
    // Safely extract other potentially undefined fields
    const title = item.volumeInfo.title || '';
    const author = item.volumeInfo.authors && item.volumeInfo.authors.length > 0 ? 
      item.volumeInfo.authors[0] : 'Unknown Author';
    const cover = item.volumeInfo.imageLinks ? 
      item.volumeInfo.imageLinks.thumbnail : '';
    const genre = item.volumeInfo.categories && item.volumeInfo.categories.length > 0 ? 
      item.volumeInfo.categories[0] : 'Uncategorized';
    const totalPages = item.volumeInfo.pageCount || 0;
    
    setFormData({
      userID: 0,
      isbn: isbn,
      title: title,
      author: author,
      cover: cover,
      genre: genre,
      totalPages: totalPages,
      status: formData.status || 'to read',
      currentPage: 0,
    });
    
    console.log(formData);
  } catch (err: any) {
    console.log(err);
  }
};

  const handleAddBook = async (): Promise<void> => {
    // Validation
    console.log(`Adding new book with ${JSON.stringify(formData)}`);

    if (!formData.title || !formData.author) {
      Alert.alert('Missing Information', 'Please enter at least title and author');
      return;
    }
    
    const currentUserID = await getCurrentUserID();
      // Fetch book record data of the user

    if (!currentUserID)
    {
      console.log("cannot find UserID in local storage");
      return;
    }

    console.log(`Current user id: ${currentUserID}`);
    
    const newBook: BookRecord = {
      ...formData,
      userID: parseInt(currentUserID) || 0,
      dateAdded: new Date().toISOString(),
    };

    const resp = await Post("records", JSON.stringify(newBook));

    if (!resp) {
      Alert.alert('Error', "Cannot create record");
      return;
    }

    if (!resp.ok) {
      console.log(resp.status);
      const respErr = await resp.json();
      console.log(respErr);
      return;
    }

    const createRecordResp: Response = await resp.json();
    console.log(createRecordResp);
    const newRecord: BookRecord = createRecordResp.data;

    setBooks([newRecord, ...books]);
    setShowAddModal(false);
    resetForm();
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
    });
  };

  const handleBarCodeScanned = (result: { type: string; data: string }): void => {
    setScanned(true);
    setShowScannerModal(false);
    
    setTimeout(async () => {
      if (result.data) {

        const resp = await GetISBNBook(result.data);

        if (!resp)
        {
          console.log("null request!");
          return;
        }

        if (!resp.ok) {
          console.log(resp.status);
          return;
        }
        
        const data = await resp.json();
        
        processGoogleBookAPI(data);
        
        setTimeout(() => {
          console.log("Opening add modal...");
          setShowAddModal(true);
        }, 300);
      }
    }, 500);
  };

  const filteredBooks = filter === 'all' 
    ? books 
    : books.filter(book => book.status === filter);

  const updateBookProgress = (isbn: string, progress: number): void => {
    const updatedBooks = books.map(record => {
      if (record.isbn === isbn) {
        return {
          ...record,
          currentPage: progress,
          status: progress === record.totalPages ? 'finished' : 'in progress' as 'finished' | 'in progress',
        };
      }
      return record;
    });
    
    setBooks(updatedBooks);
    
    // If the detail modal is open, update the selected book
    if (selectedBook && selectedBook.isbn === isbn) {
      setSelectedBook({
        ...selectedBook,
        currentPage: progress,
        status: progress === selectedBook.totalPages ? 'finished' : 'in progress',
      });
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
            source={{ uri: item.cover }} 
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
              {item.status !== 'to read' && (
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
                      const newProgress = Math.min(item.currentPage + 10, item.totalPages);
                      updateBookProgress(item.isbn, newProgress);
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
                  <Paragraph style={{ marginBottom: spacing.sm }}>ISBN</Paragraph>
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
                </View>
              </Row>

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
                facing="back"
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
            // Close modal after updating progress
            setShowDetailModal(false);
          }}
          isInLibrary={true}
        />
      )}
    </SafeAreaView>
  );
}