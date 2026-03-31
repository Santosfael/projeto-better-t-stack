import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import argon2 from "argon2";
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import {
  classSchedule,
  classes,
  connections,
  users,
} from "./schema";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = dirname(currentFilePath);

dotenv.config({
  path: resolve(currentDirPath, "../../../apps/server/.env"),
});

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined.");
}

const pool = new Pool({
  connectionString: databaseUrl,
});

const db = drizzle(pool);

async function seed() {
  const defaultPassword = await argon2.hash("123456");

  await db.delete(classSchedule);
  await db.delete(connections);
  await db.delete(classes);
  await db.delete(users);

  const [teacherAna, teacherCarlos, studentJulia] = await db
    .insert(users)
    .values([
      {
        name: "Ana Souza",
        email: "ana.souza@proffy.dev",
        password: defaultPassword,
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
        whatsApp: "11999990001",
        bio: "Professora de Matematica focada em reforco escolar e preparacao para vestibular.",
        role: "teacher",
      },
      {
        name: "Carlos Lima",
        email: "carlos.lima@proffy.dev",
        password: defaultPassword,
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
        whatsApp: "11999990002",
        bio: "Professor de Quimica com aulas praticas e abordagem objetiva para o ENEM.",
        role: "teacher",
      },
      {
        name: "Julia Martins",
        email: "julia.martins@proffy.dev",
        password: defaultPassword,
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
        whatsApp: "11999990003",
        bio: "Estudante em busca de aulas de ciencias exatas para aprofundar os estudos.",
        role: "student",
      },
    ])
    .returning({
      id: users.id,
      role: users.role,
    });

  if (!teacherAna || !teacherCarlos || !studentJulia) {
    throw new Error("Failed to insert seed users.");
  }

  const [mathClass, chemistryClass] = await db
    .insert(classes)
    .values([
      {
        subject: "Matematica",
        teacherId: teacherAna.id,
      },
      {
        subject: "Quimica",
        teacherId: teacherCarlos.id,
      },
    ])
    .returning({
      id: classes.id,
    });

  if (!mathClass || !chemistryClass) {
    throw new Error("Failed to insert seed classes.");
  }

  await db.insert(classSchedule).values([
    {
      classId: mathClass.id,
      weekDay: 1,
      from: 480,
      to: 720,
    },
    {
      classId: mathClass.id,
      weekDay: 3,
      from: 840,
      to: 1080,
    },
    {
      classId: chemistryClass.id,
      weekDay: 2,
      from: 540,
      to: 780,
    },
    {
      classId: chemistryClass.id,
      weekDay: 4,
      from: 900,
      to: 1140,
    },
  ]);

  await db.insert(connections).values([
    { userId: teacherAna.id },
    { userId: teacherAna.id },
    { userId: teacherCarlos.id },
    { userId: teacherCarlos.id },
    { userId: teacherCarlos.id },
    { userId: studentJulia.id },
  ]);

  console.log("Seed executado com sucesso.");
}

seed()
  .catch((error) => {
    console.error("Erro ao executar seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
