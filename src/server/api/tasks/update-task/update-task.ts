import { z } from 'zod/v4';
import { prisma } from '../../../../../prisma/client';
import { authorizedProcedure } from '../../trpc';
import { TRPCError } from "@trpc/server";
import { TaskStatus } from '../../../../../prisma/generated/enums';
import { error } from 'console';
import { isPrismaError } from '../../../utils/prisma';

const updateTaskInput = z.object({
  taskId: z.string(),
  newTitle: z.string(),
  newDescription: z.string(),
  updatedStatus: z.literal(Object.values(TaskStatus)),
});

const updateTaskOutput = z.object({
  completedDate: z.date().nullable(),
  status: z.literal(Object.values(TaskStatus)),
  title: z.string(),
  description: z.string(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
  userId: z.string(),
  id: z.string(),
});

export const updateTask = authorizedProcedure
  .meta({ requiredPermissions: ['manage-tasks'] })
  .input(updateTaskInput)
  .output(updateTaskOutput)
  .mutation(async (opts) => {
    //find the task you want to update
    const oldTask = await prisma.task.findUnique({
      where: {id: opts.input.taskId, userId: opts.ctx.userId},
    });
    if (!oldTask) {
      throw new TRPCError({code: 'NOT_FOUND'})
    };
    
    //calculates completedDate based on what user selects and what already existed
    let newCompletedDate: Date | null = oldTask.completedDate;
    if (opts.input.updatedStatus){
      if (opts.input.updatedStatus != oldTask.status) {
        if (opts.input.updatedStatus === 'Complete') {
          newCompletedDate = new Date();
        }
        else if (oldTask.status === 'Complete') {
          newCompletedDate = null;
        }
      }
    } 

    //does the actual updating
    try {
      return await prisma.task.update({
        where: {
          id: oldTask.id,
          userId: oldTask.userId,
        },
        data: {
          title: opts.input.newTitle.trim(),
          description: opts.input.newDescription,
          status: opts.input.updatedStatus,
          completedDate: newCompletedDate
        }
      });
    } 
    catch (error) {
      if (isPrismaError(error, 'NOT_FOUND')) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `failed to update task: ${oldTask.id}, user: ${opts.ctx.user.netId}`,
        });
      }
    };

    throw error;
  });
