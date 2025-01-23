import type { Session } from '$/auth/types';

export type AppFactory = {
  Variables: { session?: Session | null };
};
