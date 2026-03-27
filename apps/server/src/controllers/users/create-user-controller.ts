import { db, users } from "@api-proffy/db";
import { eq } from "drizzle-orm";

import { hashPassword } from "@/lib/hash-password";

export type CreateUserControllerInput = {
  name: string;
  email: string;
  password: string;
};

export class UserAlreadyExistsError extends Error {
  constructor() {
    super("User already exists.");
  }
}

export async function createUserController({
  name,
  email,
  password,
}: CreateUserControllerInput) {
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    throw new UserAlreadyExistsError();
  }

  const [user] = await db
    .insert(users)
    .values({
      name,
      email,
      password: await hashPassword(password),
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    });

  return user;
}
