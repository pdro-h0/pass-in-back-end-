import { prisma } from "../src/lib/prisma";

export const seed = async () => {
  await prisma.event.create({
    data: {
      id: "81fc59e6-cd5c-4444-8cbe-3860f8499b47",
      title: "Unite Summit",
      slug: "unite-sumit",
      details: "Um evento p/ devs apaixonados(as) por código!",
      maximumAttendees: 5,
    },
  });
};

seed().then(() => {
  console.log("Database seeded!");
  prisma.$disconnect()
});
