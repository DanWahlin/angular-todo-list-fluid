# TodoList with the Fluid Framework

This is based on a project originally created by [Haroun](https://github.com/harounchebbi/angular-to-do-list-with-drag-drop).

### Running the App Locally
1. Open a command window.
1. Run `npm install`
1. Run `npm run frs:local` to start the local version of the Fluid Relay Service.
1. Run `npm run start:local` to launch the app.

### Running the App using Azure Fluid Relay Service
1. Create a new Azure Fluid Relay resource using the [Azure Portal](https://portal.azure.com).
1. Visit `Settings --> Access Keys` for the newly created Azure Fluid Relay resource in the Azure Portal.
1. Copy the `Primary Key` value into a text editor.
1. Copy the `Service Endpoint` value into a text editor.
1. Create an `.env` file at the root of the `Angular-Todo-List-Fluid` project and add the following keys/values. Replace the placeholders with the values you copied into your text editor:

    ```
    NG_APP_PRIMARY_KEY=<Primary_Key_Value>
    NG_APP_ENDPOINT_URL=<Service_Endpoint_Value>
    NG_APP_USE_AZURE=true
    ```
1. Open a command window.
1. Run `npm install`
1. Run `npm run start:frs` to launch the app.



