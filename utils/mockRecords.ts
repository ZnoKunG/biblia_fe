import mockBooks from "./mockBooks";

// Updated mock data to match the BookRecord interface
const mockRecords: BookRecord[] = [
  {
    id: '1',
    book: mockBooks[0], // Dune
    status: 'in progress',
    currentPage: 123,
    totalPages: 412,
    dateAdded: '2023-10-15',
  },
  {
    id: '2',
    book: mockBooks[1], // Atomic Habits
    status: 'finished',
    currentPage: 320,
    totalPages: 320,
    dateAdded: '2023-09-20',
  },
  {
    id: '3',
    book: mockBooks[2], // Project Hail Mary
    status: 'to read',
    currentPage: 0,
    totalPages: 496,
    dateAdded: '2023-11-05',
  },
  {
    id: '4',
    book: mockBooks[3], // The Hobbit
    status: 'finished',
    currentPage: 366,
    totalPages: 366,
    dateAdded: '2023-08-12',
  },
];

export default mockRecords;