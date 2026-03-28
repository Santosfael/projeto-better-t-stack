import { env } from "@api-proffy/env/server";
import fastifyCors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifyApiReference from "@scalar/fastify-api-reference";
import Fastify from "fastify";

import { userRoutes } from "@/routes/users";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import fastifyCookie from "@fastify/cookie";

const baseCorsConfig = {
  origin: env.CORS_ORIGIN,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  maxAge: 86400,
};

const fastify = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname"
      }
    }
  }
}).withTypeProvider<ZodTypeProvider>();

const port = env.PORT;
const host = env.HOST;

await fastify.register(fastifySwagger, {
  openapi: {
    openapi: "3.1.0",
    info: {
      title: "API Proffy",
      description: "Documentacao da API gerada com Fastify, Swagger e Scalar.",
      version: "1.0.0",
    },
  },
});

fastify.register(fastifyCors, baseCorsConfig);
fastify.register(fastifyCookie, {
  secret: env.COOKIE_SECRET
})
fastify.register(userRoutes);

fastify.get(
  "/",
  {
    schema: {
      tags: ["Health"],
      summary: "Health check da API",
      description: "Retorna uma resposta simples para confirmar que o servidor esta online.",
      response: {
        200: {
          type: "string",
          examples: ["OK"],
        },
      },
    },
  },
  async () => {
    return "OK";
  },
);

await fastify.register(fastifyApiReference, {
  routePrefix: "/docs",
  configuration: {
    title: "API Proffy Docs",
  },
});

fastify.listen({ port, host }, (err) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Server running on http://${host}:${port}`);
});
