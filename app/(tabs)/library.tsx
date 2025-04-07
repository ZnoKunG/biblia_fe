import React, { useState } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Modal,
	TextInput,
	FlatList,
	ScrollView,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const STATUS_OPTIONS = ['To read', 'In progress', 'Completed'];

export default function TabLibrary() {
	const [selectedTab, setSelectedTab] = useState('Completed');
	const [modalVisible, setModalVisible] = useState(false);
	const [modalStep, setModalStep] = useState(1);
	const [selectedOption, setSelectedOption] = useState<string | null>(null);
	const [title, setTitle] = useState('');
	const [author, setAuthor] = useState('');
	const [genre, setGenre] = useState('');
	const [status, setStatus] = useState('To read');
	const [books, setBooks] = useState<any[]>([]);

	const handleContinue = () => {
		if (selectedOption) setModalStep(2);
	};

	const handleSubmit = () => {
		const newBook = {
			id: Date.now().toString(),
			title,
			author,
			genre,
			status,
		};
		setBooks([...books, newBook]);
		setModalVisible(false);
		resetModal();
	};

	const resetModal = () => {
		setModalStep(1);
		setSelectedOption(null);
		setTitle('');
		setAuthor('');
		setGenre('');
		setStatus('To read');
	};

	const renderCard = ({ item }: any) => (
		<View style={styles.bookCard}>
			<View style={styles.bookImage} />
			<Text style={styles.bookTitle}>{item.title}</Text>
			<Text style={styles.bookAuthor}>{item.author}</Text>
			<TouchableOpacity style={styles.detailsButton}>
				<Text style={styles.detailsButtonText}>Details</Text>
			</TouchableOpacity>
		</View>
	);

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.headerTitle}>Library</Text>
				<FontAwesome name="search" size={20} color="black" />
			</View>

			<View style={styles.tabContainer}>
				{STATUS_OPTIONS.map((tab) => (
					<TouchableOpacity
						key={tab}
						onPress={() => setSelectedTab(tab)}
						style={[styles.tabButton, selectedTab === tab && styles.activeTab]}
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

			{books.length === 0 ? (
				<View style={styles.emptyState}>
					<Text style={styles.emptyTitle}>Nothing here. For now.</Text>
					<Text>This is where you'll find your reading list.</Text>
					<TouchableOpacity
						style={styles.addButton}
						onPress={() => setModalVisible(true)}
					>
						<Text style={styles.addButtonText}>Add a new book</Text>
					</TouchableOpacity>
				</View>
			) : (
				<ScrollView>
					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Favorites</Text>
						<FlatList
							horizontal
							data={books.slice(0, 2)}
							renderItem={renderCard}
							keyExtractor={(item) => item.id}
							showsHorizontalScrollIndicator={false}
						/>
					</View>

					<View style={styles.section}>
						<Text style={styles.sectionTitle}>Bookmarked</Text>
						{books.slice(2, 4).map((book) => (
							<View key={book.id} style={styles.bookmarkedCard}>
								<View style={styles.bookImageSmall} />
								<View>
									<Text style={styles.bookTitle}>{book.title}</Text>
									<Text>{book.author}</Text>
								</View>
							</View>
						))}
					</View>

					<View style={styles.section}>
						<Text style={styles.sectionTitle}>All Books</Text>
						<FlatList
							horizontal
							data={books}
							renderItem={renderCard}
							keyExtractor={(item) => item.id}
							showsHorizontalScrollIndicator={false}
						/>
					</View>
				</ScrollView>
			)}

			<Modal visible={modalVisible} transparent animationType="slide">
				<View style={styles.modalContainer}>
					<View style={styles.modalContent}>
						{modalStep === 1 ? (
							<>
								<Text style={styles.modalTitle}>Select an option</Text>
								<View style={styles.grid}>
									{new Array(6).fill(null).map((_, index) => (
										<TouchableOpacity
											key={index}
											style={[
												styles.optionBox,
												selectedOption === `Option ${index + 1}` &&
													styles.selectedBox,
											]}
											onPress={() => setSelectedOption(`Option ${index + 1}`)}
										>
											<Text>Option</Text>
										</TouchableOpacity>
									))}
								</View>
								<TouchableOpacity
									style={styles.continueButton}
									onPress={handleContinue}
								>
									<Text style={styles.continueText}>Continue</Text>
								</TouchableOpacity>
							</>
						) : (
							<>
								<TextInput
									placeholder="Title"
									value={title}
									onChangeText={setTitle}
									style={styles.input}
								/>
								<TextInput
									placeholder="Author"
									value={author}
									onChangeText={setAuthor}
									style={styles.input}
								/>
								<Text>Status</Text>
								<View style={styles.statusRow}>
									{STATUS_OPTIONS.map((option) => (
										<TouchableOpacity
											key={option}
											style={[
												styles.statusPill,
												status === option && styles.statusPillActive,
											]}
											onPress={() => setStatus(option)}
										>
											<Text
												style={{
													color: status === option ? 'white' : '#1E40AF',
												}}
											>
												{option}
											</Text>
										</TouchableOpacity>
									))}
								</View>
								<TextInput
									placeholder="Genre"
									value={genre}
									onChangeText={setGenre}
									style={styles.input}
								/>
								<TouchableOpacity
									style={styles.continueButton}
									onPress={handleSubmit}
								>
									<Text style={styles.continueText}>Submit</Text>
								</TouchableOpacity>
							</>
						)}
					</View>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#fff' },
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		padding: 20,
	},
	headerTitle: { fontSize: 20, fontWeight: 'bold' },
	tabContainer: {
		flexDirection: 'row',
		marginHorizontal: 20,
		backgroundColor: '#E5E7EB',
		borderRadius: 10,
	},
	tabButton: { flex: 1, padding: 10, alignItems: 'center' },
	tabText: { color: '#6B7280' },
	activeTab: { backgroundColor: '#1E40AF', borderRadius: 10 },
	activeTabText: { color: 'white', fontWeight: 'bold' },
	emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
	emptyTitle: { fontSize: 16, marginBottom: 8 },
	addButton: { backgroundColor: '#1E40AF', padding: 12, borderRadius: 20 },
	addButtonText: { color: 'white', fontWeight: 'bold' },
	section: { marginVertical: 10 },
	sectionTitle: {
		fontSize: 16,
		fontWeight: 'bold',
		marginHorizontal: 20,
		marginBottom: 8,
	},
	seeMore: { color: '#1E40AF', fontWeight: 'bold', marginHorizontal: 20 },
	bookCard: {
		width: 140,
		backgroundColor: '#F3F4F6',
		borderRadius: 10,
		padding: 10,
		marginHorizontal: 10,
	},
	bookImage: {
		height: 80,
		backgroundColor: '#E5E7EB',
		borderRadius: 10,
		marginBottom: 10,
	},
	bookImageSmall: {
		width: 40,
		height: 40,
		backgroundColor: '#E5E7EB',
		borderRadius: 5,
		marginRight: 10,
	},
	bookTitle: { fontWeight: 'bold' },
	bookAuthor: { color: '#6B7280' },
	detailsButton: {
		borderWidth: 1,
		borderColor: '#1E40AF',
		padding: 6,
		borderRadius: 10,
		marginTop: 6,
	},
	detailsButtonText: { color: '#1E40AF', textAlign: 'center' },
	bookmarkedCard: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 20,
		marginBottom: 10,
	},
	modalContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0,0,0,0.4)',
	},
	modalContent: {
		width: '85%',
		backgroundColor: '#fff',
		padding: 20,
		borderRadius: 10,
	},
	modalTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 10 },
	grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
	optionBox: {
		width: '30%',
		padding: 10,
		margin: 5,
		backgroundColor: '#E5E7EB',
		borderRadius: 8,
		alignItems: 'center',
	},
	selectedBox: { backgroundColor: '#1E40AF' },
	continueButton: {
		backgroundColor: '#1E40AF',
		padding: 12,
		borderRadius: 10,
		marginTop: 20,
		alignItems: 'center',
	},
	continueText: { color: 'white', fontWeight: 'bold' },
	input: {
		borderWidth: 1,
		borderColor: '#ccc',
		padding: 10,
		marginVertical: 8,
		borderRadius: 8,
	},
	statusRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginVertical: 10,
	},
	statusPill: {
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderRadius: 20,
		backgroundColor: '#E5E7EB',
	},
	statusPillActive: { backgroundColor: '#1E40AF' },
});
