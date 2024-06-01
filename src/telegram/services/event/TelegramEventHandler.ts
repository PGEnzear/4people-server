import { inject, injectable } from "inversify";

import TelegramBot from 'node-telegram-bot-api';

import { TYPES as TelegramModuleTypes } from "@telegram/TelegramModuleTypes"

import { TelegramTextHandler } from "./TelegramTextHandler";
import { TelegramQueryHandler } from "./TelegramQueryHandler";

@injectable()
export class TelegramEventHandler {

    public constructor(

		@inject(TelegramModuleTypes.TelegramTextHandler)
		private readonly telegramTextHandler: TelegramTextHandler,

        @inject(TelegramModuleTypes.TelegramQueryHandler)
        private readonly telegramQueryHandler: TelegramQueryHandler,

    ) {}

    public async handle(bot: TelegramBot) {

        this.telegramTextHandler.handle(bot);
        this.telegramQueryHandler.handle(bot);

    }

}