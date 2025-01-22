import postgres, { type Sql } from 'postgres';
import { env } from '~/constants';

let client: Sql;

export function getDBClient() {
  if (!client) {
    client = postgres(env.DATABASE_URL);
  }

  return client;
}
