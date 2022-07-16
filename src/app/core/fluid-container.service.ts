import { Injectable } from '@angular/core';
import { AzureClient, AzureClientProps, AzureContainerServices } from '@fluidframework/azure-client';
import { ContainerSchema, IFluidContainer, SharedMap } from 'fluid-framework';
import { InsecureTokenProvider } from "@fluidframework/test-runtime-utils";

@Injectable({
    providedIn: 'root'
})
export class FluidContainerService {
    useAzure = !!process.env.NG_APP_USE_AZURE;
    containerSchema: ContainerSchema = {
        initialObjects: {
            todosSharedMap: SharedMap,
        }
    }

    constructor() { }

    async getFluidData(): Promise<SharedMap> {

        let { containerId, isNew } = this.getContainerId();
        let container: IFluidContainer;
        let services: AzureContainerServices;

        const client = new AzureClient(this.getConnectionConfig());

        if (isNew) {
            ({ container, services } = await client.createContainer(this.containerSchema));
            containerId = await container.attach();
            location.hash = containerId;
        }
        else {
            ({ container, services } = await client.getContainer(containerId, this.containerSchema));
        }

        return container.initialObjects.todosSharedMap as SharedMap;
    }

    private getContainerId(): { containerId: string; isNew: boolean } {
        let containerId = '';
        let isNew = false;

        if (location.hash.length === 0) {
            isNew = true;
        }
        else {
            containerId = location.hash.substring(1);
        }

        return { containerId, isNew };
    }

    private getConnectionConfig(): AzureClientProps {
        return this.useAzure ? {
            connection: {
                type: 'remote',
                // Information about using a secure token provider can be found here:
                // https://docs.microsoft.com/en-us/azure/azure-fluid-relay/how-tos/connect-fluid-azure-service
                tokenProvider: new InsecureTokenProvider(process.env.NG_APP_PRIMARY_KEY as string, { id: "userId" }),
                endpoint: process.env.NG_APP_ENDPOINT_URL as string
            }
        } : {
            connection: {
                type: 'local',
                tokenProvider: new InsecureTokenProvider("fooBar", { id: "userId" }),
                endpoint: "http://localhost:7070"
            }
        };
    }
}