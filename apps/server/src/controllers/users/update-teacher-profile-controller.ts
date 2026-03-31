import { classSchedule, classes, db, users } from "@api-proffy/db";
import { eq } from "drizzle-orm";

export type UpdateTeacherProfileControllerInput = {
  userId: string;
  avatar?: string;
  bio: string;
  whatsApp?: string;
  subject: string;
  schedule: Array<{
    weekDay: number;
    from: number;
    to: number;
  }>;
};

export class UserNotFoundError extends Error {
  constructor() {
    super("User not found.");
  }
}

export async function updateTeacherProfileController({
  userId,
  avatar,
  bio,
  whatsApp,
  subject,
  schedule,
}: UpdateTeacherProfileControllerInput) {
  return db.transaction(async (tx) => {
    const existingUser = await tx.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!existingUser) {
      throw new UserNotFoundError();
    }

    await tx
      .update(users)
      .set({
        avatar,
        bio,
        whatsApp,
        role: "teacher",
      })
      .where(eq(users.id, userId));

    await tx.delete(classes).where(eq(classes.teacherId, userId));

    const [createdClass] = await tx
      .insert(classes)
      .values({
        subject,
        teacherId: userId,
      })
      .returning({
        id: classes.id,
        subject: classes.subject,
      });

    if (!createdClass) {
      throw new Error("Failed to create class.");
    }

    const createdSchedule = await tx
      .insert(classSchedule)
      .values(
        schedule.map((item) => ({
          classId: createdClass.id,
          weekDay: item.weekDay,
          from: item.from,
          to: item.to,
        })),
      )
      .returning({
        id: classSchedule.id,
        weekDay: classSchedule.weekDay,
        from: classSchedule.from,
        to: classSchedule.to,
      });

    const [updatedUser] = await tx
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatar: users.avatar,
        bio: users.bio,
        whatsApp: users.whatsApp,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!updatedUser) {
      throw new Error("Failed to load updated user.");
    }

    return {
      user: updatedUser,
      class: createdClass,
      schedule: createdSchedule,
    };
  });
}
