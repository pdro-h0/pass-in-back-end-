import { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";
import { prisma } from "../lib/prisma";
import { generateSlug } from "../utils/generate-slug";
import { FastifyInstance } from "fastify";
import { BadRequest } from "./_errors/bad-request";

export const createEvent = async (app: FastifyInstance) => {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/events",
    {
      schema: {
        summary: "Create an event",
        tags: ["events"],
        body: z.object({
          title: z
            .string({ invalid_type_error: "O titulo precisa ser uma string!" })
            .min(4),
          details: z.string().nullable(),
          maximumAttendees: z.number().int().positive().nullable(),
        }),
        response: {
          201: z.object({
            eventId: z.string().uuid(),
          }),
        },
      },
    },
    async (request, reply) => {
      const data = request.body;

      const slug = generateSlug(data.title);

      const eventWithSameSlug = await prisma.event.findUnique({
        where: {
          slug: slug,
        },
      });

      if (eventWithSameSlug !== null) {
        throw new BadRequest("Another event with same title exist!");
      }

      const event = await prisma.event.create({
        data: {
          title: data.title,
          details: data.details,
          maximumAttendees: data.maximumAttendees,
          slug: slug,
        },
      });

      return reply.status(201).send({ eventId: event.id });
    }
  );
};
