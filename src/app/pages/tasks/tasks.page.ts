import { Component, inject, signal, viewChild } from '@angular/core';
import { TRPC_CLIENT } from '../../utils/trpc.client';
import { ConfirmationDialog, trpcResource } from '@fhss-web-team/frontend-utils';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { TaskCardComponent } from '../../components/task-card/task-card.component';
import { MatDialog } from '@angular/material/dialog';
import { isTRPCClientError } from '@trpc/client';
import { NewTaskCardComponent } from "../../components/new-task-card/new-task-card.component";
import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: 'app-tasks',
  imports: [MatProgressSpinnerModule, MatPaginator, MatIconModule, TaskCardComponent, NewTaskCardComponent, MatButtonModule],
  templateUrl: './tasks.page.html',
  styleUrl: './tasks.page.scss'
})
export class TasksPage {

  matDialog = inject(MatDialog);
  trcp = inject(TRPC_CLIENT);
  paginator = viewChild.required(MatPaginator)

  PAGE_SIZE = 12;
  pageOffset = signal(0)
  showCreate = signal(false)

  handlePageEvent(e: PageEvent) {
    this.pageOffset.set(e.pageIndex * e.pageSize);
  }

  taskResource = trpcResource(
    this.trcp.tasks.getTasksByUser.mutate, 
    () => ({
      pageSize: this.PAGE_SIZE,
      pageOffset: this.pageOffset(),
    }),
    { autoRefresh: true }
  )


  async deleteTask(taskId: string) {
    ConfirmationDialog.open(this.matDialog, { action: 'delete this task' }, async result => {
      if (result) {
        try {
          this.taskResource.isLoading.set(true);
          await this.trcp.tasks.deleteTask.mutate({ taskId });
        } catch (err) {
          this.taskResource.isLoading.set(false);
          if (isTRPCClientError(err) && err.cause?.name !== 'AbortError') {
            this.taskResource.error.set(err as any);
          }
          return;
        }
        await this.taskResource.refresh();
        if (this.pageOffset() != 0 && this.taskResource.value()?.data.length === 0) {
          this.paginator().previousPage();
        }
      }
    });
  }

  async taskCreated() {
    this.showCreate.set(false);
    await this.taskResource.refresh();
  }


}


