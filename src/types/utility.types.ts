export type ValuesOf<T> = T[keyof T];

export type GetKeysByType<O, T> = ValuesOf<{
  [K in keyof O]: O[K] extends T ? K : never;
}>;

export type MakeRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

declare const tag: unique symbol;

declare interface Tagged<Token> {
  readonly [tag]: Token;
}

export type Opaque<Type, Token = unknown> = Type & Tagged<Token>;

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T | null;

export type OptionalToRequired<T> = T extends (infer U)[]
  ? (U extends undefined ? never : U)[]
  : T extends object
    ? { [K in keyof T]: OptionalToRequired<T[K]> }
    : T extends undefined
      ? never
      : T;
