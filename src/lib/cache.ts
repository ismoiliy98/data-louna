import { type RedisClientType, createClient } from 'redis';
import { Env } from '~/constants';

let client: RedisClientType;

export async function getCacheClient() {
  if (!client) {
    client = createClient({ url: Env.CACHE_URL });

    await client
      .on('error', (err) => {
        console.error('Redis Client Error', err);
      })
      .on('connect', () => {
        console.log('Redis connected!');
      })
      .connect();
  }

  return client;
}
