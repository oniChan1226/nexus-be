import type { Redis } from "ioredis";

const OTP_PREFIX = "otp:";
const OTP_TTL = 120; // 120 secs

export async function saveOtp(redis: Redis, identifier: string, otp: string) {
  const key = `${OTP_PREFIX}${identifier}`;
  await redis.set(key, otp, "EX", OTP_TTL);
}

export async function getOtp(redis: Redis, identifier: string) {
  const key = `${OTP_PREFIX}${identifier}`;
  return await redis.get(key);
}
export async function deleteOtp(redis: Redis, identifier: string) {
  const key = `${OTP_PREFIX}${identifier}`;
  await redis.del(key);
}
