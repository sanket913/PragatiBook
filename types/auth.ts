export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AuthToken {
  token: string;
  expiry: string;
}