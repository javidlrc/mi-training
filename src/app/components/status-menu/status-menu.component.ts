import { Component, model, output } from '@angular/core';
import { TaskStatus } from '../../../../prisma/client';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-status-menu',
  imports: [MatMenuModule, MatButtonModule],
  templateUrl: './status-menu.component.html',
  styleUrl: './status-menu.component.scss'
})
export class StatusMenuComponent {
  taskStatus = model.required<TaskStatus>()

  taskChanged = output()

  async setStatus(newStatus: TaskStatus) {
    this.taskStatus.set(newStatus);
    this.taskChanged.emit();
  }
}
