import { db, users } from "@api-proffy/db";
import { eq } from "drizzle-orm";

import { verifyPassword } from "@/lib/verify-password";

export type LoginControllerInput = {
  email: string;
  password: string;
};

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid credentials.");
  }
}

export async function loginController({
  email,
  password,
}: LoginControllerInput) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (!user) {
    throw new InvalidCredentialsError();
  }

  const isPasswordValid = await verifyPassword(user.password, password);

  if (!isPasswordValid) {
    throw new InvalidCredentialsError();
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
