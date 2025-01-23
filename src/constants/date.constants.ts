import type { ValuesOf } from '~/types';

const UNIX_SECOND = 1_000;
const UNIX_MINUTE = 60 * UNIX_SECOND;
const UNIX_HOUR = 60 * UNIX_MINUTE;
const UNIX_DAY = 24 * UNIX_HOUR;
const UNIX_MONTH = 30 * UNIX_DAY;
const UNIX_YEAR = 365 * UNIX_DAY;

export const UnixTime = {
  Second: UNIX_SECOND,
  Minute: UNIX_MINUTE,
  Hour: UNIX_HOUR,
  Day: UNIX_DAY,
  Month: UNIX_MONTH,
  Year: UNIX_YEAR,
} as const;

export type UnixTime = ValuesOf<typeof UnixTime>;
