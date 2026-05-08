import type { Prisma, UserRole } from '@prisma/client';

export type JwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
  regionId?: string;
};

export type AuthUser = {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  regionId?: string;
};

export type AuthRequest = import('express').Request & {
  user: AuthUser;
};

export type UserWithRegion = Prisma.UserGetPayload<{
  include: { region: true };
}>;
export type AuthUserResult = Omit<UserWithRegion, 'password'>;
