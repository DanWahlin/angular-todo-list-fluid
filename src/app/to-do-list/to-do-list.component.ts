import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Item } from '../item';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { FluidModelService } from '../core/fluid-model.service';
import { SharedMap } from 'fluid-framework';

@Component({
  selector: 'app-to-do-list',
  templateUrl: './to-do-list.component.html',
  styleUrls: ['./to-do-list.component.scss'],
})
export class ToDoListComponent implements OnInit {
  todoForm: FormGroup;
  todosSharedMap: SharedMap;

  items: Item[] = [
    { description: 'Get groceries', done: true },
    { description: 'Feed the dog', done: false },
    { description: 'Clean my room', done: false },
    { description: 'Hangout with friends', done: false },
  ];
  done: Item[] = [];

  constructor(private fb: FormBuilder, private fluidModelService: FluidModelService) {}

  async ngOnInit() {
    this.todoForm = this.fb.group({
      item: ['', Validators.required],
    });
    this.todosSharedMap = await this.fluidModelService.getTodosSharedMap();
  }

  addItem(description: string) {
    this.items.unshift({
      description,
      done: false,
    });
    this.fluidModelService.updateTodosSharedMap(this.items);
  }

  deleteItem(item: any) {
    this.items.splice(item, 1);
  }

  deleteDoneItem(item: any) {
    this.done.splice(item, 1);
  }

  drop(event: CdkDragDrop<Item[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
  }
}
