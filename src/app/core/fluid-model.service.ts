import { Injectable } from '@angular/core';
import { SharedMap } from 'fluid-framework';
import { AzureMember } from '@fluidframework/azure-client';
import { FluidContainerService } from './fluid-container.service';
import { Item } from '../item';
import { BehaviorSubject, Observable } from 'rxjs';

export type TodoModel = Readonly<{
    createTodo(todoId: string, myAuthor: AzureMember): any;
    moveTodo(todoId: string, newPos: number): void;
    setChangeListener(listener: () => void): void;
    removeChangeListener(listener: () => void): void;
}>;

@Injectable({
    providedIn: 'root'
})
export class FluidModelService {
    todosSharedMap: SharedMap | undefined;
    todoItems: Item[] | undefined;
    doneItems: Item[] | undefined;
    syncSharedMap: (() => void) | undefined;
    private behaviorSubject$ = new BehaviorSubject({todoItems: [] as Item[], doneItems: [] as Item[]});
    behaviorSubjectObservable$: Observable<{todoItems: Item[], doneItems: Item[]}>;

    constructor(private fluidContainerService: FluidContainerService) {
        this.behaviorSubjectObservable$ = this.behaviorSubject$.asObservable();
    }

    async initSharedMap() {
        if (!this.todosSharedMap) {
            const fluidData = await this.fluidContainerService.getFluidData();
            this.todosSharedMap = fluidData.sharedMap;
            this.syncTodosData();
        }
    }

    updateTodosSharedMap(todoItems: Item[], doneItems: Item[]) {
        if (this.todosSharedMap) {
            this.todosSharedMap.set('todoItems', todoItems);
            this.todosSharedMap.set('doneItems', doneItems);
        }
    }

    private syncTodosData() {
        // Only sync if the Fluid SharedMap object is defined.
        if (this.todosSharedMap) {
          // TODO 4: Set the value of the localTimestamp state object that will appear in the UI.
          this.syncSharedMap = () => { 
            this.todoItems = this.todosSharedMap!.get('todoItems') ?? [];
            this.doneItems = this.todosSharedMap!.get('doneItems') ?? [];

            // Notify listeners that shared map data has changed.
            this.behaviorSubject$.next({todoItems: this.todoItems, doneItems: this.doneItems});
          };
          this.syncSharedMap();
    
          // TODO 5: Register handlers.
          this.todosSharedMap!.on('valueChanged', this.syncSharedMap);
        }
      }
}