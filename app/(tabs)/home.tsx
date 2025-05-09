// app/(tabs)/home.tsx
import React, { useState, useEffect, JSX } from 'react';
import { View, ScrollView, Dimensions, SafeAreaView, RefreshControl, Alert, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProgressChart, LineChart } from 'react-native-chart-kit';
import { Card, Heading, Paragraph, Row, StatusBadge, Divider, LoadingIndicator, Button, OutlineButton, Badge } from '../styles/defaultComponents';
import { useTheme } from '../styles/themeContext';
import { getCurrentUserID } from '../services/authService';
import { Get, GetWithQueryParams, Put, DeleteWithQueryParams } from '@/services/serviceProvider';
import { useFocusEffect } from 'expo-router';
import { BookRecord, Book } from '@/models/book.model';
import BookDetailModal from '../components/bookDetail';
import { Response } from '@/models/response.model';
import { mockBooks, mockRecords } from '@/utils/mockBooks';

const screenWidth = Dimensions.get('window').width;

interface ReadingProgress {
  bookRecord: BookRecord;
  progress: number;
  lastRead: string;
}

interface DailyGoal {
  target: number;
  achieved: number;
  percentage: number;
}

interface ReadingInsight {
  title: string;
  description: string;
  icon: string;
}

interface RecommendedBook {
  bookRecord: BookRecord;
  reason: string;
}

interface DashboardData {
  currentReads: ReadingProgress[];
  weeklyReadingStreak: number[];
  dailyGoal: DailyGoal;
  readingInsights: ReadingInsight[];
  recommendedBooks: RecommendedBook[];
  recentFinishedBooks: ReadingProgress[];
}

export default function HomePage(): JSX.Element {
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [selectedBook, setSelectedBook] = useState<BookRecord | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  
  const { baseStyles, colors, radius, spacing } = useTheme();

  // Function to get relative time
  const getRelativeTimeString = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const differenceInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (differenceInDays === 0) {
      return "Today";
    } else if (differenceInDays === 1) {
      return "Yesterday";
    } else if (differenceInDays < 7) {
      return `${differenceInDays} days ago`;
    } else if (differenceInDays < 14) {
      return "1 week ago";
    } else if (differenceInDays < 30) {
      return `${Math.floor(differenceInDays / 7)} weeks ago`;
    } else {
      return `${Math.floor(differenceInDays / 30)} months ago`;
    }
  };

  // Calculate reading progress percentage
  const calculateProgress = (current: number, total: number): number => {
    if (total === 0) return 0;
    return Math.min(1, current / total);
  };

  // Transform API data into dashboard data
  const transformApiDataToDashboard = (books: BookRecord[]): DashboardData => {
    // Get in-progress books with calculated progress
    const inProgressBooks = books
      .filter(book => book.status === "in progress")
      .map(book => ({
        bookRecord: book,
        progress: calculateProgress(book.currentPage, book.totalPages),
        lastRead: getRelativeTimeString(book.dateAdded)
      }))
      .sort((a, b) => b.progress - a.progress); // Sort by progress (most completed first)

    // Get recently finished books
    const finishedBooks = books
      .filter(book => book.status === "finished")
      .map(book => ({
        bookRecord: book,
        progress: 1, // 100% complete
        lastRead: getRelativeTimeString(book.dateAdded)
      }))
      .sort((a, b) => {
        const dateA = new Date(a.bookRecord.dateAdded);
        const dateB = new Date(b.bookRecord.dateAdded);
        return dateB.getTime() - dateA.getTime(); // Most recent first
      })
      .slice(0, 3); // Only take the 3 most recently finished

    // Calculate daily reading goal
    // For example, aim to read 30 pages per day
    const targetPagesPerDay = 30;
    
    // Calculate pages read today (sum of progress made today across all books)
    const today = new Date().toDateString();
    const pagesReadToday = books
      .filter(book => {
        // Check if book has been read today
        const lastReadDate = new Date(book.dateAdded).toDateString();
        return lastReadDate === today;
      })
      .reduce((total, book) => {
        // Add pages read today (simplified - in a real app you'd track actual daily progress)
        return total + 5; // Assume 5 pages per book that was touched today
      }, 0);
    
    // Default to 22 pages if no activity tracked today
    const actualPagesRead = pagesReadToday > 0 ? pagesReadToday : 22;
    
    const dailyGoal = {
      target: targetPagesPerDay,
      achieved: actualPagesRead,
      percentage: Math.min(1, actualPagesRead / targetPagesPerDay)
    };

    // Weekly reading streak (pages read each day for the last 7 days)
    // This would come from API in real implementation
    const weeklyReadingStreak = [15, 30, 20, 35, 25, 40, 22];

    // Reading insights based on user's data
    const favoriteGenres = getFavoriteGenres(books);
    const readingPace = calculateReadingPace(books);
    const readingConsistency = getReadingConsistency(books);
    
    const readingInsights = [
      {
        title: "Favorite Genre",
        description: `You love ${favoriteGenres[0]?.genre || "exploring different genres"}!`,
        icon: "book"
      },
      {
        title: "Reading Pace",
        description: `You read about ${readingPace} pages per day.`,
        icon: "time"
      },
      {
        title: "Reading Habit",
        description: readingConsistency,
        icon: "calendar"
      }
    ];

    // Generate book recommendations based on user's reading history
    const recommendedBooks = generateRecommendations(books);

    return {
      currentReads: inProgressBooks,
      weeklyReadingStreak,
      dailyGoal,
      readingInsights,
      recommendedBooks,
      recentFinishedBooks: finishedBooks
    };
  };

  // Helper function to identify favorite genres
  const getFavoriteGenres = (books: BookRecord[]) => {
    const genreCounts: Record<string, number> = {};
    books.forEach(book => {
      if (genreCounts[book.genre]) {
        genreCounts[book.genre]++;
      } else {
        genreCounts[book.genre] = 1;
      }
    });
    
    return Object.entries(genreCounts)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count);
  };

  // Helper function to calculate reading pace
  const calculateReadingPace = (books: BookRecord[]): number => {
    const finishedBooks = books.filter(book => book.status === "finished");
    const totalPages = finishedBooks.reduce((total, book) => total + book.totalPages, 0);
    
    // Assuming books were read over the last 30 days for simplicity
    // In a real app, would use actual reading dates
    const estimatedDays = Math.max(30, finishedBooks.length * 7);
    
    return Math.round(totalPages / estimatedDays);
  };

  // Helper function to analyze reading consistency
  const getReadingConsistency = (books: BookRecord[]): string => {
    // This is a simplified analysis - in a real app, you'd use actual reading timestamps
    const inProgressCount = books.filter(book => book.status === "in progress").length;
    const finishedCount = books.filter(book => book.status === "finished").length;
    
    if (finishedCount >= 3 && inProgressCount >= 1) {
      return "You're a consistent reader!";
    } else if (finishedCount >= 1) {
      return "You've been reading regularly.";
    } else {
      return "Try to read a little each day.";
    }
  };

  // Helper function to generate book recommendations
  const generateRecommendations = (books: BookRecord[]): RecommendedBook[] => {
    // For this demo, we'll create recommendations based on user's reading history
    const favoriteGenres = getFavoriteGenres(books).slice(0, 2).map(g => g.genre);
    const toReadBooks = books.filter(book => book.status === "to read");
    const recommendations: RecommendedBook[] = [];
    
    // Recommend unstarted books from favorite genres
    const genreBasedRecs = toReadBooks
      .filter(book => favoriteGenres.includes(book.genre))
      .slice(0, 2)
      .map(book => ({
        bookRecord: book,
        reason: `Based on your interest in ${book.genre}`
      }));
    
    recommendations.push(...genreBasedRecs);
    
    // Recommend a book by an author they've read before
    const authorsRead = new Set(
      books
        .filter(book => book.status === "finished")
        .map(book => book.author)
    );
    
    const authorBasedRec = toReadBooks
      .filter(book => authorsRead.has(book.author) && !recommendations.some(rec => rec.bookRecord.isbn === book.isbn))
      .slice(0, 1)
      .map(book => ({
        bookRecord: book,
        reason: `You enjoyed other books by ${book.author}`
      }));
    
    recommendations.push(...authorBasedRec);
    
    // If we still need more recommendations, add some based on popularity
    if (recommendations.length < 3 && toReadBooks.length > 0) {
      const additionalRecs = toReadBooks
        .filter(book => !recommendations.some(rec => rec.bookRecord.isbn === book.isbn))
        .slice(0, 3 - recommendations.length)
        .map(book => ({
          bookRecord: book,
          reason: "Popular in your reading list"
        }));
      
      recommendations.push(...additionalRecs);
    }

    return recommendations;
  };

  // Fetch data from API
  const fetchData = async () => {
    try {
      const userId = await getCurrentUserID();
      if (!userId) {
        throw new Error('GetCurrentUserID was not ok');
      }

      const resp = await GetWithQueryParams(`records`, { userId });
      
      if (!resp || !resp.ok) {
        throw new Error('Network response was not ok');
      }
      
      const apiResp: Response = await resp.json();
      
      if (apiResp.success && apiResp.data) {
        const transformedData = transformApiDataToDashboard(apiResp.data);
        console.log(JSON.stringify(transformedData.currentReads));
        setDashboardData(transformedData);
      } else {
        throw new Error(apiResp.message || 'Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load your reading dashboard. Please try again later.');
      
      // Fall back to mock data in case of error
      const mockData = transformApiDataToDashboard(mockRecords);
      setDashboardData(mockData);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Update book progress
  const updateBookProgress = async (bookId: string, newPage: number) => {
    try {
      if (!selectedBook) return;
      
      // Create updated book object
      const updatedBook = { ...selectedBook, currentPage: newPage };
      
      // If book is completed, update status
      if (newPage === selectedBook.totalPages) {
        updatedBook.status = 'finished';
      } else if (selectedBook.status === 'to read') {
        updatedBook.status = 'in progress';
      }
      
      const resp = await Put(
        `records/${bookId}`, 
        { userId: String(selectedBook.userID) },
        JSON.stringify(updatedBook)
      );
      
      if (!resp || !resp.ok) {
        throw new Error('Network response was not ok');
      }
      
      // Refresh data
      await fetchData();
      
      Alert.alert('Success', 'Your reading progress has been updated!');
    } catch (error) {
      console.error('Error updating progress:', error);
      Alert.alert('Error', 'Failed to update reading progress. Please try again later.');
    }
  };

  // Remove book from library
  const removeBookFromLibrary = async () => {
    try {
      if (!selectedBook) return;
      
      const resp = await DeleteWithQueryParams(
        `records/${selectedBook.isbn}`, 
        { userId: String(selectedBook.userID) }
      );
      
      if (!resp || !resp.ok) {
        throw new Error('Network response was not ok');
      }
      
      Alert.alert('Success', 'The book has been removed from your library.');
      fetchData();
    } catch (error) {
      console.error('Error removing book:', error);
      Alert.alert('Error', 'Failed to remove book from library. Please try again later.');
    }
  };

  // Load data when component mounts
  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  // Handle refresh
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  // Open book detail modal
  const openBookDetail = (book: BookRecord) => {
    setSelectedBook(book);
    setModalVisible(true);
  };

  // Close book detail modal
  const closeBookDetail = () => {
    setModalVisible(false);
    setSelectedBook(null);
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  // Ensure dashboardData is not null before proceeding
  if (!dashboardData) {
    return (
      <SafeAreaView style={baseStyles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Paragraph>No reading data available. Add some books to your library to get started.</Paragraph>
          <Button 
            title="Browse Books" 
            onPress={() => {/* Navigation would go here */}}
            style={{ marginTop: spacing.md }}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Progress chart data
  const progressData = {
    data: [dashboardData.dailyGoal.percentage]
  };

  // Weekly reading data for line chart
  const weeklyData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: dashboardData.weeklyReadingStreak,
        color: (opacity = 1) => {
          const secondaryColor = colors.secondary as string;
          const rgbMatch = secondaryColor.replace('#', '').match(/.{1,2}/g);
          if (rgbMatch) {
            const rgb = rgbMatch.map(hex => parseInt(hex, 16)).join(',');
            return `rgba(${rgb}, ${opacity})`;
          }
          return `rgba(0, 0, 0, ${opacity})`;
        },
        strokeWidth: 2,
      },
    ],
  };

  return (
    <SafeAreaView style={baseStyles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <Heading level={1}>Reading Dashboard</Heading>

        {/* Continue Reading Section */}
        {/* Daily Reading Goal */}
      <Card>
        <Heading level={3}>Today's Reading Goal</Heading>
        <Row justify="between" style={{ alignItems: 'center', marginTop: spacing.md }}>
          <View style={{ flex: 1 }}>
            <Paragraph secondary>Your daily goal</Paragraph>
            <Heading level={2}>{dashboardData.dailyGoal.achieved} / {dashboardData.dailyGoal.target}</Heading>
            <Paragraph>pages read today</Paragraph>
            
            {dashboardData.dailyGoal.achieved >= dashboardData.dailyGoal.target ? (
              <Row style={{ marginTop: spacing.sm }}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} style={{ marginRight: spacing.xs }} />
                <Paragraph style={{ color: colors.success }}>Goal complete!</Paragraph>
              </Row>
            ) : (
              <Row style={{ marginTop: spacing.sm }}>
                <Ionicons name="time-outline" size={20} color={colors.primary} style={{ marginRight: spacing.xs }} />
                <Paragraph>{dashboardData.dailyGoal.target - dashboardData.dailyGoal.achieved} pages to go</Paragraph>
              </Row>
            )}
          </View>
          
          <View style={{ width: 120, height: 120 }}>
            <ProgressChart
              data={progressData}
              width={120}
              height={120}
              strokeWidth={15}
              radius={50}
              chartConfig={{
                backgroundGradientFrom: colors.card,
                backgroundGradientTo: colors.card,
                color: (opacity = 1) => {
                  return dashboardData.dailyGoal.achieved >= dashboardData.dailyGoal.target 
                    ? `rgba(72, 187, 120, ${opacity})` // Success color if goal met
                    : `rgba(56, 178, 172, ${opacity})`; // Secondary color otherwise
                },
                decimalPlaces: 0,
                labelColor: (opacity = 1) => colors.text,
              }}
              hideLegend={true}
            />
            <View style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              justifyContent: 'center', 
              alignItems: 'center' 
            }}>
              <Heading level={2} style={{ color: colors.primary }}>
                {Math.round(dashboardData.dailyGoal.percentage * 100)}%
              </Heading>
            </View>
          </View>
        </Row>
      </Card>

        {/* Recently Finished Books */}
        {dashboardData.recentFinishedBooks.length > 0 && (
          <Card>
            <Row justify="between">
              <Heading level={3}>Recently Finished</Heading>
              <Paragraph secondary small>View All</Paragraph>
            </Row>
            
            {dashboardData.recentFinishedBooks.map((item, index) => (
              <TouchableOpacity 
                key={item.bookRecord.isbn}
                onPress={() => openBookDetail(item.bookRecord)}
              >
                <View>
                  <Row style={{ marginTop: index > 0 ? spacing.md : spacing.md }}>
                    <View style={{ 
                      width: 50, 
                      height: 70, 
                      backgroundColor: colors.border, 
                      marginRight: spacing.md, 
                      borderRadius: radius.sm 
                    }}>
                      <Image 
                        source={{ uri: item.bookRecord.cover }} 
                        style={{
                          width: '100%',
                          height: '100%'
                        }}
                        resizeMode="cover"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Heading level={4}>{item.bookRecord.title}</Heading>
                      <Paragraph secondary>{item.bookRecord.author}</Paragraph>
                      <Row style={{ marginTop: spacing.xs, alignItems: 'center' }}>
                        <StatusBadge status="finished" style={{ marginRight: spacing.sm }} />
                        <Paragraph small secondary>Finished {item.lastRead}</Paragraph>
                      </Row>
                    </View>
                  </Row>
                  {index < dashboardData.recentFinishedBooks.length - 1 && <Divider />}
                </View>
              </TouchableOpacity>
            ))}
          </Card>
        )}

        {/* Weekly Reading Streak */}
        <Card>
          <Heading level={3}>Weekly Reading Activity</Heading>
          <View style={{ marginTop: spacing.md }}>
            <LineChart
              data={weeklyData}
              width={screenWidth - spacing.md * 4}
              height={180}
              chartConfig={{
                backgroundGradientFrom: colors.card,
                backgroundGradientTo: colors.card,
                color: (opacity = 1) => {
                  try {
                    const hexMatch = colors.primary.replace('#', '').match(/.{1,2}/g);
                    if (hexMatch) {
                      return `rgba(${hexMatch.map(hex => parseInt(hex, 16)).join(',')}, ${opacity})`;
                    }
                    return `rgba(45, 55, 72, ${opacity})`;
                  } catch (e) {
                    return `rgba(45, 55, 72, ${opacity})`;
                  }
                },
                decimalPlaces: 0,
                labelColor: (opacity = 1) => colors.text,
                propsForLabels: {
                  fontSize: 12,
                },
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          </View>
          <Paragraph secondary style={{ textAlign: 'center' }}>Pages read this week</Paragraph>
        </Card>

        {/* Reading Insights */}
        <Heading level={2} style={{ marginTop: spacing.md }}>Reading Insights</Heading>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
          {dashboardData.readingInsights.map((insight, index) => (
            <Card key={index} style={{ width: 200, marginRight: index < dashboardData.readingInsights.length - 1 ? spacing.md : 0 }}>
              <Ionicons name={`${insight.icon}-outline` as any} size={24} color={colors.primary} />
              <Heading level={4} style={{ marginTop: spacing.sm }}>{insight.title}</Heading>
              <Paragraph>{insight.description}</Paragraph>
            </Card>
          ))}
        </ScrollView>

        {/* Recommended Books */}
        <Card>
          <Row justify="between">
            <Heading level={3}>Recommended For You</Heading>
            <Paragraph secondary small>View All</Paragraph>
          </Row>
          
          {dashboardData.recommendedBooks.map((item, index) => (
            <TouchableOpacity 
              key={item.bookRecord.isbn}
              onPress={() => openBookDetail(item.bookRecord)}
            >
              <View>
                <Row style={{ marginTop: index > 0 ? spacing.md : spacing.md }}>
                  <View style={{ 
                    width: 50, 
                    height: 70, 
                    backgroundColor: colors.border, 
                    marginRight: spacing.md, 
                    borderRadius: radius.sm 
                  }}>
                    <Image 
                        source={{ uri: item.bookRecord.cover }} 
                        style={{
                          width: '100%',
                          height: '100%'
                        }}
                        resizeMode="cover"
                      />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Heading level={4}>{item.bookRecord.title}</Heading>
                    <Paragraph secondary>{item.bookRecord.author}</Paragraph>
                    <Row style={{ marginTop: spacing.xs }}>
                      <Badge 
                        title={item.bookRecord.genre} 
                        type="info" 
                        style={{ marginRight: spacing.xs }} 
                      />
                      <Paragraph small secondary>{item.reason}</Paragraph>
                    </Row>
                  </View>
                </Row>
                {index < dashboardData.recommendedBooks.length - 1 && <Divider />}
              </View>
            </TouchableOpacity>
          ))}
        </Card>

        {/* Book Detail Modal */}
        {selectedBook && (
          <BookDetailModal
            visible={modalVisible}
            onClose={closeBookDetail}
            book={selectedBook}
            isInLibrary={true}
            onUpdateProgress={(newPage) => updateBookProgress(selectedBook.isbn, newPage)}
            onRemoveRecord={removeBookFromLibrary}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}