import argon2 from "argon2";

export async function verifyPassword(hash: string, password: string) {
  return argon2.verify(hash, password);
}
