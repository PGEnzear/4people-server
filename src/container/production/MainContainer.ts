import { Container } from "inversify";

import loggerContainer from "@logger/LoggerModule";
import telegramContainer from "@telegram/TelegramModule";
import databaseContainer from "@database/DatabaseModule";
import apiContainer from "@api/ApiModule";
import appContainer from "@app/AppModule";
import websocketContainer from "@src/websocket/WebsocketModule";

const RootContainer = Container.merge(
	loggerContainer,
    telegramContainer,
    databaseContainer,
    appContainer,
    apiContainer,
    websocketContainer
);

export { RootContainer };