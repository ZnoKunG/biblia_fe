// interfaces/book.interface.ts
export interface Book {
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

export interface BookRecord extends Book {
  userID: number;
  status: 'to read' | 'in progress' | 'finished';
  currentPage: number;
  dateAdded: string;
}

export interface RecordFormData extends Book {
  userID: number;
  status: 'to read' | 'in progress' | 'finished';
  currentPage: number;
}