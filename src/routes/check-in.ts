import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";

export const checkIn = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/attendee/:attendeeId/check-in",
    {
      schema: {
        params: z.object({
          attendeeId: z.coerce.number().int(),
        }),
        response: {
          201: z.object({
            checkInId: z.number().int(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { attendeeId } = request.params;

      const attendeeCheckIn = await prisma.checkIn.findUnique({
        where: {
          attendeesId: attendeeId,
        },
      });

      if (attendeeCheckIn !== null) {
        throw new Error("Attendee already check in!");
      }

      const checkInCreated = await prisma.checkIn.create({
        data: {
          attendeesId: attendeeId,
        },
      });

      return reply.status(201).send({ checkInId: checkInCreated.id });
    }
  );
};
