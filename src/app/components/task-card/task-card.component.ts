import { Component, inject, input, linkedSignal, output, signal } from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { trpcResource } from '@fhss-web-team/frontend-utils';
import { MatIconModule } from "@angular/material/icon";
import { MatInput } from "@angular/material/input";
import type { Task, TaskStatus } from '../../../../prisma/client';
import { MatFormFieldModule } from "@angular/material/form-field";
import { FormsModule } from '@angular/forms';
import { TRPC_CLIENT } from '../../utils/trpc.client';
import { MatMenuModule } from '@angular/material/menu';
import { StatusMenuComponent } from "../status-menu/status-menu.component";


@Component({
  selector: 'app-task-card',
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatInput, MatFormFieldModule, FormsModule, MatMenuModule, StatusMenuComponent],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss'
  
})

export class TaskCardComponent {
  initialTaskValue = input.required<Task>();
  editMode = signal<boolean>(false);
  readonly trpc = inject(TRPC_CLIENT)

  newTitle = linkedSignal(() => this.initialTaskValue().title);
  newDescription = linkedSignal(() => this.initialTaskValue().description);
  updatedStatus = signal<TaskStatus>('Incomplete');


  taskCardState = trpcResource(this.trpc.tasks.updateTask.mutate, () => ({
    taskId: this.initialTaskValue().id,
    newTitle: this.newTitle(),
    newDescription: this.newDescription(),
    updatedStatus: this.updatedStatus()
  }), { valueComputation: () =>  this.initialTaskValue() });

  save() {
    this.taskCardState.value.update((prevTask) => {
      if(prevTask === undefined) return undefined
      return {
        ...prevTask,
        title: this.newTitle(),
        description: this.newDescription()
      }
    })
    this.taskCardState.refresh();
    this.editMode.set(false);
  }

  cancel() {
    this.newTitle.set(this.taskCardState.value()?.title ?? '')
    this.newDescription.set(this.taskCardState.value()?.description ?? '')
    this.toggleEdit()
  }

  toggleEdit() {
    this.editMode.update(prevTask => !prevTask)
  }

  deleteTaskEvent = output<string>();

  delete() {
    this.deleteTaskEvent.emit(this.initialTaskValue().id);
  }

}
