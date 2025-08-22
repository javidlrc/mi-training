import { Routes } from '@angular/router';
import { AuthErrorPage, ForbiddenPage, NotFoundPage, ServerErrorPage } from '@fhss-web-team/frontend-utils';
import { HomePage } from './pages/home/home.page';
import { DefaultLayout } from './layouts/default/default.layout';
import { AdminPage } from './pages/admin/admin.page';
import { authGuard } from '@fhss-web-team/frontend-utils';
import { permissionGuard } from './utils/permission.guard';
import { TasksPage } from './pages/tasks/tasks.page';

export const routes: Routes = [
  {
    path: '',
    component: DefaultLayout,
    children: [
      { path: 'admin', component: AdminPage, canActivate: [permissionGuard(['manage-users-full-access'])] },
      { path: 'tasks', component: TasksPage, canActivate: [permissionGuard(['manage-users-full-access'])] },
      { path: 'server-error', component: ServerErrorPage },
      { path: 'forbidden', component: ForbiddenPage },
      { path: 'auth-error', component: AuthErrorPage },
      { path: '', pathMatch: 'full', component: HomePage },
      { path: '**', component: NotFoundPage },
    ],
  },
];
