import { Role } from '@prisma/client';
import { JwtPayload } from 'jsonwebtoken';

export interface MyJwtPayload extends JwtPayload {
  userId: string;
  login: string;
  role: string;
}

export interface AuthenticatedUser {
  userId: string;
  login: string;
  role: Role;
}

export type RequestWithUser = Request & { user: AuthenticatedUser };
