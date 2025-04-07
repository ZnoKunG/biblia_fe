// app/(tabs)/home.tsx
import React, { useState, useEffect } from 'react';
import { View, ScrollView, Dimensions, SafeAreaView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PieChart, LineChart } from 'react-native-chart-kit';
import { chartConfig, spacing } from '../styles/defaultStyles';
import { Card, Heading, Paragraph, Row, StatusBadge, Divider, LoadingIndicator } from '../styles/defaultComponents';
import { useTheme } from '../styles/themeContext';

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

export default function HomePage(): JSX.Element {
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const { baseStyles, colors } = useTheme();

  // Mock data - in a real app, you would fetch this from your backend/database
  const mockStats: Stats = {
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
      { name: 'Fiction', count: 18, color: colors.primary },
      { name: 'Non-Fiction', count: 12, color: colors.secondary },
      { name: 'Science', count: 6, color: colors.accent },
      { name: 'History', count: 4, color: colors.info },
      { name: 'Other', count: 2, color: colors.success },
    ],
    recentActivity: [
      { title: 'Started reading "Project Hail Mary"', date: '2 days ago' },
      { title: 'Finished "Atomic Habits"', date: '5 days ago' },
      { title: 'Added "Dune" to library', date: '1 week ago' },
    ],
  };

  // Simulate data fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      setStats(mockStats);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
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