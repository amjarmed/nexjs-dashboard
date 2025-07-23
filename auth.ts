import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

import { User } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';
import Credentials from 'next-auth/providers/credentials';
import postgres from 'postgres';
import { z } from 'zod';
//query user from the database

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User[]>`
      SELECT * FROM users WHERE email = ${email}
    `;
    return user[0];
  } catch (error) {
    console.error('Error fetching user:', error);
    throw new Error('Failed to fetch user');
  }
}
export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(6),
          })
          .safeParse(credentials);
        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          // call bycrypt to verify the password
          if (!user) return null;
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user;
        }
        console.log('Invalid credentials:', parsedCredentials.error);

        return null;
      },
    }),
  ],
});
