import { generateDummyUserData } from '../../../dummy/helpers/dummy-user';
import { appRouter } from '../../api.routes';
import { vi, describe, expect, it, beforeAll, afterAll } from 'vitest';
import { faker } from '@faker-js/faker';
import { prisma, User } from '../../../../../prisma/client';

describe('Create task', () => {
  let requestingUser: User;
  let createTask: ReturnType<
    typeof appRouter.createCaller
  >['tasks']['createTask'];

  beforeAll(async () => {
    requestingUser = await prisma.user.create({
      data: generateDummyUserData({
        permissions: ['manage-tasks'],
        roles: [],
      }),
    });
    createTask = appRouter
      .createCaller({ userId: requestingUser.id })
      .tasks
      .createTask;
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: requestingUser.id } });
  });

  it('creates new task', async () => {
    const title = faker.book.title();
    const description = faker.hacker.phrase();

    const createTaskId = await createTask({title, description})

  try{
    const foundTask = await prisma.task.findUnique({where: {id: createTaskId.taskId}})
    expect(foundTask).toBeDefined();
    expect(foundTask?.title).toBe(title);
    expect(foundTask?.description).toBe(description);
    expect(foundTask?.status).toBe("Incomplete");

  } finally {
    await prisma.task.delete({where: {id: createTaskId.taskId}})

  }
})
});