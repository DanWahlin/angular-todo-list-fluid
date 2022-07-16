import { Injectable } from '@angular/core';
import { AzureClient, AzureClientProps, AzureContainerServices } from '@fluidframework/azure-client';
import { ConnectionState, ContainerSchema, IFluidContainer, SharedMap } from 'fluid-framework';
import { InsecureTokenProvider } from "@fluidframework/test-runtime-utils";

@Injectable({
    providedIn: 'root'
})
export class FluidContainerService {
    useAzure = process.env.NG_APP_USE_AZURE;
    containerSchema: ContainerSchema = {
        initialObjects: {  map: SharedMap }
    }
    container: IFluidContainer;
    services: AzureContainerServices;

    constructor() { }

    async getFluidData(): Promise<{container:IFluidContainer, services: AzureContainerServices, sharedMap: SharedMap}> {
        await this.getFluidContainer();
        // Return container, services, and SharedMap from the container
        return { 
            container: this.container, 
            services: this.services, 
            sharedMap: this.container.initialObjects.map as SharedMap
        };
    }

    async getFluidContainer() {
        let container: IFluidContainer;
        let services: AzureContainerServices;
        let { containerId, isNew } = this.getContainerId();
        const client = new AzureClient(this.getConnectionConfig());
        console.log('Server location: ' + (this.useAzure === 'true' ? 'Azure' : 'Local'));

        if (isNew) {
            // Create container and add SharedMap into the initialObjects
            ({ container, services } = await client.createContainer(this.containerSchema));
            containerId = await container.attach();
            location.hash = containerId;
        }
        else {
            // Retrieve existing container
            ({ container, services } = await client.getContainer(containerId, this.containerSchema));
        }

        this.container = container;
        this.services = services;

        if (this.container.connectionState !== ConnectionState.Connected) {
            await new Promise<void>((resolve) => {
                this.container.once("connected", () => {
                    console.log('Container connected');
                    resolve();
                });
            });
        }
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
        return this.useAzure === 'true' ? {
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
                tokenProvider: new InsecureTokenProvider("", { id: "userId" }),
                endpoint: "http://localhost:7070"
            }
        };
    }
}