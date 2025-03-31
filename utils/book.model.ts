export default interface BookDetail {
    isbnID: string;
    title: string;
    author: string;
    genre: string;
    publicationYear: number;
    summary: string;
    recommendedFor: string;
    rating?: number; // Example: 4.5 (out of 5)
    pageCount?: number;
    seriesInfo?: {
        seriesName: string;
        bookNumber: number;
        totalBooks?: number;
    };
}