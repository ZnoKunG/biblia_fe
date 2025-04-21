// app/components/BookDetailModal.tsx
import React from 'react';
import { 
  View, 
  Modal, 
  Image, 
  TouchableOpacity, 
  ScrollView,
  StyleSheet,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { spacing, fontSize, shadows } from '../styles/defaultStyles';
import { 
  Heading, 
  Paragraph, 
  Button, 
  OutlineButton, 
  Row, 
  Divider, 
  StatusBadge 
} from '../styles/defaultComponents';
import { useTheme } from '../styles/themeContext';

interface BookDetailModalProps {
  visible: boolean;
  onClose: () => void;
  book: Book | BookRecord;
  onAddToLibrary?: () => void;
  onUpdateProgress?: (progress: number) => void;
  onRemoveRecord?: () => void;
  isInLibrary: boolean;
}

const BookDetailModal = ({ 
  visible, 
  onClose, 
  book, 
  onAddToLibrary,
  onUpdateProgress,
  onRemoveRecord,
  isInLibrary
}: BookDetailModalProps) => {
  // Helper to determine if book is a library record or search result
  const isLibraryBook = (book: Book | BookRecord): book is BookRecord => {
    return 'status' in book;
  };

  const { baseStyles, colors } = useTheme();
  
  // Define styles inside the component to access theme context
  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0,0,0,0.5)'
    },
    modalContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: spacing.lg,
      borderTopRightRadius: spacing.lg,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      maxHeight: '85%',
    },
    modalHeader: {
      marginBottom: spacing.sm,
    },
    coverContainer: {
      alignItems: 'center',
      marginVertical: spacing.md,
      position: 'relative',
    },
    coverImage: {
      width: 160,
      height: 240,
      borderRadius: spacing.md,
      ...shadows.medium,
    },
    ratingBadge: {
      position: 'absolute',
      bottom: 0,
      left: spacing.lg * 2,
      backgroundColor: colors.accent,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderTopRightRadius: spacing.sm,
      borderTopLeftRadius: spacing.sm,
      flexDirection: 'row',
      alignItems: 'center',
    },
    ratingText: {
      color: '#fff',
      fontWeight: 'bold',
      marginLeft: 4,
    },
    statusBadgeContainer: {
      position: 'absolute',
      top: -spacing.sm,
      right: spacing.lg * 2,
      transform: [{ translateY: -50 }],
    },
    detailsSection: {
      padding: spacing.sm,
    },
    author: {
      marginBottom: spacing.md,
    },
    detailRow: {
      flexWrap: 'wrap',
      marginBottom: spacing.md,
    },
    detailTag: {
      backgroundColor: colors.primary + '20',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: spacing.sm,
      marginRight: spacing.sm,
      marginBottom: spacing.sm,
    },
    yearTag: {
      backgroundColor: colors.secondary + '20',
    },
    pagesTag: {
      backgroundColor: colors.info + '20',
      flexDirection: 'row',
      alignItems: 'center',
    },
    tagText: {
      fontSize: fontSize.sm,
    },
    progressSection: {
      marginVertical: spacing.md,
      backgroundColor: colors.card,
      padding: spacing.md,
      borderRadius: spacing.md,
      ...shadows.small,
    },
    progressBar: {
      height: 8,
      backgroundColor: colors.border,
      borderRadius: 4,
      marginVertical: spacing.sm,
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.secondary,
      borderRadius: 4,
    },
    addedSection: {
      marginBottom: spacing.md,
    },
    descriptionSection: {
      marginVertical: spacing.md,
    },
    actionSection: {
      marginTop: spacing.md,
    },
    actionButton: {
      marginBottom: spacing.sm,
    },
  });

  // Get formatted date if it's a library book
  const getFormattedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Row justify="between" style={styles.modalHeader}>
            <Heading level={2}>Book Details</Heading>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </Row>
          <Divider />

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.coverContainer}>
              <Image 
                source={{ uri: book.cover }} 
                style={styles.coverImage}
                resizeMode="cover"
              />
              
              {/* Rating badge for search books */}
              {!isLibraryBook(book) && (
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={14} color="#fff" />
                  <Paragraph style={styles.ratingText}>{book.rating.toFixed(1)}</Paragraph>
                </View>
              )}
              
              {/* Status badge for library books */}
              {isLibraryBook(book) && (
                <View style={styles.statusBadgeContainer}>
                  <StatusBadge status={book.status} />
                </View>
              )}
            </View>

            <View style={styles.detailsSection}>
              <Heading level={3}>{book.title}</Heading>
              <Paragraph secondary style={styles.author}>by {book.author}</Paragraph>
              
              <Row style={styles.detailRow}>
                <View style={styles.detailTag}>
                  <Paragraph style={styles.tagText}>{book.genre}</Paragraph>
                </View>
                
                {!isLibraryBook(book) && (
                  <View style={[styles.detailTag, styles.yearTag]}>
                    <Paragraph style={styles.tagText}>{book.year}</Paragraph>
                  </View>
                )}
                
                <View style={[styles.detailTag, styles.pagesTag]}>
                  <Ionicons name="book-outline" size={14} color={colors.text} style={{marginRight: 4}} />
                  <Paragraph style={styles.tagText}>{book.totalPages} pages</Paragraph>
                </View>
              </Row>
              
              {/* Progress section for library books */}
              {isLibraryBook(book) && book.status !== 'to read' && (
                <View style={styles.progressSection}>
                  <Row justify="between">
                    <Paragraph>Reading Progress</Paragraph>
                    <Paragraph>{Math.round((book.currentPage / book.totalPages) * 100)}%</Paragraph>
                  </Row>
                  <View style={styles.progressBar}>
                    <View style={[
                      styles.progressFill, 
                      { width: `${(book.currentPage / book.totalPages) * 100}%` }
                    ]} />
                  </View>
                  <Row justify="between">
                    <Paragraph secondary small>{book.currentPage} pages read</Paragraph>
                    <Paragraph secondary small>of {book.totalPages}</Paragraph>
                  </Row>
                </View>
              )}
              
              {/* Additional info for library books */}
              {isLibraryBook(book) && (
                <View style={styles.addedSection}>
                  <Paragraph secondary>Added to library: {getFormattedDate(book.dateAdded)}</Paragraph>
                </View>
              )}
              
              {/* Sample text section - in a real app, this could be a description */}
              <View style={styles.descriptionSection}>
                <Heading level={4}>About this book</Heading>
                <Paragraph>
                {book.description || "No description about this book."}
                </Paragraph>
              </View>
              
              {/* Action buttons */}
              <View style={styles.actionSection}>
                {isInLibrary ? (
                  // Library book actions
                  <>
                    {isLibraryBook(book) && book.status === 'to read' && (
                      <Button 
                        title="Start Reading" 
                        onPress={() => onUpdateProgress && onUpdateProgress(1)}
                        style={styles.actionButton}
                      />
                    )}
                    
                    {isLibraryBook(book) && book.status === 'in progress' && (
                      <Button 
                        title="Update Progress" 
                        onPress={() => {
                          // In a real app, show input for exact page
                          const newProgress = Math.min(book.currentPage + 10, book.totalPages);
                          onUpdateProgress && onUpdateProgress(newProgress);
                        }}
                        style={styles.actionButton}
                      />
                    )}
                    
                    <OutlineButton 
                      title="Remove from Library" 
                      onPress={() => {
                        onRemoveRecord && onRemoveRecord();
                        onClose();
                      }}
                      style={{
                        ...styles.actionButton,
                        marginTop: spacing.sm
                      }}
                    />
                  </>
                ) : (
                  // Search book actions
                  <Button 
                    title="Add to Library" 
                    onPress={() => {
                      onAddToLibrary && onAddToLibrary();
                      onClose();
                    }}
                    style={styles.actionButton}
                  />
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default BookDetailModal;