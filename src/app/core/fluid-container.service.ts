import { Injectable } from '@angular/core';
import { AzureClient, AzureClientProps, AzureContainerServices } from '@fluidframework/azure-client';
import { ConnectionState, ContainerSchema, IFluidContainer, SharedMap } from 'fluid-framework';
import { InsecureTokenProvider } from "@fluidframework/test-runtime-utils";
import { SignalManager } from '@fluid-experimental/data-objects';

type FluidData = {
    container:IFluidContainer, 
    services: AzureContainerServices, 
    sharedMap: SharedMap,
    signaler: SignalManager
};

@Injectable({
    providedIn: 'root'
})
export class FluidContainerService {
    useAzure = process.env.NG_APP_USE_AZURE;

    constructor() {
        console.log('Server location: ' + (this.useAzure === 'true' ? 'Azure' : 'Local'));
     }

    async getFluidData(): Promise<FluidData> {
        let container: IFluidContainer;
        let services: AzureContainerServices;
        let containerId = '';
        const containerSchema: ContainerSchema = {
            initialObjects: {  
                map: SharedMap,
                signaler: SignalManager
            }
        }

        const client = new AzureClient(this.getConnectionConfig());

        const createNew = !location.hash;
        if (createNew) {
            // Create container and add SharedMap and Signaler into the initialObjects
            ({ container, services } = await client.createContainer(containerSchema));
            containerId = await container.attach();
            location.hash = containerId;
        }
        else {
            // Retrieve existing container
            containerId = location.hash.substring(1);
            ({ container, services } = await client.getContainer(containerId, containerSchema));
        }

        if (container.connectionState !== ConnectionState.Connected) {
            await new Promise<void>((resolve) => {
                container.once("connected", () => {
                    console.log('Container connected');
                    resolve();
                });
            });
        }

        // Return container, services, SharedMap, and Signaler from the container
        return { 
            container: container, 
            services: services, 
            sharedMap: container.initialObjects.map as SharedMap,
            signaler: container.initialObjects.signaler as SignalManager
        };
    }

    private getConnectionConfig(): AzureClientProps {
        return this.useAzure === 'true' ? {
            connection: {
                type: 'remote',
                // Information about using a secure token provider can be found here:
                // https://docs.microsoft.com/en-us/azure/azure-fluid-relay/how-tos/connect-fluid-azure-service
                tokenProvider: new InsecureTokenProvider(process.env.NG_APP_PRIMARY_KEY as string, { id: 'userId' }),
                endpoint: process.env.NG_APP_ENDPOINT_URL as string
            }
        } : {
            connection: {
                type: 'local',
                tokenProvider: new InsecureTokenProvider('', { id: 'userId' }),
                endpoint: "http://localhost:7070"
            }
        };
    }
}