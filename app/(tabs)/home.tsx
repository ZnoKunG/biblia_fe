// app/(tabs)/home.tsx
import React, { useState, useEffect } from 'react';
import { View, ScrollView, Dimensions, SafeAreaView, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PieChart, LineChart } from 'react-native-chart-kit';
import { chartConfig, spacing } from '../styles/defaultStyles';
import { Card, Heading, Paragraph, Row, StatusBadge, Divider, LoadingIndicator } from '../styles/defaultComponents';
import { useTheme } from '../styles/themeContext';
import { getCurrentUserID } from '../services/authService';
import { Get, GetWithQueryParams } from '@/services/serviceProvider';
import { useFocusEffect } from 'expo-router';

const screenWidth = Dimensions.get('window').width;

interface StatusCounts {
  toRead: number;
  inProgress: number;
  finished: number;
}

interface GenreDistribution {
  name: string;
  count: number;
  color: string;
}

interface RecentActivity {
  title: string;
  date: string;
}

interface Stats {
  statusCounts: StatusCounts;
  totalBooks: number;
  pagesRead: number;
  averageRating: number;
  monthlyReads: number[];
  genreDistribution: GenreDistribution[];
  recentActivity: RecentActivity[];
}

interface StatusChartData {
  name: string;
  population: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

interface GenreChartData {
  name: string;
  population: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

interface BookRecord {
  ID: number;
  userID: number;
  isbn: string;
  title: string;
  author: string;
  cover: string;
  genre: string;
  status: string;
  currentPage: number;
  totalPages: number;
  dateAdded: string;
  User: {
    id: number;
    username: string;
    password: string;
    favorite_genres: null | string[];
    records: null | any[];
  };
}

export default function HomePage(): JSX.Element {
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const { baseStyles, colors } = useTheme();

  // Function to get a color based on genre rank
  const getColorByRank = (rank: number): string => {
    const rankColors = [
      '#F59E0B',   // 1st place - Gold/Amber
      '#6366F1',   // 2nd place - Indigo/Silver
      '#10B981',   // 3rd place - Emerald/Bronze
      '#EC4899',   // 4th place - Pink
      '#8B5CF6',   // 5th place - Purple
      '#64748B',   // Others - Slate
    ];
    
    return rankColors[rank] || '#6B7280'; // Default to gray if rank out of bounds
  };

  // Function to format relative time
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

  // Function to transform API data into Stats format
  const transformApiDataToStats = (records: BookRecord[]): Stats => {
    // Count books by status
    const statusCounts: StatusCounts = {
      toRead: 0,
      inProgress: 0,
      finished: 0
    };

    records.forEach(book => {
      const status = book.status.toLowerCase();
      if (status === "to read") {
        statusCounts.toRead++;
      } else if (status === "in progress") {
        statusCounts.inProgress++;
      } else if (status === "finished") {
        statusCounts.finished++;
      }
    });

    // Calculate total books
    const totalBooks = records.length;

    // Calculate pages read (assuming currentPage represents pages read)
    const pagesRead = records.reduce((total, book) => total + book.currentPage, 0);

    // Group books by genre and count
    const genreCounts: { [key: string]: number } = {};
    records.forEach(book => {
      const genre = book.genre;
      if (genreCounts[genre]) {
        genreCounts[genre]++;
      } else {
        genreCounts[genre] = 1;
      }
    });

    // Sort genres by count (descending) to find top 5
    const sortedGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);
    
    // Take top 5 genres, combine the rest into "Others"
    const topGenres = sortedGenres.slice(0, 5);
    const otherGenresCount = sortedGenres.slice(5).reduce((total, [_, count]) => total + count, 0);
    
    // Create genre distribution data with top 5 + Others
    const genreDistribution: GenreDistribution[] = topGenres.map(([name, count], index) => ({
      name,
      count,
      color: getColorByRank(index)
    }));
    
    // Add "Others" category if there are more than 5 genres
    if (otherGenresCount > 0) {
      genreDistribution.push({
        name: 'Others',
        count: otherGenresCount,
        color: getColorByRank(5)
      });
    }

    // Create recent activity from most recently added books
    const recentActivity: RecentActivity[] = records
      .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
      .slice(0, 3)
      .map(book => ({
        title: `Added "${book.title}" to library`,
        date: getRelativeTimeString(book.dateAdded)
      }));

    // For now, we'll use placeholder data for monthly reads and average rating
    // In a real app, you would calculate these from actual data
    const monthlyReads = [2, 3, 4, 2, 5, 3]; // Last 6 months
    const averageRating = 4.2; // Placeholder

    return {
      statusCounts,
      totalBooks,
      pagesRead,
      averageRating,
      monthlyReads,
      genreDistribution,
      recentActivity
    };
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
        const transformedStats = transformApiDataToStats(apiResp.data);
        setStats(transformedStats);
      } else {
        throw new Error(apiResp.message || 'Failed to fetch data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to load your reading stats. Please try again later.');
      
      // Fall back to mock data in case of error
      const mockStats = getMockStats();
      setStats(mockStats);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Get mock data as fallback
  const getMockStats = (): Stats => {
    return {
      statusCounts: {
        toRead: 12,
        inProgress: 3,
        finished: 27,
      },
      totalBooks: 42,
      pagesRead: 9876,
      averageRating: 4.2,
      monthlyReads: [2, 3, 4, 2, 5, 3], // Last 6 months
      genreDistribution: [
        { name: 'Science Fiction', count: 10, color: getColorByRank(0) },
        { name: 'Fantasy', count: 8, color: getColorByRank(1) },
        { name: 'Mystery', count: 7, color: getColorByRank(2) },
        { name: 'Classic', count: 6, color: getColorByRank(3) },
        { name: 'Historical Fiction', count: 5, color: getColorByRank(4) },
        { name: 'Others', count: 6, color: getColorByRank(5) },
      ],
      recentActivity: [
        { title: 'Started reading "Project Hail Mary"', date: '2 days ago' },
        { title: 'Finished "Atomic Habits"', date: '5 days ago' },
        { title: 'Added "Dune" to library', date: '1 week ago' },
      ],
    };
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

  if (loading) {
    return <LoadingIndicator />;
  }

  // Ensure stats is not null before proceeding
  if (!stats) {
    return <LoadingIndicator />;
  }

  // Prepare chart data for reading status
  const statusData: StatusChartData[] = [
    {
      name: 'To Read',
      population: stats.statusCounts.toRead,
      color: colors.info,
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
    {
      name: 'In Progress',
      population: stats.statusCounts.inProgress,
      color: colors.warning,
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
    {
      name: 'Finished',
      population: stats.statusCounts.finished,
      color: colors.success,
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
  ];

  // Prepare chart data for monthly reads
  const monthlyData = {
    labels: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
    datasets: [
      {
        data: stats.monthlyReads,
        color: (opacity = 1) => {
          // Type assertion to ensure we have a string
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

  // Prepare chart data for genre distribution
  const genreData: GenreChartData[] = stats.genreDistribution.map(genre => ({
    name: genre.name,
    population: genre.count,
    color: genre.color,
    legendFontColor: colors.text,
    legendFontSize: 12,
  }));

  return (
    <SafeAreaView style={baseStyles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <Heading level={1}>Your Reading Stats</Heading>

        <Card>
          <Heading level={3}>Reading Status</Heading>
          <View style={{ alignItems: 'center', marginTop: spacing.md }}>
            <PieChart
              data={statusData}
              width={screenWidth - spacing.md * 4}
              height={200}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              center={[10, 0]}
              absolute
            />
          </View>
          <Divider />
          <Row justify="between">
            <View style={{ alignItems: 'center' }}>
              <Heading level={4}>{stats.statusCounts.toRead}</Heading>
              <Paragraph secondary>To Read</Paragraph>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Heading level={4}>{stats.statusCounts.inProgress}</Heading>
              <Paragraph secondary>In Progress</Paragraph>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Heading level={4}>{stats.statusCounts.finished}</Heading>
              <Paragraph secondary>Finished</Paragraph>
            </View>
          </Row>
        </Card>

        <Row>
          <Card style={{ flex: 1, marginRight: spacing.sm }}>
            <Ionicons name="book-outline" size={24} color={colors.primary} />
            <Heading level={3}>{stats.totalBooks}</Heading>
            <Paragraph secondary>Total Books</Paragraph>
          </Card>
          <Card style={{ flex: 1, marginLeft: spacing.sm }}>
            <Ionicons name="document-text-outline" size={24} color={colors.primary} />
            <Heading level={3}>{stats.pagesRead}</Heading>
            <Paragraph secondary>Pages Read</Paragraph>
          </Card>
        </Row>

        <Card>
          <Heading level={3}>Monthly Reading</Heading>
          <View style={{ marginTop: spacing.md }}>
            <LineChart
              data={monthlyData}
              width={screenWidth - spacing.md * 4}
              height={220}
              chartConfig={{
                ...chartConfig,
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
          <Paragraph secondary style={{ textAlign: 'center' }}>Books completed per month</Paragraph>
        </Card>

        <Card>
          <Heading level={3}>Genre Distribution</Heading>
          <View style={{ alignItems: 'center', marginTop: spacing.md }}>
            <PieChart
              data={genreData}
              width={screenWidth - spacing.md * 4}
              height={200}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              center={[10, 0]}
              absolute
            />
          </View>
        </Card>

        <Card>
          <Row justify="between">
            <Heading level={3}>Recent Activity</Heading>
            <Paragraph secondary small>View All</Paragraph>
          </Row>
          {stats.recentActivity.map((activity, index) => (
            <View key={index}>
              <Row style={{ marginTop: spacing.md }}>
                <Ionicons name="time-outline" size={16} color={colors.textSecondary} style={{ marginRight: spacing.sm }} />
                <View>
                  <Paragraph>{activity.title}</Paragraph>
                  <Paragraph secondary small>{activity.date}</Paragraph>
                </View>
              </Row>
              {index < stats.recentActivity.length - 1 && <Divider />}
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}