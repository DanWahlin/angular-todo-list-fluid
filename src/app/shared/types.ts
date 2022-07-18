import { SignalManager } from "@fluid-experimental/data-objects";
import { AzureContainerServices } from "@fluidframework/azure-client";
import { IFluidContainer, SharedMap } from "fluid-framework";

export type FluidData = {
    container: IFluidContainer, 
    services: AzureContainerServices, 
    sharedMap: SharedMap,
    signaler: SignalManager
};