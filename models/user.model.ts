// Interface for User
export interface CreateUser {
    username: string;
    password: string;
    favourite_genres: string[];
}

export interface User {
  id: number;
  username: string;
  favourite_genres: string[];
}

export interface CredentialUser {
  username: string;
  password: string;
}