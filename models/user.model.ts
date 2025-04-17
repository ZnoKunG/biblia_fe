// Interface for User
interface CreateUser {
    username: string;
    password: string;
    favourite_genres: string[];
}

interface User {
  id: number;
  username: string;
  favourite_genres: string[];
}

interface CredentialUser {
  username: string;
  password: string;
}