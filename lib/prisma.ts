import { PrismaClient } from "./generated/prisma/client";
import { getSchoolConfig } from "@/config/index";
import { withAccelerate } from "@prisma/extension-accelerate";

const school = getSchoolConfig();

const globalForPrisma = global as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

function createPrismaClient() {
  return new PrismaClient({
    accelerateUrl: school.database.url!,
  }).$extends(withAccelerate());
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
