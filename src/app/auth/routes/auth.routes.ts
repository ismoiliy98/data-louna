import { authGuard } from '$/auth/middlewares';
import {
  authChangePasswordSchema,
  authCredentialsSchema,
} from '$/auth/schemas';
import {
  createSession,
  generateSessionToken,
  invalidateSession,
} from '$/auth/utils';
import { zValidator } from '@hono/zod-validator';
import { hash, verify } from 'argon2';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { HttpStatus } from '~/constants';
import { getDBClient } from '~/lib';
import type { User } from '~/types';

export const authRouter = new Hono()
  .post('/signup', zValidator('json', authCredentialsSchema), async (c) => {
    const { username, password } = c.req.valid('json');
    const sql = getDBClient();
    const [existingUser] = await sql<Pick<User, 'id'>[]>`
      SELECT id FROM users WHERE username = ${username} LIMIT 1
    `;

    if (existingUser) {
      throw new HTTPException(HttpStatus.BadRequest, {
        message: 'Username is already registered',
      });
    }

    const hashedPassword = await hash(password);
    const [{ id: userId }] = await sql<Pick<User, 'id'>[]>`
      INSERT INTO users (username, password_hash) 
      VALUES (${username}, ${hashedPassword})
      RETURNING id
    `;

    const token = generateSessionToken();
    await createSession(token, userId);

    return c.json({ token, userId, message: 'Signup successful' });
  })
  .post('/login', zValidator('json', authCredentialsSchema), async (c) => {
    const { username, password } = c.req.valid('json');
    const sql = getDBClient();
    const [user] = await sql<Pick<User, 'id' | 'password_hash'>[]>`
      SELECT id, password_hash FROM users WHERE username = ${username}
    `;

    if (!user) {
      throw new HTTPException(HttpStatus.Unauthorized, {
        message: 'Invalid credentials',
      });
    }

    const isMatch = await verify(user.password_hash, password);

    if (!isMatch) {
      throw new HTTPException(HttpStatus.Unauthorized, {
        message: 'Invalid credentials',
      });
    }

    const token = generateSessionToken();
    await createSession(token, user.id);

    return c.json({ token, userId: user.id, message: 'Login successful' });
  })
  .get('/logout', authGuard, async (c) => {
    const session = c.get('session');

    if (session) {
      await invalidateSession(session.id);
      c.set('session', null);
    }

    return c.json({ message: 'Logout successful' });
  })
  .post(
    '/change-password',
    authGuard,
    zValidator('json', authChangePasswordSchema),
    async (c) => {
      const { currentPassword, newPassword } = c.req.valid('json');
      const session = c.get('session');

      if (!session) {
        throw new HTTPException(HttpStatus.Unauthorized, {
          message: 'Invalid credentials',
        });
      }

      const sql = getDBClient();
      const [user] = await sql<Pick<User, 'password_hash'>[]>`
        SELECT password_hash FROM users WHERE id = ${session.userId}
      `;

      if (!user) {
        throw new HTTPException(HttpStatus.Unauthorized, {
          message: 'Invalid credentials',
        });
      }

      const isMatch = await verify(user.password_hash, currentPassword);

      if (!isMatch) {
        throw new HTTPException(HttpStatus.Unauthorized, {
          message: 'Invalid credentials',
        });
      }

      const hashedPassword = await hash(newPassword);
      await sql`
        UPDATE users
        SET password_hash = ${hashedPassword}
        WHERE id = ${session.userId}
      `;

      return c.json({ message: 'Password changed successfully' });
    }
  );
