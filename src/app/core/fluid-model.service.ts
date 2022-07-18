import { Injectable } from '@angular/core';
import { SharedMap } from 'fluid-framework';
import { FluidContainerService } from './fluid-container.service';
import { Item } from '../item';
import { BehaviorSubject, Observable } from 'rxjs';
import { SignalManager } from '@fluid-experimental/data-objects';
import { MouseTracker } from './mouse-tracker';
import { FluidData } from '../shared/types';

@Injectable({
    providedIn: 'root'
})
export class FluidModelService {
    todosSharedMap: SharedMap | undefined;
    todoItems: Item[] | undefined;
    doneItems: Item[] | undefined;
    mouseTracker: MouseTracker | undefined;
    syncSharedMap: (() => void) | undefined;
    fluidData: FluidData | undefined;
    private behaviorSubject$ = new BehaviorSubject({todoItems: [] as Item[], doneItems: [] as Item[]});
    behaviorSubjectObservable$: Observable<{todoItems: Item[], doneItems: Item[]}>;

    constructor(private fluidContainerService: FluidContainerService) {
        this.behaviorSubjectObservable$ = this.behaviorSubject$.asObservable();
    }

    async initFluid() {
        if (!this.todosSharedMap) {
            this.fluidData = await this.fluidContainerService.getFluidData();
            this.todosSharedMap = this.fluidData.sharedMap;
            this.syncTodosData();

            // Track mouse movement for all collaborators
            this.mouseTracker = new MouseTracker(
                this.fluidData.container,
                this.fluidData.services.audience,
                this.fluidData.container.initialObjects.signaler as SignalManager,
            );
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