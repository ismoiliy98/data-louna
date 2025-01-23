import { validateSessionToken } from '$/auth/utils';
import type { Context } from 'hono';
import { bearerAuth } from 'hono/bearer-auth';
import { createFactory } from 'hono/factory';
import type { AppFactory } from '~/types';

const factory = createFactory<AppFactory>();

export const authGuard = factory.createMiddleware(
  bearerAuth({
    verifyToken: async (token, c: Context<AppFactory>) => {
      const session = await validateSessionToken(token);
      c.set('session', session);
      return !!session;
    },
  })
);
