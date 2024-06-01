import { Container, ContainerModule, interfaces } from "inversify";

import { TYPES as DatabaseModuleTypes } from "./DatabaseModuleTypes"

import "@src/api/rest/controllers/payment/PaymentController"
import "@src/api/rest/controllers/user/UserController"

import { CacheConnection } from "./adapters/CacheConnection";
import { DatabaseConnection } from "./adapters/DatabaseConnection";

const databaseContainerBindings = new ContainerModule((bind: interfaces.Bind) => {

    bind<CacheConnection>(DatabaseModuleTypes.CacheConnection).to(CacheConnection);

    bind<DatabaseConnection>(DatabaseModuleTypes.DatabaseConnection).to(DatabaseConnection);

});

const databaseContainer = new Container({ defaultScope: "Singleton" });

databaseContainer.load(databaseContainerBindings);

export default databaseContainer;