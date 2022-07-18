import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Item } from '../item';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { FluidModelService } from '../core/fluid-model.service';
import { Subscription } from 'rxjs';
import { MouseTracker } from '../core/mouse-tracker';
import { v4 as uuid } from 'uuid';
import { AzureMember } from '@fluidframework/azure-client';

@Component({
  selector: 'app-todo-list',
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss'],
})
export class ToDoListComponent implements OnInit {
  todoForm: FormGroup;
  subscription: Subscription;
  myself: AzureMember | undefined;

  @ViewChild('mouseTrackerDiv', { static: true }) mouseTrackerDiv: ElementRef = {} as ElementRef;

  _showUsers = false;
  get showUsers() {
    return this._showUsers;
  }
  set showUsers(value: boolean) {
    this._showUsers = value;
    if (!value) {
      this.mouseTrackerDiv.nativeElement.innerHTML = '';
    }
  }

  items: Item[] = [];
  done: Item[] = [];

  todoItems: Item[] = [];
  doneItems: Item[] = [];

  constructor(private fb: FormBuilder,
    private fluidModelService: FluidModelService) { }

  async ngOnInit() {
    this.todoForm = this.fb.group({
      item: ['', Validators.required],
    });
    await this.fluidModelService.initFluid();
    this.myself = await this.fluidModelService.fluidData?.services.audience.getMyself();

    // Register a handler to update the UI when the shared map changes.
    this.subscription = this.fluidModelService.behaviorSubjectObservable$.subscribe(data => {
      this.todoItems = data.todoItems;
      this.doneItems = data.doneItems;
    });

    this.renderMousePresence(this.fluidModelService.mouseTracker as MouseTracker,
      this.mouseTrackerDiv.nativeElement as HTMLDivElement);
  }

  updateTodosSharedMap() {
    this.fluidModelService.updateTodosSharedMap(this.items, this.done);
  }

  renderMousePresence(mouseTracker: MouseTracker, div: HTMLDivElement) {
    const onPositionChanged = () => {
      if (this.showUsers && this.myself) {
        const myselfUserName = this.myself.userName;
        div.innerHTML = '';
        mouseTracker.getMousePresences().forEach((mousePosition, member) => {
          if (member.userName !== myselfUserName) {
            const posDiv = document.createElement('div');
            posDiv.innerHTML = this.getSvg('person', member.userName, member.additionalDetails.color);
            posDiv.style.position = 'absolute';
            posDiv.style.left = `${mousePosition.x}px`;
            posDiv.style.top = `${mousePosition.y}px`;
            div.appendChild(posDiv);
          }
        });
      }
    };

    onPositionChanged();
    mouseTracker.on('mousePositionChanged', onPositionChanged);
  }

  addItem(description: string) {
    this.items.unshift({
      id: uuid(),
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

  getSvg(type: 'person' | 'cursor', userName: string, color: string) {
    const personSvg = `
      <svg width="60px" height="60px" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24.5 25.98C29.4725 25.98 33.5 21.9227 33.5 16.9133C33.5 11.904 29.4725 7.84668 24.5 7.84668C19.5275 7.84668 15.5 11.904 15.5 16.9133C15.5 21.9227 19.5275 25.98 24.5 25.98Z" fill="${color}"/>
        <path d="M17.3786 29.2021C17.8814 29.0785 18.3971 29.3313 18.6254 29.7991L22.6893 32.7994C24.5 32.799 24.5 32.7995 26.3105 32.7991L30.3746 29.7991C30.6029 29.3313 31.1186 29.0785 31.6214 29.2021C37.0255 30.5301 42.5 33.238 42.5 37.3116V41.845H6.5V37.3116C6.5 33.238 11.9745 30.5301 17.3786 29.2021Z" fill="${color}"/>
        <text x="50%" y="35" fill="${color}">${userName}</text>
      </svg>
    `;
    const cursorSvg = `
      <svg fill="${color}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" width="60px" height="60px">
        <path d="M 9 3 A 1 1 0 0 0 8 4 L 8 21 A 1 1 0 0 0 9 22 A 1 1 0 0 0 9.796875 21.601562 L 12.919922 18.119141 L 16.382812 26.117188 C 16.701812 26.855187 17.566828 27.188469 18.298828 26.855469 C 19.020828 26.527469 19.340672 25.678078 19.013672 24.955078 L 15.439453 17.039062 L 21 17 A 1 1 0 0 0 22 16 A 1 1 0 0 0 21.628906 15.222656 L 9.7832031 3.3789062 A 1 1 0 0 0 9 3 z"/>
        <text x="0" y="40" fill="${color}">${userName}!</text>
      </svg>
    `;
    return (type === 'person') ? personSvg : cursorSvg;
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
