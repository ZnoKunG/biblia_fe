// interfaces/book.interface.ts
interface Book {
  isbn: string;
  title: string;
  author: string;
  cover: string;
  genre: string;
  rating: number;
  year: number;
  totalPages: number;
  description?: string;
}

interface BookRecord extends Book {
  userID: number;
  status: 'to read' | 'in progress' | 'finished';
  currentPage: number;
  dateAdded: string;
}

interface RecordFormData extends Book {
  userID: number;
  status: 'to read' | 'in progress' | 'finished';
  currentPage: number;
}