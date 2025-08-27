import { Component, inject, output, signal } from '@angular/core';
import { MatIconModule } from "@angular/material/icon";
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { trpcResource } from '@fhss-web-team/frontend-utils';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { TRPC_CLIENT } from '../../utils/trpc.client';


@Component({
  selector: 'app-new-task-card',
  imports: [MatIconModule, MatCardModule, MatButtonModule, MatInputModule, FormsModule],
  templateUrl: './new-task-card.component.html',
  styleUrl: './new-task-card.component.scss'
})
export class NewTaskCardComponent {
  trcp = inject(TRPC_CLIENT);
  cancelHandle = output();
  confirmHandle = output();

  newTitle = signal('');
  newDescription = signal('');


  createTask = trpcResource(this.trcp.tasks.createTask.mutate, () => ({
    title: this.newTitle(),
    description: this.newDescription(),
  }))

  async save() {
    await this.createTask.refresh();
    if (!this.createTask.error()) {this.confirmHandle.emit();}
  }

  cancel() {
    this.newTitle.set(''),
    this.newDescription.set(''),
    this.cancelHandle.emit()
  }

  
}
