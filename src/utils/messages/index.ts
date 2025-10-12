import { MESSAGES } from "./messages";

type DeepKeys<T> = {
  [K in keyof T & string]: T[K] extends Record<string, any>
    ? `${K}.${DeepKeys<T[K]>}`
    : K;
}[keyof T & string];

type MessagePath = DeepKeys<typeof MESSAGES>;

export const t = (path: MessagePath): string => {
  const keys = path.split(".");
  let value: any = MESSAGES;
  for (const key of keys) value = value?.[key];
  return value ?? path;
};
