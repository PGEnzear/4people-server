import config from "@src/config";
import { FileLoggerService } from "@src/logger/services/FileLoggerService";
import { inject, injectable } from "inversify";

import TelegramBot, { TelegramEvents } from 'node-telegram-bot-api';

import { TYPES as LoggerContainerTypes } from "@logger/LoggerModuleTypes"

import { TYPES as AppModuleTypes } from "@app/AppModuleTypes"
import { UserService } from "@src/app/user/UserService";
import { TelegramQueryActions } from "../types/TelegramQueryActions";
import { TextEventContext } from "../types/TextEventContext";

interface User {
    id: number,
    chatId: number,
    username: string
}

@injectable()
export class TelegramTextHandler {

    public constructor(

		@inject(LoggerContainerTypes.FileLoggerService)
		private readonly loggerService: FileLoggerService,

        @inject(AppModuleTypes.UserService)
        private readonly userService: UserService

    ) {}

    public async onStartEvent(ctx: TextEventContext, bot: TelegramBot, edit: Boolean = false) {

        const text = `
            Приветствую в игроком боте 4people, выберите действие
        `

        const textConfig: TelegramBot.SendMessageOptions = {
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "Мой профиль",
                            callback_data: TelegramQueryActions.my_profile
                        },
                        {
                            text: "Наш чат",
                            callback_data: TelegramQueryActions.our_chat
                        },
                        {
                            text : "Начать играть",
                            web_app: {
                                url: config.WEB.URL
                            }
                        }
                    ]
                ]
            }
        }

        if(edit) {
            try {
                //@ts-ignore
                return await bot.editMessageText(text, {...ctx, ...textConfig});
            } catch(e) {
                console.log(e);
            }

        }

        const { user_id, chat_id, username } = ctx;

        const candidate = await this.userService.getRepository().getUserByTgChatId(user_id);

        let user;

        if(!candidate) {

            const createUserRequest = await this.userService.registerUser(user_id, username)

            if(!createUserRequest.ok) {
                return await bot.sendMessage(chat_id, "Прошла ошибка взаимодействия, попробуйте позже")
            }

            //@ts-ignore
            user = createUserRequest.result?.user as User

            //await bot.sendMessage(chat_id, "новый пользователь зарегистрирован")
            //await bot.sendMessage(chat_id, `id: ${user.id} \n chatId: ${user.chatId} \n username: ${user.username}`)

        }
        
        try {
            await bot.sendMessage(chat_id, text, textConfig);
        } catch(e) {
            console.log(e)
        }

    }

    public async handle(bot: TelegramBot) {

        bot.on("message", async (msg) => {

            console.log(msg)
        
        })

        bot.onText(/\/start/, async (msg) => {

            if(!msg || !msg.from || !msg.from.username || (msg.from.username=="fourpeoplebot")) {
                return;
            }

            const context = {
                chat_id: msg.chat.id,
                message_id: msg.message_id,
                user_id: msg.from.id,
                username: msg.from.username,
            };
            
            console.log(context)

            await this.onStartEvent(context, bot)
        
        });

    }

}