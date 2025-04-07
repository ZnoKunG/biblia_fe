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
  
  // New book form state
  const [formData, setFormData] = useState<RecordFormData>({
    title: '',
    author: '',
    isbn: '',
    cover: 'https://via.placeholder.com/120x180',
    genre: '',
    status: 'to read',
    currentPage: 0,
    totalPages: 0,
  });

  // Fetch books data
  useEffect(() => {
    const timer = setTimeout(() => {
      setBooks(mockRecords);
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

  const handleAddBook = (): void => {
    // Validation
    if (!formData.title || !formData.author) {
      Alert.alert('Missing Information', 'Please enter at least title and author');
      return;
    }

    const newBook: BookRecord = {
      id: Date.now().toString(),
      ...formData,
      dateAdded: new Date().toISOString().split('T')[0],
    };

    setBooks([newBook, ...books]);
    setShowAddModal(false);
    resetForm();
  };

  const resetForm = (): void => {
    setFormData({
      title: '',
      author: '',
      isbn: '',
      cover: 'https://via.placeholder.com/120x180',
      genre: '',
      status: 'to read',
      currentPage: 0,
      totalPages: 0,
    });
  };

  const handleBarCodeScanned = (result: { type: string; data: string }): void => {
    setScanned(true);
    setShowScannerModal(false);
    
    // Mock ISBN API lookup
    setTimeout(() => {
      if (result.data) {
        // Mock data return for demo purposes
        setFormData({
          ...formData,
          isbn: result.data,
          title: 'The Great Gatsby',
          author: 'F. Scott Fitzgerald',
          genre: 'Classic',
          totalPages: 180,
        });
        
        setTimeout(() => setShowAddModal(true), 300);
      }
    }, 500);
  };

  const filteredBooks = filter === 'all' 
    ? books 
    : books.filter(book => book.status === filter);

  const updateBookProgress = (id: string, progress: number): void => {
    const updatedBooks = books.map(book => {
      if (book.id === id) {
        return {
          ...book,
          currentPage: progress,
          status: progress === book.totalPages ? 'finished' : 'in progress' as 'finished' | 'in progress',
        };
      }
      return book;
    });
    
    setBooks(updatedBooks);
    
    // If the detail modal is open, update the selected book
    if (selectedBook && selectedBook.id === id) {
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
                      updateBookProgress(item.id, 1);
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
                      updateBookProgress(item.id, newProgress);
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
          keyExtractor={(item) => item.id}
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
            updateBookProgress(selectedBook.id, progress);
            // Close modal after updating progress
            setShowDetailModal(false);
          }}
          isInLibrary={true}
        />
      )}
    </SafeAreaView>
  );
}