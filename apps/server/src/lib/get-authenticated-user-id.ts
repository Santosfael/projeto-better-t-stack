import { env } from "@api-proffy/env/server";
import jwt from "jsonwebtoken";
import type { FastifyRequest } from "fastify";

const SESSION_COOKIE_NAME = "auth_token";

type SessionTokenPayload = {
  sub: string;
  email: string;
};

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized.");
  }
}

export function getAuthenticatedUserId(request: FastifyRequest) {
  const token = request.cookies[SESSION_COOKIE_NAME];

  if (!token) {
    throw new UnauthorizedError();
  }

  const unsignedToken = request.unsignCookie(token);

  if (!unsignedToken.valid) {
    throw new UnauthorizedError();
  }

  const payload = jwt.verify(
    unsignedToken.value,
    env.JWT_TOKEN,
  ) as SessionTokenPayload;

  if (!payload.sub) {
    throw new UnauthorizedError();
  }

  return payload.sub;
}
