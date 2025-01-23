import { randomFillSync } from 'node:crypto';
import type { Session } from '$/auth/types';
import { sha256 } from '@oslojs/crypto/sha2';
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from '@oslojs/encoding';
import { UnixTime } from '~/constants';
import { getCacheClient } from '~/lib';

async function saveSession(session: Session) {
  const cache = await getCacheClient();

  await cache.set(
    `session:${session.id}`,
    JSON.stringify({
      id: session.id,
      user_id: session.userId,
      expires_at: Math.floor(+session.expiresAt / 1000),
    }),
    { EXAT: Math.floor(+session.expiresAt / 1000) }
  );
}

export function generateSessionToken() {
  const bytes = new Uint8Array(20);
  randomFillSync(bytes);
  const token = encodeBase32LowerCaseNoPadding(bytes);

  return token;
}

export async function createSession(token: string, userId: number) {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const session: Session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + UnixTime.Day * 7),
  };

  await saveSession(session);

  return session;
}

export async function validateSessionToken(token: string) {
  const cacheClient = await getCacheClient();
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const item = await cacheClient.get(`session:${sessionId}`);

  if (item === null) {
    return null;
  }

  const result = JSON.parse(item);
  const session: Session = {
    id: result.id,
    userId: result.user_id,
    expiresAt: new Date(result.expires_at * 1000),
  };

  if (Date.now() >= session.expiresAt.getTime()) {
    await invalidateSession(session.id);

    return null;
  }

  if (Date.now() >= session.expiresAt.getTime() - UnixTime.Day * 3) {
    session.expiresAt = new Date(Date.now() + UnixTime.Day * 7);
    await saveSession(session);
  }

  return session;
}

export async function invalidateSession(sessionId: string) {
  const cacheClient = await getCacheClient();

  await cacheClient.del(`session:${sessionId}`);
}
