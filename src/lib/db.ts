import postgres, { type Sql } from 'postgres';
import { Env } from '~/constants';

let client: Sql;

export function getDBClient() {
  if (!client) {
    client = postgres(Env.DATABASE_URL);
  }

  return client;
}
