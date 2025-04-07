
// Define interfaces for our data structures
interface BookRecord {
    id: string;
    title: string;
    author: string;
    cover: string;
    genre: string;
    status: 'to read' | 'in progress' | 'finished';
    currentPage: number;
    totalPages: number;
    dateAdded: string;
  }
  
  interface RecordFormData {
    title: string;
    author: string;
    isbn: string;
    cover: string;
    genre: string;
    status: 'to read' | 'in progress' | 'finished';
    currentPage: number;
    totalPages: number;
  }