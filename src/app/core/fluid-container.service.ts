import { Injectable } from '@angular/core';
import { AzureClient, AzureRemoteConnectionConfig, AzureContainerServices, AzureLocalConnectionConfig } from '@fluidframework/azure-client';
import { ConnectionState, ContainerSchema, IFluidContainer, SharedMap } from 'fluid-framework';
import { InsecureTokenProvider } from "@fluidframework/test-runtime-utils";
import { SignalManager } from '@fluid-experimental/data-objects';
import { v4 as uuid } from 'uuid';
import { FluidData } from '../shared/types';

@Injectable({
    providedIn: 'root'
})
export class FluidContainerService {
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

        const client = new AzureClient(this.connectionConfig);

        console.log(this.userConfig);

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

    private userConfig =  {
        id: uuid(),
        name: this.getRandomName(),
        additionalDetails: {
            color: this.getRandomColor()
        }
    };

    private remoteConnectionConfig: AzureRemoteConnectionConfig = {
            tenantId: process.env.NG_APP_TENANT_ID as string,
            type: 'remote',
            // Information about using a secure token provider can be found here:
            // https://docs.microsoft.com/en-us/azure/azure-fluid-relay/how-tos/connect-fluid-azure-service
            tokenProvider: new InsecureTokenProvider(process.env.NG_APP_PRIMARY_KEY as string, this.userConfig),
            endpoint: process.env.NG_APP_ENDPOINT_URL as string
    };

    private localConnectionConfig: AzureLocalConnectionConfig = {
        type: 'local',
        tokenProvider: new InsecureTokenProvider('', this.userConfig),
        endpoint: 'http://localhost:7070'
    };

    private useAzure = process.env.NG_APP_USE_AZURE;

    private connectionConfig = {
        connection: this.useAzure === 'true' ? this.remoteConnectionConfig : this.localConnectionConfig
    }

    private getRandomName(): string {
        const peopleNames = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'George', 'Hannah', 'Irene', 'Jack', 'Karen', 'Linda', 'Molly', 'Nancy', 'Olivia', 'Peter', 'Quelle', 'Richard', 'Susan', 'Tina', 'Ursula', 'Vicky', 'Wendy', 'Xavier', 'Yvonne', 'Zoe'];
        return peopleNames[Math.floor(Math.random() * peopleNames.length)];
    }

    private getRandomColor(): string {
        const colors = ['red', 'green', 'blue', 'orange', 'purple', 'brown', 'chocolate', 'coral', 'cyan', 'darkblue', 'darkgreen', 'darkred', 'darkyellow', 'darkorange', 'darkpurple', 'darkpink', 'darkbrown', 'darkchocolate', 'darkcoral', 'darkcyan', 'cornflowerblue'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

}