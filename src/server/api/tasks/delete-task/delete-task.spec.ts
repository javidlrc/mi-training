import { generateDummyUserData } from '../../../dummy/helpers/dummy-user';
import { appRouter } from '../../api.routes';
import { vi, describe, expect, it, beforeAll, afterAll } from 'vitest';
import { faker } from '@faker-js/faker';
import { prisma, TaskStatus, User } from '../../../../../prisma/client';

describe('Delete task', () => {
  let requestingUser: User;
  let deleteTask: ReturnType<
    typeof appRouter.createCaller
  >['tasks']['deleteTask'];

  beforeAll(async () => {
    requestingUser = await prisma.user.create({
      data: generateDummyUserData({
        permissions: ['manage-tasks'],
        roles: [],
      }),
    });
    deleteTask = appRouter
      .createCaller({ userId: requestingUser.id })
      .tasks
      .deleteTask;
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: requestingUser.id } });
  });


  it('deletes task', async () => {
    const tasks = await prisma.task.create({
      data: {
        userId: requestingUser.id,
        title: faker.book.title(),
        description: faker.hacker.phrase(),
        status: faker.helpers.enumValue(TaskStatus),
        completedDate: faker.date.recent(),
        updatedAt: faker.date.recent(),
        createdAt: faker.date.past(),
      }
    }) 
    try {
      await deleteTask({ taskId: tasks.id })
      const foundTask = await prisma.user.findUnique({
        where: { id: tasks.id}
      })
      expect(foundTask).toBeNull();
    }
    catch (err) {
      await prisma.task.delete({ where: {id: tasks.id} })
      throw err;
    }
  })



});