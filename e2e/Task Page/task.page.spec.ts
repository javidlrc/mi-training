import { expect, Page, test } from '@playwright/test';
import { prisma } from '../../prisma/client';
import generateDummyUserData from '../User Helper Functions/generateDummyUserData';

async function signInTestUser(page: Page): Promise<string> {
  const dummyUser = generateDummyUserData({ permissions: ['manage-tasks'] }); // don't forget to give the test user required permissions; different describe groups may use different sets.
  const createdUser = await prisma.user.create({ data: dummyUser });

  await page.goto(`http://localhost:4200/proxy?net_id=${createdUser.netId}`);
  return createdUser.id;
}


test.describe('Task page', () => {
  // beforeEach will go here
  let id: string;

  test.beforeEach(async ({page}) => {
    id = await signInTestUser(page);
    await page.goto('http://localhost4200/tasks')
  });

  // afterEach will go here
  test.afterEach(async () => {
    await prisma.user.delete({ where: {id} })
  })

  // Tests will go here
});