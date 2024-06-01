import config from "@src/config";
import { FileLoggerService } from "@src/logger/services/FileLoggerService";
import { inject, injectable } from "inversify";

import TelegramBot, { TelegramEvents } from 'node-telegram-bot-api';

import { TYPES as LoggerContainerTypes } from "@logger/LoggerModuleTypes"

import { TYPES as AppModuleTypes } from "@app/AppModuleTypes"

import { TYPES as TelegramModuleTypes } from "@telegram/TelegramModuleTypes"

import { UserService } from "@src/app/user/UserService";
import { TelegramEventHandler } from "./event/TelegramEventHandler";

@injectable()
export class TelegramBotService {

    private bot!: TelegramBot;

    private token: string;

    public constructor(

		@inject(LoggerContainerTypes.FileLoggerService)
		private readonly loggerService: FileLoggerService,

        @inject(AppModuleTypes.UserService)
        private readonly userService: UserService,

        @inject(TelegramModuleTypes.TelegramEventHandler)
        private readonly eventHandler: TelegramEventHandler

    ) {

        this.token = config.TELEGRAM.TOKEN;

    }

    public async init() {

        this.bot = new TelegramBot(this.token, {polling: true});

    }

    public async getUserAvatar(userId: number) {

        const photos = await this.bot.getUserProfilePhotos(userId);
    
        const file_id = photos.photos[0][1].file_id;
        
        const file = await this.bot.getFile(file_id);

        return `https://api.telegram.org/file/bot${this.token}/${file.file_path}`

    }

    public async listen() {

        this.loggerService.log("[TelegramAPI] Telegram bot start listening")

        this.eventHandler.handle(this.bot);

    }

}