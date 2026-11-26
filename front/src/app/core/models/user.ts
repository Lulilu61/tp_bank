// Shape of a user as returned by the API (JSON)
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

// PATCH /api/users/:id
export type UpdateUserBody = Partial<Pick<User, 'firstName' | 'lastName' | 'email'>>;