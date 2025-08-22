import { Component, inject, signal } from '@angular/core';
import { TRPC_CLIENT } from '../../utils/trpc.client';
import { trpcResource } from '@fhss-web-team/frontend-utils';

@Component({
  selector: 'app-tasks',
  imports: [],
  templateUrl: './tasks.page.html',
  styleUrl: './tasks.page.scss'
})
export class TasksPage {
  trcp = inject(TRPC_CLIENT);

  PAGE_SIZE = 12;
  pageOffset = signal(0)

  taskResource = trpcResource(
    this.trcp.tasks.getTasksByUser.mutate, 
    () => ({
      pageSize: this.PAGE_SIZE,
      pageOffset: this.pageOffset(),
    }),
    { autoRefresh: true }
  )


}
