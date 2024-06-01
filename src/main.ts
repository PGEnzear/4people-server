import "./meta";
import config from "./config";

import { createServer } from "http";

import * as express from "express";
import * as bodyParser from 'body-parser';

import { RootContainer } from "@src/container/production/MainContainer"
import { InversifyExpressServer } from "inversify-express-utils/lib/server";
import { DatabaseConnection } from "@database/adapters/DatabaseConnection";

import { FileLoggerService } from "./logger/services/FileLoggerService";
import { TelegramBotService } from "./telegram/services/TelegramBotService";

import { TYPES as LoggerModuleTypes } from "@logger/LoggerModuleTypes";
import { TYPES as TelegramModuleTypes } from "@telegram/TelegramModuleTypes";
import { TYPES as DatabaseModuleTypes } from "@database/DatabaseModuleTypes";
import { TYPES as WebsocketModuleTypes } from "@src/websocket/WebsocketModuleTypes";

import cors from "cors";

import { Server } from "socket.io";
import websocketContainer from "./websocket/WebsocketModule";
import { IOWebsocketServer } from "./websocket/IOWebsocketServer";

const corsOptions = {
    credentials: true,
    optionSuccessStatus: 200
}

const {
	SERVER
} = config;

const bootstrap = async () => {

    try {

        const databaseConnection: DatabaseConnection = RootContainer.get<DatabaseConnection>(
            DatabaseModuleTypes.DatabaseConnection
        );
        const telegramAPI: TelegramBotService = RootContainer.get<TelegramBotService>(
            TelegramModuleTypes.TelegramBotService
        );
        const loggerService: FileLoggerService = RootContainer.get<FileLoggerService>(
            LoggerModuleTypes.FileLoggerService
        );
        const ioWebsocketServer: IOWebsocketServer = RootContainer.get<IOWebsocketServer>(
            WebsocketModuleTypes.IOWebsocketServer
        );

        loggerService.log("[APP] Loded config: ");

        await telegramAPI.init();
        await telegramAPI.listen();
        await databaseConnection.connect();

        const server = new InversifyExpressServer(RootContainer, null, {rootPath: "/api"});

        server.setConfig((app) => {

			app.use(bodyParser.urlencoded({
				extended: true
			}));
            
            app.use(cors());

			app.use(bodyParser.json());

            app.use(express.json());

		});

		const app = server.build();

        app.use((req, res) => {
            res.status(400);
            res.send({
                error: "invalid api path"
            })
        })

        app.use(cors(corsOptions))

		const httpInstance = app.listen(SERVER.PORT, () => {
			loggerService.log(`[API] HTTP Server started on port: ${SERVER.PORT}`)
		});

        const ioServer = ioWebsocketServer.createServer(httpInstance)

    } catch(e) {

        console.log(e)

    }

}

bootstrap();