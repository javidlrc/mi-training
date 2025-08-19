import { generateDummyUserData } from '../../../dummy/helpers/dummy-user';
import { appRouter } from '../../api.routes';
import { vi, describe, expect, it, beforeAll, afterAll } from 'vitest';
import { faker } from '@faker-js/faker';
import { prisma, User } from '../../../../../prisma/client';

describe('Get tasks by user', () => {
  let requestingUser: User;
  let getTasksByUser: ReturnType<
    typeof appRouter.createCaller
  >['tasks']['getTasksByUser'];

  beforeAll(async () => {
    requestingUser = await prisma.user.create({
      data: generateDummyUserData({
        permissions: [],
        roles: [],
      }),
    });
    getTasksByUser = appRouter
      .createCaller({ userId: requestingUser.id })
      .tasks
      .getTasksByUser;
  });

  afterAll(async () => {
    await prisma.user.delete({ where: { id: requestingUser.id } });
  });
});