import { Injectable } from '@angular/core';
import { SharedMap } from 'fluid-framework';
import { AzureMember } from '@fluidframework/azure-client';
import { FluidContainerService } from './fluid-container.service';

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

    constructor(private fluidContainerService: FluidContainerService) { }

    async getTodosSharedMap() {
        if (!this.todosSharedMap) {
            this.todosSharedMap = await this.fluidContainerService.getFluidData();
            this.syncTodosData();
        }

        return this.todosSharedMap;
    }

    updateTodosSharedMap(todos: any[]) {
        if (this.todosSharedMap) {
            this.todosSharedMap.set('todos', todos);
        }
    }

    private syncTodosData() {
        // Only sync if the Fluid SharedMap object is defined.
        if (this.todosSharedMap) {
          // TODO 4: Set the value of the localTimestamp state object that will appear in the UI.
          const updateTodosSharedMap = () => { this.todosSharedMap = this.todosSharedMap!.get('todos')};
          updateTodosSharedMap();
    
          // TODO 5: Register handlers.
          this.todosSharedMap!.on("valueChanged", updateTodosSharedMap);
        }
      }
}