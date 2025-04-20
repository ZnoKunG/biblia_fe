// Google Books API URL
const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

// Optional: Add your API key if you have one
// const API_KEY = 'YOUR_API_KEY';

/**
 * Search books using Google Books API
 * @param query - Search query string
 * @param maxResults - Maximum number of results to return (default: 20)
 * @returns Promise with array of Book objects
 */
export const searchBooks = async (query: string, maxResults: number = 20): Promise<Book[]> => {
  try {
    if (!query.trim()) {
      return [];
    }

    // Construct API URL
    let url = `${GOOGLE_BOOKS_API_URL}?q=${encodeURIComponent(query)}&maxResults=${maxResults}`;
    
    // Add API key if you have one
    // url += `&key=${API_KEY}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Map API response to our Book interface
    if (data.items && Array.isArray(data.items)) {
      return data.items.map((item: any) => mapGoogleBookToBook(item));
    }
    
    return [];
  } catch (error) {
    console.error('Error searching Google Books API:', error);
    throw error;
  }
};

/**
 * Get book details by ISBN
 * @param isbn - ISBN number
 * @returns Promise with Book object
 */
export const getBookByISBN = async (isbn: string): Promise<Book | null> => {
  try {
    if (!isbn) {
      return null;
    }

    const query = `isbn:${isbn}`;
    const url = `${GOOGLE_BOOKS_API_URL}?q=${encodeURIComponent(query)}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      return mapGoogleBookToBook(data.items[0]);
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching book by ISBN:', error);
    throw error;
  }
};

/**
 * Map Google Books API volume object to our Book interface
 * @param googleBook - Google Books API volume object
 * @returns Book object
 */
const mapGoogleBookToBook = (googleBook: any): Book => {
  const volumeInfo = googleBook.volumeInfo || {};
  const imageLinks = volumeInfo.imageLinks || {};

  // Extract ISBN (prefer ISBN_13, fallback to ISBN_10)
  let isbn = '';
  if (volumeInfo.industryIdentifiers && volumeInfo.industryIdentifiers.length > 0) {
    const isbn13 = volumeInfo.industryIdentifiers.find((id: any) => id.type === 'ISBN_13');
    const isbn10 = volumeInfo.industryIdentifiers.find((id: any) => id.type === 'ISBN_10');
    isbn = (isbn13 ? isbn13.identifier : isbn10 ? isbn10.identifier : '') || googleBook.id || '';
  }

  // Extract main category/genre
  let genre = 'Unknown';
  if (volumeInfo.categories && volumeInfo.categories.length > 0) {
    // Usually the first category is the main one
    genre = volumeInfo.categories[0].split(' / ')[0] || 'Unknown';
  }

  return {
    isbn: isbn,
    title: volumeInfo.title || 'Unknown Title',
    author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Unknown Author',
    cover: imageLinks.thumbnail || imageLinks.smallThumbnail || '/placeholder-cover.png',
    genre: genre,
    rating: volumeInfo.averageRating || 0,
    year: volumeInfo.publishedDate ? parseInt(volumeInfo.publishedDate.substring(0, 4)) : 0,
    totalPages: volumeInfo.pageCount || 0,
    description: volumeInfo.description || '',
  };
};

/**
 * Get books by genre
 * @param genre - Genre/category to search for
 * @param maxResults - Maximum number of results to return (default: 20)
 * @returns Promise with array of Book objects
 */
export const getBooksByGenre = async (genre: string, maxResults: number = 20): Promise<Book[]> => {
  try {
    if (!genre || genre === 'All') {
      // Return popular books instead
      return searchBooks('subject:fiction', maxResults);
    }

    const query = `subject:${encodeURIComponent(genre)}`;
    const url = `${GOOGLE_BOOKS_API_URL}?q=${query}&maxResults=${maxResults}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.items && Array.isArray(data.items)) {
      return data.items.map((item: any) => mapGoogleBookToBook(item));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching books by genre:', error);
    throw error;
  }
};

/**
 * Get popular books
 * @param maxResults - Maximum number of results to return (default: 20)
 * @returns Promise with array of Book objects
 */
export const getPopularBooks = async (maxResults: number = 20): Promise<Book[]> => {
  // We'll just get bestsellers in fiction as a default
  return searchBooks('subject:fiction&orderBy=relevance', maxResults);
};