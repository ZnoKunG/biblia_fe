import { Book, BookRecord } from "@/models/book.model";

export const mockBooks: Book[] = [
  {
    isbn: '9781451673319',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    cover: 'https://covers.openlibrary.org/b/id/8850155-L.jpg',
    genre: 'Fiction',
    rating: 4.3,
    year: 1925,
    totalPages: 180,
    description: 'Set in the Jazz Age, it tells the story of the mysterious millionaire Jay Gatsby and his obsession with the beautiful Daisy Buchanan.'
  },
  {
    isbn: '9780061120084',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    cover: 'https://covers.openlibrary.org/b/id/8761543-L.jpg',
    genre: 'Fiction',
    rating: 4.5,
    year: 1960,
    totalPages: 336,
    description: 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.'
  },
  {
    isbn: '9780142437247',
    title: '1984',
    author: 'George Orwell',
    cover: 'https://covers.openlibrary.org/b/id/8575471-L.jpg',
    genre: 'Science Fiction',
    rating: 4.3,
    year: 1949,
    totalPages: 328,
    description: 'A dystopian novel set in a totalitarian regime where government surveillance and public manipulation are rampant.'
  },
  {
    isbn: '9780307474278',
    title: 'The Da Vinci Code',
    author: 'Dan Brown',
    cover: 'https://covers.openlibrary.org/b/id/8701747-L.jpg',
    genre: 'Thriller',
    rating: 3.8,
    year: 2003,
    totalPages: 597,
    description: 'A murder in Paris\'s Louvre Museum and cryptic clues in some of Leonardo da Vinci\'s most famous paintings lead to the discovery of a religious mystery.'
  },
  {
    isbn: '9780618260300',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    cover: 'https://covers.openlibrary.org/b/id/8408452-L.jpg',
    genre: 'Fantasy',
    rating: 4.7,
    year: 1937,
    totalPages: 366,
    description: 'The adventure of Bilbo Baggins, a hobbit who embarks on an unexpected journey there and back again.'
  },
  {
    isbn: '9780060558126',
    title: 'The Kite Runner',
    author: 'Khaled Hosseini',
    cover: 'https://covers.openlibrary.org/b/id/8236645-L.jpg',
    genre: 'Fiction',
    rating: 4.4,
    year: 2003,
    totalPages: 371,
    description: 'The story of Amir, a boy from the Wazir Akbar Khan district of Kabul, and his journey of redemption.'
  },
  {
    isbn: '9780553418026',
    title: 'The Martian',
    author: 'Andy Weir',
    cover: 'https://covers.openlibrary.org/b/id/8750156-L.jpg',
    genre: 'Science Fiction',
    rating: 4.5,
    year: 2011,
    totalPages: 387,
    description: 'An astronaut becomes stranded on Mars after his team assume him dead, and must rely on his ingenuity to find a way to signal to Earth that he is alive.'
  },
  {
    isbn: '9780307474278',
    title: 'Angels & Demons',
    author: 'Dan Brown',
    cover: 'https://covers.openlibrary.org/b/id/8701746-L.jpg',
    genre: 'Thriller',
    rating: 3.9,
    year: 2000,
    totalPages: 616,
    description: 'Harvard symbologist Robert Langdon works to solve a murder and prevent a terrorist act against the Vatican.'
  },
  {
    isbn: '9780060575632',
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    cover: 'https://covers.openlibrary.org/b/id/8474158-L.jpg',
    genre: 'History',
    rating: 4.6,
    year: 2011,
    totalPages: 443,
    description: 'A sweeping narrative of human evolution and how we got to where we are today.'
  },
  {
    isbn: '9780399255748',
    title: 'The Fault in Our Stars',
    author: 'John Green',
    cover: 'https://covers.openlibrary.org/b/id/7890912-L.jpg',
    genre: 'Young Adult',
    rating: 4.2,
    year: 2012,
    totalPages: 313,
    description: 'A heartbreaking story about two teenagers who fall in love after meeting at a cancer support group.'
  },
  {
    isbn: '9781449337711',
    title: 'JavaScript: The Good Parts',
    author: 'Douglas Crockford',
    cover: 'https://covers.openlibrary.org/b/id/8739161-L.jpg',
    genre: 'Technology',
    rating: 4.5,
    year: 2008,
    totalPages: 176,
    description: 'A book that reveals the excellent parts of JavaScript, a language mired in confusion.'
  },
  {
    isbn: '9780439358071',
    title: 'Harry Potter and the Order of the Phoenix',
    author: 'J.K. Rowling',
    cover: 'https://covers.openlibrary.org/b/id/8471758-L.jpg',
    genre: 'Fantasy',
    rating: 4.7,
    year: 2003,
    totalPages: 870,
    description: 'Harry faces a wizard who threatens to destroy the wizarding world.'
  },
  {
    isbn: '9780812988406',
    title: 'Educated',
    author: 'Tara Westover',
    cover: 'https://covers.openlibrary.org/b/id/8700476-L.jpg',
    genre: 'Memoir',
    rating: 4.7,
    year: 2018,
    totalPages: 352,
    description: 'A memoir about a girl who, kept out of school, leaves her survivalist family and goes on to earn a PhD from Cambridge University.'
  },
  {
    isbn: '9780553479225',
    title: 'The Hunger Games',
    author: 'Suzanne Collins',
    cover: 'https://covers.openlibrary.org/b/id/8667538-L.jpg',
    genre: 'Young Adult',
    rating: 4.3,
    year: 2008,
    totalPages: 374,
    description: 'In a dystopian future, children are forced to fight to the death in a televised survival competition.'
  },
  {
    isbn: '9780679785897',
    title: 'Brave New World',
    author: 'Aldous Huxley',
    cover: 'https://covers.openlibrary.org/b/id/8231991-L.jpg',
    genre: 'Science Fiction',
    rating: 4.1,
    year: 1932,
    totalPages: 268,
    description: 'A dystopian novel written in 1931 that anticipates developments in reproductive technology and sleep-learning that combine to change society.'
  }
];

/**
 * Mock book records data for testing and development
 * (includes user-specific data like status and progress)
 */
export const mockRecords: BookRecord[] = [
  {
    userID: 1,
    isbn: '9781451673319',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    cover: 'https://covers.openlibrary.org/b/id/8850155-L.jpg',
    genre: 'Fiction',
    rating: 4.3,
    year: 1925,
    totalPages: 180,
    description: 'Set in the Jazz Age, it tells the story of the mysterious millionaire Jay Gatsby and his obsession with the beautiful Daisy Buchanan.',
    status: 'finished',
    currentPage: 180,
    dateAdded: '2023-09-15T10:30:00Z'
  },
  {
    userID: 1,
    isbn: '9780061120084',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    cover: 'https://covers.openlibrary.org/b/id/8761543-L.jpg',
    genre: 'Fiction',
    rating: 4.5,
    year: 1960,
    totalPages: 336,
    description: 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it.',
    status: 'in progress',
    currentPage: 156,
    dateAdded: '2023-10-02T14:22:00Z'
  },
  {
    userID: 1,
    isbn: '9780142437247',
    title: '1984',
    author: 'George Orwell',
    cover: 'https://covers.openlibrary.org/b/id/8575471-L.jpg',
    genre: 'Science Fiction',
    rating: 4.3,
    year: 1949,
    totalPages: 328,
    description: 'A dystopian novel set in a totalitarian regime where government surveillance and public manipulation are rampant.',
    status: 'to read',
    currentPage: 0,
    dateAdded: '2023-11-05T08:45:00Z'
  },
  {
    userID: 1,
    isbn: '9780618260300',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    cover: 'https://covers.openlibrary.org/b/id/8408452-L.jpg',
    genre: 'Fantasy',
    rating: 4.7,
    year: 1937,
    totalPages: 366,
    description: 'The adventure of Bilbo Baggins, a hobbit who embarks on an unexpected journey there and back again.',
    status: 'in progress',
    currentPage: 250,
    dateAdded: '2023-08-22T16:15:00Z'
  },
  {
    userID: 1,
    isbn: '9780553418026',
    title: 'The Martian',
    author: 'Andy Weir',
    cover: 'https://covers.openlibrary.org/b/id/8750156-L.jpg',
    genre: 'Science Fiction',
    rating: 4.5,
    year: 2011,
    totalPages: 387,
    description: 'An astronaut becomes stranded on Mars after his team assume him dead, and must rely on his ingenuity to find a way to signal to Earth that he is alive.',
    status: 'to read',
    currentPage: 0,
    dateAdded: '2023-11-15T12:30:00Z'
  },
  {
    userID: 2, // Different user
    isbn: '9780060558126',
    title: 'The Kite Runner',
    author: 'Khaled Hosseini',
    cover: 'https://covers.openlibrary.org/b/id/8236645-L.jpg',
    genre: 'Fiction',
    rating: 4.4,
    year: 2003,
    totalPages: 371,
    description: 'The story of Amir, a boy from the Wazir Akbar Khan district of Kabul, and his journey of redemption.',
    status: 'finished',
    currentPage: 371,
    dateAdded: '2023-09-10T09:15:00Z'
  },
  {
    userID: 2, // Different user
    isbn: '9780399255748',
    title: 'The Fault in Our Stars',
    author: 'John Green',
    cover: 'https://covers.openlibrary.org/b/id/7890912-L.jpg',
    genre: 'Young Adult',
    rating: 4.2,
    year: 2012,
    totalPages: 313,
    description: 'A heartbreaking story about two teenagers who fall in love after meeting at a cancer support group.',
    status: 'in progress',
    currentPage: 211,
    dateAdded: '2023-10-22T11:45:00Z'
  }
];

/**
 * Function to get books for a specific user
 * @param userId - User ID to filter records by
 * @returns Array of BookRecord objects for the specified user
 */
export const getUserBooks = (userId: number): BookRecord[] => {
  return mockRecords.filter(record => record.userID === userId);
};

/**
 * Function to get book details by ISBN
 * @param isbn - ISBN to search for
 * @returns Book object or null if not found
 */
export const getBookByISBN = (isbn: string): Book | null => {
  return mockBooks.find(book => book.isbn === isbn) || null;
};

export default {
  mockBooks,
  mockRecords,
  getUserBooks,
  getBookByISBN
};