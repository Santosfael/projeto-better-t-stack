import type { FastifyInstance } from "fastify";
import { ZodError, z } from "zod";

import {
  UserAlreadyExistsError,
  createUserController,
} from "@/controllers/users/create-user-controller";
import {
  UserNotFoundError,
  updateTeacherProfileController,
} from "@/controllers/users/update-teacher-profile-controller";
import {
  UnauthorizedError,
  getAuthenticatedUserId,
} from "@/lib/get-authenticated-user-id";

const createUserBodySchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.email("Invalid email."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

const updateTeacherProfileBodySchema = z.object({
  avatar: z.url("Avatar must be a valid URL.").optional(),
  bio: z.string().min(1, "Bio is required."),
  whatsApp: z.string().min(1, "WhatsApp is required.").optional(),
  subject: z.string().min(1, "Subject is required."),
  schedule: z
    .array(
      z
        .object({
          weekDay: z
            .number()
            .int("Week day must be an integer.")
            .min(0, "Week day must be between 0 and 7.")
            .max(7, "Week day must be between 0 and 7."),
          from: z.number().int("From must be an integer."),
          to: z.number().int("To must be an integer."),
        })
        .refine((value) => value.to > value.from, {
          message: "To must be greater than from.",
          path: ["to"],
        }),
    )
    .min(1, "At least one schedule is required."),
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
              role: { type: "string", enum: ["student", "teacher"] },
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

  app.put(
    "/users/me/teacher",
    {
      schema: {
        tags: ["Users"],
        summary: "Atualiza o usuario logado para professor",
        description:
          "Atualiza avatar, bio, WhatsApp, altera o role para teacher, cria a disciplina e os horarios disponiveis.",
        body: {
          type: "object",
          required: ["bio", "subject", "schedule"],
          properties: {
            avatar: { type: "string", format: "uri" },
            bio: { type: "string" },
            whatsApp: { type: "string" },
            subject: { type: "string" },
            schedule: {
              type: "array",
              minItems: 1,
              items: {
                type: "object",
                required: ["weekDay", "from", "to"],
                properties: {
                  weekDay: { type: "integer", minimum: 0, maximum: 7 },
                  from: { type: "integer" },
                  to: { type: "integer" },
                },
              },
            },
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
                  avatar: { type: "string", format: "uri", nullable: true },
                  bio: { type: "string", nullable: true },
                  whatsApp: { type: "string", nullable: true },
                  role: { type: "string", enum: ["student", "teacher"] },
                  createdAt: { type: "string", format: "date-time" },
                  updatedAt: { type: "string", format: "date-time" },
                },
              },
              class: {
                type: "object",
                properties: {
                  id: { type: "string", format: "uuid" },
                  subject: { type: "string" },
                },
              },
              schedule: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string", format: "uuid" },
                    weekDay: { type: "integer" },
                    from: { type: "integer" },
                    to: { type: "integer" },
                  },
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
          404: {
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
        const userId = getAuthenticatedUserId(request);
        const body = updateTeacherProfileBodySchema.parse(request.body);

        const result = await updateTeacherProfileController({
          userId,
          ...body,
        });

        return reply.status(200).send(result);
      } catch (error) {
        if (error instanceof ZodError) {
          return reply.status(400).send({
            message: error.issues[0]?.message ?? "Invalid request body.",
          });
        }

        if (error instanceof UnauthorizedError) {
          return reply.status(401).send({
            message: "Unauthorized.",
          });
        }

        if (error instanceof UserNotFoundError) {
          return reply.status(404).send({
            message: "User not found.",
          });
        }

        throw error;
      }
    },
  );
}
