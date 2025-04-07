import React, { useState } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	FlatList,
	ScrollView,
	Image,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const dummyBooks = [
	{ id: '1', title: 'Book A', author: 'Author', type: 'favorite' },
	{ id: '2', title: 'Book B', author: 'Author', type: 'favorite' },
	{ id: '3', title: 'Book C', author: 'Author', type: 'bookmarked' },
	{ id: '4', title: 'Book D', author: 'Author', type: 'bookmarked' },
	{ id: '5', title: 'Book E', author: 'Author', type: 'all' },
	{ id: '6', title: 'Book F', author: 'Author', type: 'all' },
];

export default function TabLibrary() {
	const [selectedTab, setSelectedTab] = useState('Finished');

	const renderCard = ({ item }: any) => (
		<View style={styles.bookCard}>
			<View style={styles.bookImagePlaceholder} />
			<Text style={styles.bookTitle}>{item.title}</Text>
			<Text style={styles.bookAuthor}>{item.author}</Text>
			<TouchableOpacity style={styles.detailButton}>
				<Text style={styles.detailButtonText}>Details</Text>
			</TouchableOpacity>
		</View>
	);

	const renderListItem = ({ item }: any) => (
		<TouchableOpacity style={styles.listItem}>
			<View style={styles.listImagePlaceholder} />
			<View>
				<Text style={styles.bookTitle}>{item.title}</Text>
				<Text style={styles.bookAuthor}>{item.author}</Text>
			</View>
		</TouchableOpacity>
	);

	return (
		<View style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<FontAwesome name="search" size={20} color="black" />
			</View>

			{/* Tabs */}
			<View style={styles.tabContainer}>
				{['To read', 'In progress', 'Finished'].map((tab) => (
					<TouchableOpacity
						key={tab}
						onPress={() => setSelectedTab(tab)}
						style={[
							styles.tabButton,
							selectedTab === tab && styles.activeTabButton,
						]}
					>
						<Text
							style={[
								styles.tabText,
								selectedTab === tab && styles.activeTabText,
							]}
						>
							{tab}
						</Text>
					</TouchableOpacity>
				))}
			</View>

			{/* Content */}
			<ScrollView>
				{/* Favorites */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>Favorites</Text>
						<Text style={styles.seeMore}>See more</Text>
					</View>
					<FlatList
						horizontal
						data={dummyBooks.filter((b) => b.type === 'favorite')}
						renderItem={renderCard}
						keyExtractor={(item) => item.id}
						showsHorizontalScrollIndicator={false}
					/>
				</View>

				{/* Bookmarked */}
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Bookmarked</Text>
					<FlatList
						data={dummyBooks.filter((b) => b.type === 'bookmarked')}
						renderItem={renderListItem}
						keyExtractor={(item) => item.id}
						scrollEnabled={false}
					/>
				</View>

				{/* All Books */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Text style={styles.sectionTitle}>All Books</Text>
						<Text style={styles.seeMore}>See more</Text>
					</View>
					<FlatList
						horizontal
						data={dummyBooks.filter((b) => b.type === 'all')}
						renderItem={renderCard}
						keyExtractor={(item) => item.id}
						showsHorizontalScrollIndicator={false}
					/>
				</View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		paddingTop: 50,
		paddingHorizontal: 20,
	},
	header: {
		alignItems: 'flex-end',
		marginBottom: 10,
	},
	tabContainer: {
		flexDirection: 'row',
		backgroundColor: '#E5E7EB',
		borderRadius: 10,
		padding: 5,
		marginBottom: 20,
	},
	tabButton: {
		flex: 1,
		paddingVertical: 8,
		alignItems: 'center',
		borderRadius: 10,
	},
	activeTabButton: {
		backgroundColor: '#1E40AF',
	},
	tabText: {
		color: '#6B7280',
		fontWeight: '500',
	},
	activeTabText: {
		color: 'white',
	},
	section: {
		marginBottom: 20,
	},
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 10,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: 'bold',
	},
	seeMore: {
		color: '#1E40AF',
		fontWeight: '500',
	},
	bookCard: {
		width: 140,
		backgroundColor: '#F3F4F6',
		borderRadius: 10,
		padding: 10,
		marginRight: 10,
		alignItems: 'center',
	},
	bookImagePlaceholder: {
		width: '100%',
		height: 80,
		backgroundColor: '#E5E7EB',
		borderRadius: 10,
		marginBottom: 10,
	},
	bookTitle: {
		fontWeight: 'bold',
		marginBottom: 2,
	},
	bookAuthor: {
		color: '#6B7280',
		marginBottom: 5,
	},
	detailButton: {
		borderWidth: 1,
		borderColor: '#1E40AF',
		borderRadius: 10,
		paddingHorizontal: 10,
		paddingVertical: 5,
	},
	detailButtonText: {
		color: '#1E40AF',
		fontSize: 12,
	},
	listItem: {
		flexDirection: 'row',
		backgroundColor: '#F9FAFB',
		padding: 10,
		borderRadius: 10,
		marginBottom: 10,
		alignItems: 'center',
	},
	listImagePlaceholder: {
		width: 40,
		height: 40,
		backgroundColor: '#E5E7EB',
		borderRadius: 5,
		marginRight: 10,
	},
});
