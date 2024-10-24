// ? Optional helpers to ease the development of the application

// Define the Maybe type
export type Maybe<T> = T | null;

// Define the object spread type
export type Spread<T, U> = T & U;

// Define the PageProps type
export type PageProps<T, E extends "searchParams" | "params"> = {
  [key in E]: Promise<T> | null;
};
