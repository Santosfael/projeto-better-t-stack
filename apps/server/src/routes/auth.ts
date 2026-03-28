import { env } from "@api-proffy/env/server";
import jwt from "jsonwebtoken";
import type { FastifyInstance } from "fastify";
import { ZodError, z } from "zod";

import {
  InvalidCredentialsError,
  loginController,
} from "@/controllers/auth/login-controller";

const loginBodySchema = z.object({
  email: z.email("Invalid email."),
  password: z.string().min(1, "Password is required."),
});

const SESSION_COOKIE_NAME = "auth_token";
const SESSION_DURATION_IN_SECONDS = 60 * 60 * 24 * 7;

export async function authRoutes(app: FastifyInstance) {
  app.post(
    "/login",
    {
      schema: {
        tags: ["Auth"],
        summary: "Autentica um usuario",
        description: "Realiza o login com email e senha e salva o token no cookie.",
        body: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 1 },
          },
        },
        response: {
          200: {
            type: "object",
            properties: {
              user: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  name: { type: "string" },
                  email: { type: "string", format: "email" },
                  createdAt: { type: "string", format: "date-time" },
                  updatedAt: { type: "string", format: "date-time" },
                },
              },
            },
          },
          400: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
          401: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const body = loginBodySchema.parse(request.body);
        const user = await loginController(body);

        const token = jwt.sign(
          {
            sub: user.id,
            email: user.email,
          },
          env.JWT_TOKEN,
          {
            expiresIn: SESSION_DURATION_IN_SECONDS,
          },
        );

        reply.setCookie(SESSION_COOKIE_NAME, token, {
          httpOnly: true,
          sameSite: "lax",
          secure: env.NODE_ENV === "production",
          path: "/",
          signed: true,
          maxAge: SESSION_DURATION_IN_SECONDS,
        });

        return reply.status(200).send({ user });
      } catch (error) {
        if (error instanceof ZodError) {
          return reply.status(400).send({
            message: error.issues[0]?.message ?? "Invalid request body.",
          });
        }

        if (error instanceof InvalidCredentialsError) {
          return reply.status(401).send({
            message: "Invalid email or password.",
          });
        }

        throw error;
      }
    },
  );
}
