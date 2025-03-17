import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default function TabLibrary() {
	// Step 2: Add State to Track Selected Tab
	const [selectedTab, setSelectedTab] = useState('Finished');

	return (
		<View style={styles.container}>
			{/* Header Section */}
			<View style={styles.header}>
				<Text style={styles.headerTitle}>Projects</Text>
				<FontAwesome name="search" size={20} color="black" />
			</View>

			{/* Step 3: Segmented Control for Tabs */}
			<View style={styles.tabContainer}>
				{['To do', 'In progress', 'Finished'].map((tab) => (
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

			{/* Step 4: Empty State Message */}
			<View style={styles.emptyState}>
				<Image
					source={{ uri: 'https://via.placeholder.com/100' }} // Replace with actual image URL
					style={styles.image}
				/>
				<Text style={styles.emptyTitle}>Nothing here. For now.</Text>
				<Text style={styles.emptyDescription}>
					This is where you'll find your finished projects.
				</Text>
				<TouchableOpacity style={styles.startButton}>
					<Text style={styles.startButtonText}>Start a project</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

// Step 5: Add Styles
const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		padding: 20,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 20,
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: 'bold',
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
	emptyState: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	image: {
		width: 80,
		height: 80,
		marginBottom: 20,
		opacity: 0.5,
	},
	emptyTitle: {
		fontSize: 16,
		fontWeight: 'bold',
		marginBottom: 5,
	},
	emptyDescription: {
		color: '#6B7280',
		textAlign: 'center',
		paddingHorizontal: 40,
		marginBottom: 20,
	},
	startButton: {
		backgroundColor: '#1E40AF',
		paddingHorizontal: 20,
		paddingVertical: 10,
		borderRadius: 20,
	},
	startButtonText: {
		color: 'white',
		fontWeight: 'bold',
	},
});
