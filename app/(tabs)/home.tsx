import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TabHome() {
	return (
		<View style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<Text style={styles.title}>Home</Text>
				<Ionicons name="search-outline" size={24} color="black" />
			</View>

			{/* Widget Containers */}
			<View style={styles.widgetContainer} />
			<View style={styles.widgetContainer} />

			{/* Add Widget Button */}
			<TouchableOpacity style={styles.addButton}>
				<Text style={styles.addButtonText}>Add a new widget</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 50,
		paddingHorizontal: 20,
		backgroundColor: '#fff',
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 20,
	},
	title: {
		fontSize: 20,
		fontWeight: 'bold',
	},
	widgetContainer: {
		height: 150,
		backgroundColor: '#fff',
		borderRadius: 10,
		borderWidth: 1,
		borderColor: '#E0E0E0',
		marginBottom: 20,
	},
	addButton: {
		backgroundColor: '#007AFF',
		paddingVertical: 12,
		alignItems: 'center',
		borderRadius: 8,
	},
	addButtonText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: 'bold',
	},
});
