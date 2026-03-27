import type { FastifyInstance } from "fastify";
import { ZodError, z } from "zod";

import {
  UserAlreadyExistsError,
  createUserController,
} from "@/controllers/users/create-user-controller";

const createUserBodySchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.email("Invalid email."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export async function userRoutes(app: FastifyInstance) {
  app.post(
    "/users",
    {
      schema: {
        tags: ["Users"],
        summary: "Cria um novo usuario",
        description: "Cria um novo usuario com nome, email e senha.",
        body: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: { type: "string" },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
          },
        },
        response: {
          201: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              name: { type: "string" },
              email: { type: "string", format: "email" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
          409: {
            type: "object",
            properties: {
              message: { type: "string" },
            },
          },
          400: {
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
        const body = createUserBodySchema.parse(request.body);
        const user = await createUserController(body);

        return reply.status(201).send(user);
      } catch (error) {
        if (error instanceof ZodError) {
          return reply.status(400).send({
            message: error.issues[0]?.message ?? "Invalid request body.",
          });
        }

        if (error instanceof UserAlreadyExistsError) {
          return reply.status(409).send({
            message: "User with this email already exists.",
          });
        }

        throw error;
      }
    },
  );
}
