import { generateDummyUserData } from '../../../dummy/helpers/dummy-user';
import { appRouter } from '../../api.routes';
import { vi, describe, expect, it, beforeAll, afterAll } from 'vitest';
import { faker } from '@faker-js/faker';
import { prisma, User } from '../../../../../prisma/client';
import { TaskStatus } from '../../../../../prisma/generated/enums';

describe('Update task', () => {
  let requestingUser: User;
  let updateTask: ReturnType<
    typeof appRouter.createCaller
  >['tasks']['updateTask'];

  beforeAll(async () => {
    requestingUser = await prisma.user.create({
      data: generateDummyUserData({
        permissions: ['manage-tasks'],
        roles: [],
      }),
    });
    updateTask = appRouter
      .createCaller({ userId: requestingUser.id })
      .tasks
      .updateTask;
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: requestingUser.id } });
  });

  it('updates task when checked complete', async () => {
    const task = await prisma.task.create({
      data: {
        completedDate: faker.date.recent(),
        status: 'Incomplete',
        title: faker.book.title(),
        description: faker.hacker.phrase(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
        userId: requestingUser.id
      },
    });
    try {
      const title = faker.book.title();
      const description = faker.hacker.phrase();
      const status : TaskStatus = 'Complete';

      const updatedTask = await updateTask({
        taskId: task.id,
        newTitle: title,
        newDescription: description,
        updatedStatus: status,
        // Your logic goes here
      })

      expect(updatedTask).toBeDefined();
      expect(updatedTask?.title).toBe(title);
      expect(updatedTask?.description).toBe(description);
      expect(updatedTask?.status).toBe("Complete");


    } finally{
      await prisma.task.delete({where: {id: task.id}}) //double check this
    };
  }
  )

  it('updates task when unchecked complete', async () => {
    const task = await prisma.task.create({
    data: {
      completedDate: faker.date.recent(),
      status: 'Incomplete',
      title: faker.book.title(),
      description: faker.hacker.phrase(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      userId: requestingUser.id
    }
    })

    try {
      const title = faker.book.title();
      const description = faker.hacker.phrase();
      const status : TaskStatus = 'Incomplete';

      const updatedTask = await updateTask({
        taskId: task.id,
        newTitle: title,
        newDescription: description,
        updatedStatus: status,
        // Your logic goes here
      })

      expect(updatedTask).toBeDefined();
      expect(updatedTask?.title).toBe(title);
      expect(updatedTask?.description).toBe(description);
      expect(updatedTask?.status).toBe("Incomplete");
    }

    finally{
      await prisma.task.delete({where: {id: task.id}}) //double check this
    };

  });

  it('errors if the task is not found', async () => {
    let error;

    try {
      await updateTask({ 
        taskId: faker.string.uuid(),
        newDescription: faker.hacker.phrase(),
        newTitle: faker.book.title(),
        updatedStatus: 'InProgress',
      });
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error).toHaveProperty('code', 'NOT_FOUND');
  });


});