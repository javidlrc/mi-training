import { z } from 'zod/v4';
import { prisma } from '../../../../../prisma/client';
import { authorizedProcedure } from '../../trpc';
import { TRPCError } from "@trpc/server";
import { TaskStatus } from '../../../../../prisma/generated/enums';

const getTasksByUserInput = z.object({
  pageSize: z.number(),
  pageOffset: z.number(),
});

const getTasksByUserOutput = z.object({
  data: z.array(z.object({
    id: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
    title: z.string(),
    description: z.string(),
    completedDate: z.date().nullable(),
    userId: z.string(),
    // This tells typescript that the string will exactly match one of the TaskStatus options
    status: z.literal(Object.values(TaskStatus)), 
    })),
  total: z.number(),
});

export const getTasksByUser = authorizedProcedure
  .meta({requiredPermissions: ['manage-tasks']})
  .input(getTasksByUserInput)
  .output(getTasksByUserOutput)
  .mutation(async (opts) =>{
    console.log({
      input: opts.input,
      userId: opts.ctx.userId
    })
    
    const total = await prisma.task.count({
      where: { userId: opts.ctx.userId }
    });

    if (opts.input.pageOffset && opts.input.pageOffset >= total) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: `Cannot paginate to item ${opts.input.pageOffset + 1}, as there are only ${total} items`
      })
    }

    const data = await prisma.task.findMany({
      where: { userId: opts.ctx.userId },
      take: opts.input.pageSize,
      skip: opts.input.pageOffset,
      orderBy: { createdAt: 'desc' },
    });

    console.log({ data, total })

    return { data, total };
  });
