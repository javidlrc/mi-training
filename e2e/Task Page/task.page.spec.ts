import { expect, Page, test } from '@playwright/test';
import { prisma } from '../../prisma/client';
import generateDummyUserData from '../User Helper Functions/generateDummyUserData';
import { TaskCreateManyInput } from '../../prisma/generated/models';
import { createTask } from '../../src/server/api/tasks/create-task/create-task';
import { id } from 'zod/v4/locales';

async function signInTestUser(page: Page): Promise<string> {
  const dummyUser = generateDummyUserData({ permissions: ['manage-tasks'] }); // don't forget to give the test user required permissions; different describe groups may use different sets.
  const createdUser = await prisma.user.create({ data: dummyUser });

  await page.goto(`http://localhost:4200/proxy?net_id=${createdUser.netId}`);
  return createdUser.id;
}

async function deleteTestUser(id: string) {
  await prisma.user.delete({where: {id}})
}

test.describe('Task page', () => {
  let userId: string;
  

  test.beforeEach(async ({page}) => {
    userId = await signInTestUser(page);
    await page.goto('http://localhost:4200/tasks');
  })

  test.afterEach(async () => {
    await deleteTestUser(userId);
  })

  // Tests will go here
  test('pagination buttons', async ({ page }) => {
    const createArray: TaskCreateManyInput[] = [];
    for (let i = 0; i < 100; i++) {
      createArray.push({
        title: `pagination test: ${i}`,
        description: i.toString(),
        status: 'Complete',
        userId: userId,
      })
    }

    await prisma.task.createManyAndReturn({ data: createArray });
    await page.goto('http://localhost:4200/tasks')

    const cards = page.locator('app-task-card');
    await expect(cards).toHaveCount(12);
    
    await expect(page.getByRole('group')).toContainText('1 – 12 of 100');
    await page.getByRole('button', { name: 'Next page' }).click();
    await expect(page.getByRole('group')).toContainText('13 – 24 of 100');
    await page.getByRole('button', { name: 'Next page' }).click();
    await expect(page.getByRole('group')).toContainText('25 – 36 of 100');
    await page.getByRole('button', { name: 'Last page' }).click();
    await expect(page.getByRole('group')).toContainText('97 – 100 of 100');
    await page.getByRole('button', { name: 'First page' }).click();
    await expect(page.getByRole('group')).toContainText('1 – 12 of 100');
  })

  test('creation', async ({ page }) => {
    await page.goto('http://localhost:4200/tasks')
    const cards = page.locator('app-task-card');
    
   
    await page.getByRole('button', { name: 'create button' }).click();
    await expect(page.locator('mat-card').filter({ hasText: 'TitleDescriptionsavecancel' })).toBeVisible();
    await page.getByText('Title').click();
    await page.getByRole('textbox', { name: 'Title' }).fill('Yep');
    await page.getByText('Description').click();
    await page.getByRole('textbox', { name: 'Description' }).fill('Si senor');
    await page.getByRole('button', { name: 'save button' }).click();
    await expect(page.locator('section')).toContainText('Yep');
    await expect(page.locator('section')).toContainText('Si senor');
    await expect(page.getByRole('group')).toContainText('1 – 1 of 1');
    
    
  })

  test('cancel & edit', async ({ page }) => {
    await page.goto('http://localhost:4200/tasks')

    await page.getByRole('button', { name: 'create button' }).click();
    await expect(page.locator('mat-card').filter({ hasText: 'TitleDescriptionsavecancel' })).toBeVisible();
    await page.getByText('Title').click();
    await page.getByRole('textbox', { name: 'Title' }).fill('Yep');
    await page.getByText('Description').click();
    await page.getByRole('textbox', { name: 'Description' }).fill('Si senor');
    await page.getByRole('button', { name: 'save button' }).click();
    await expect(page.locator('section')).toContainText('Yep');
    await expect(page.locator('section')).toContainText('Si senor');
    await expect(page.getByRole('group')).toContainText('1 – 1 of 1');
    
    await page.getByRole('button', { name: 'edit button' }).click();
    await page.getByRole('textbox', { name: 'Title' }).click();
    await page.getByRole('textbox', { name: 'Title' }).fill('Yep yep yep yep yep');
    await page.getByRole('textbox', { name: 'Description' }).click();
    await page.getByRole('textbox', { name: 'Description' }).fill('Si senor sdbvisubgsbguosbgo');
    await page.getByRole('button', { name: 'cancel button' }).click();
    await expect(page.locator('mat-card-title')).toContainText('Yep');
    await expect(page.locator('mat-card-content')).toContainText('Si senor');
    await page.getByRole('button', { name: 'edit button' }).click();
    await page.getByRole('textbox', { name: 'Title' }).click();
    await page.getByRole('textbox', { name: 'Title' }).press('ControlOrMeta+Shift+ArrowLeft');
    await page.getByRole('textbox', { name: 'Title' }).fill('Viva Mexico');
    await page.getByRole('textbox', { name: 'Description' }).click();
    await page.getByRole('textbox', { name: 'Description' }).press('ControlOrMeta+Shift+ArrowLeft');
    await page.getByRole('textbox', { name: 'Description' }).press('ControlOrMeta+Shift+ArrowLeft');
    await page.getByRole('textbox', { name: 'Description' }).fill('No wayyyyyyyy');
    await page.getByRole('button', { name: 'save button' }).click();
    await expect(page.locator('mat-card-title')).toContainText('Viva Mexico');
    await expect(page.locator('mat-card-content')).toContainText('No wayyyyyyyy');

  })
    

  test('status bar', async ({ page }) => {
    await page.goto('http://localhost:4200/tasks');

    await page.getByRole('button', { name: 'create button' }).click();
    await page.getByText('Title').click();
    await page.getByRole('textbox', { name: 'Title' }).fill('Yep');
    await page.getByText('Description').click();
    await page.getByRole('textbox', { name: 'Description' }).fill('Si senor');
    await page.getByRole('button', { name: 'save button' }).click();
    
    await expect(page.getByRole('button', { name: 'Status selector' })).toBeVisible();
    await expect(page.locator('section')).toContainText('Incomplete');
    await page.getByRole('button', { name: 'Status selector' }).click();
    await page.getByRole('menuitem', { name: 'In Progress' }).click();
    await expect(page.locator('section')).toContainText('InProgress');
    await page.getByRole('button', { name: 'Status selector' }).click();
    await page.getByRole('menuitem', { name: 'Complete', exact: true }).click();
    await expect(page.locator('section')).toContainText('Complete');
    await page.getByRole('button', { name: 'Status selector' }).click();
    await expect(page.locator('mat-card-subtitle')).not.toBeEmpty();
    await page.getByRole('menuitem', { name: 'Incomplete' }).click();
    await expect(page.getByRole('button', { name: 'Status selector' })).toBeVisible();

  })

  test('delete', async ({ page })=> {
    await page.goto('http://localhost:4200/tasks')

    await page.getByRole('button', { name: 'create button' }).click();
    await page.getByText('Title').click();
    await page.getByRole('textbox', { name: 'Title' }).fill('Yep');
    await page.getByText('Description').click();
    await page.getByRole('textbox', { name: 'Description' }).fill('Si senor');
    await page.getByRole('button', { name: 'save button' }).click();
    await expect(page.getByRole('group')).toContainText('1 – 1 of 1');

    await expect(page.getByRole('button', { name: 'delete button' })).toBeVisible();
    await page.getByRole('button', { name: 'delete button' }).click();
    await expect(page.getByRole('heading', { name: 'Are you sure?' })).toBeVisible();
    await page.getByRole('button', { name: 'Yes' }).click();
    await expect(page.getByRole('button', { name: 'Yes' })).toBeVisible();
    await expect(page.getByRole('group')).toContainText('0 of 0');

  })
    
  
});