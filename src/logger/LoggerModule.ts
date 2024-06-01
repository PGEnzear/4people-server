import { Container, ContainerModule, interfaces } from "inversify";

import { TYPES as LoggerModuleTypes } from "./LoggerModuleTypes"

import "@src/api/rest/controllers/payment/PaymentController"
import "@src/api/rest/controllers/user/UserController"

import { FileLoggerService } from "./services/FileLoggerService";
import { TelegramLoggerService } from "./services/TelegramLoggerService";

const loggerContainerBindings = new ContainerModule((bind: interfaces.Bind) => {

    bind<FileLoggerService>(LoggerModuleTypes.FileLoggerService).to(FileLoggerService);

    bind<TelegramLoggerService>(LoggerModuleTypes.TelegramLoggerService).to(TelegramLoggerService);

});

const loggerContainer = new Container({ defaultScope: "Singleton" });

loggerContainer.load(loggerContainerBindings);

export default loggerContainer;