import { Container, ContainerModule, interfaces } from "inversify";

import { TYPES as TelegramModuleTypes } from "./TelegramModuleTypes"

import "@src/api/rest/controllers/payment/PaymentController"
import "@src/api/rest/controllers/user/UserController"

import { TelegramBotService } from "./services/TelegramBotService";
import { TelegramQueryHandler } from "./services/event/TelegramQueryHandler";
import { TelegramEventHandler } from "./services/event/TelegramEventHandler";
import { TelegramTextHandler } from "./services/event/TelegramTextHandler";

const telegramContainerBindings = new ContainerModule((bind: interfaces.Bind) => {

    bind<TelegramBotService>(TelegramModuleTypes.TelegramBotService).to(TelegramBotService);

    bind<TelegramEventHandler>(TelegramModuleTypes.TelegramEventHandler).to(TelegramEventHandler);
    bind<TelegramQueryHandler>(TelegramModuleTypes.TelegramQueryHandler).to(TelegramQueryHandler);
    bind<TelegramTextHandler>(TelegramModuleTypes.TelegramTextHandler).to(TelegramTextHandler);

});

const telegramContainer = new Container({ defaultScope: "Singleton" });

telegramContainer.load(telegramContainerBindings);

export default telegramContainer;