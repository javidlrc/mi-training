import { z } from 'zod/v4';
import { prisma } from '../../../../../prisma/client';
import { authorizedProcedure } from '../../trpc';
import { TRPCError } from "@trpc/server";

const getTasksByUserInput = z.undefined();

const getTasksByUserOutput = z.void();

export const getTasksByUser = authorizedProcedure
  .meta({ requiredPermissions: [] })
  .input(getTasksByUserInput)
  .output(getTasksByUserOutput)
  .mutation(async (opts) => {
    // Your logic goes here
    const getTasksByUserInput = z.object({
    pageSize: z.number(),
    pageOffset: z.number(),
    });

    const getTasksByUserOutput = z.object({
      // An array of objects where...
      data: z.array(z.object({
      id: z.string(),
      createdAt: z.date(),
      updatedAt: z.date(),
      title: z.string(),
      description: z.string(),
      completedAt: z.date().nullable(),
      ownerId: z.string(),
      // This tells typescript that the string will exactly match one of the TaskStatus options
      status: z.literal(Object.values(TaskStatus)), 
      })),
      totalCount: z.number(),
    });
    throw new TRPCError({ code: 'NOT_IMPLEMENTED' });
  });
