import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';
import type { ValuesOf } from '~/types';

export const NodeEnv = {
  Development: 'development',
  Production: 'production',
  Test: 'test',
  Provision: 'provision',
} as const;

export type NodeEnv = ValuesOf<typeof NodeEnv>;

export const Env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    CACHE_URL: z.string().url(),
    SKINPORT_CLIENT_ID: z.string().nonempty(),
    SKINPORT_CLIENT_SECRET: z.string().nonempty(),
  },

  shared: {
    NODE_ENV: z.nativeEnum(NodeEnv).default(NodeEnv.Development),
    PORT: z.coerce.number().positive().default(3_000),
  },

  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
