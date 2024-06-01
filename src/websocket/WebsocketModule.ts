import { Container, ContainerModule, interfaces } from "inversify";

import { TYPES as WebsocketModuleTypes } from "./WebsocketModuleTypes"

import { IOWebsocketServer } from "./IOWebsocketServer";

const websocketContainerBindings = new ContainerModule((bind: interfaces.Bind) => {

    bind<IOWebsocketServer>(WebsocketModuleTypes.IOWebsocketServer).to(IOWebsocketServer);

});

const websocketContainer = new Container({ defaultScope: "Singleton" });

websocketContainer.load(websocketContainerBindings);

export default websocketContainer;