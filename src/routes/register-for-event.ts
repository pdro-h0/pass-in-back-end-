import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";

export const registerForEvent = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/events/:eventId/attendees",
    {
      schema: {
        summary: "Register an attendee",
        tags: ["attendees"],
        body: z.object({
          name: z.string().min(4),
          email: z.string().email(),
        }),
        params: z.object({
          eventId: z.string().uuid(),
        }),
        response: {
          201: z.object({
            attendeeId: z.number(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { eventId } = request.params;
      const data = request.body;

      const attendeeFromEmail = await prisma.attendees.findUnique({
        where: {
          eventId_email: {
            email: data.email,
            eventId: eventId,
          },
        },
      });

      if (attendeeFromEmail !== null) {
        throw new Error("This email is alread registered for this event!");
      }

      const [event, amountOfAttendeesForEvent] = await Promise.all([
        prisma.event.findUnique({
          where: {
            id: eventId,
          },
        }),

        prisma.attendees.count({
          where: {
            eventId: eventId,
          },
        }),
      ]);

      // const event = await prisma.event.findUnique({
      //   where: {
      //     id: eventId,
      //   },
      // });

      // const amountOfAttendeesForEvent = await prisma.attendees.count({
      //   where: {
      //     eventId: eventId,
      //   },
      // });

      if (
        event?.maximumAttendees &&
        amountOfAttendeesForEvent >= event.maximumAttendees
      ) {
        throw new Error(
          "The maximum of attendees for this event has been reched!"
        );
      }

      const attendee = await prisma.attendees.create({
        data: {
          name: data.name,
          email: data.email,
          eventId: eventId,
        },
      });

      return reply.status(201).send({ attendeeId: attendee.id });
    }
  );
};
