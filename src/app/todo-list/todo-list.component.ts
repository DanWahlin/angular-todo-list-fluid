import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Item } from '../item';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { FluidModelService } from '../core/fluid-model.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
})
export class ToDoListComponent implements OnInit {
  todoForm: FormGroup;
  subscription: Subscription;

  items: Item[] = [];
  done: Item[] = [];

  todoItems: Item[] = [];
  doneItems: Item[] = [];

  constructor(private fb: FormBuilder, private fluidModelService: FluidModelService) { }

  async ngOnInit() {
    this.todoForm = this.fb.group({
      item: ['', Validators.required],
    });
    await this.fluidModelService.initFluidContainer();

    // Register a handler to update the UI when the shared map changes.
    this.subscription = this.fluidModelService.behaviorSubjectObservable$.subscribe(data => {
      this.todoItems = data.todoItems;
      this.doneItems = data.doneItems;
    });
  }

  updateTodosSharedMap() {
    this.fluidModelService.updateTodosSharedMap(this.items, this.done);
  }

  addItem(description: string) {
    this.items.unshift({
      id: this.uuid(),
      description,
      done: false,
    });
    this.todoForm.reset();
    this.updateTodosSharedMap();
  }

  deleteItem(item: any) {
    this.items.splice(item, 1);
    this.updateTodosSharedMap();
  }

  deleteDoneItem(item: any) {
    this.done.splice(item, 1);
    this.updateTodosSharedMap();
  }

  drop(event: CdkDragDrop<Item[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.items = event.container.data;
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      this.items = (event.previousContainer.id === 'items-container') ? event.previousContainer.data : event.container.data;
      this.done = (event.previousContainer.id === 'done-container') ? event.previousContainer.data : event.container.data;
    }
    this.updateTodosSharedMap();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  uuid() {  
    var uuidValue = "", k, randomValue;  
    for (k = 0; k < 32;k++) {  
      randomValue = Math.random() * 16 | 0;  
    
      if (k == 8 || k == 12 || k == 16 || k == 20) {  
        uuidValue += "-"  
      }  
      uuidValue += (k == 12 ? 4 : (k == 16 ? (randomValue & 3 | 8) : randomValue)).toString(16);  
    }  
    return uuidValue;  
  }  
}
