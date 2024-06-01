import config from "@src/config";
import { FileLoggerService } from "@src/logger/services/FileLoggerService";
import { inject, injectable } from "inversify";

import TelegramBot, { TelegramEvents } from 'node-telegram-bot-api';

import { TYPES as LoggerContainerTypes } from "@logger/LoggerModuleTypes"
import { TYPES as AppModuleTypes } from "@app/AppModuleTypes"
import { TYPES as TelegramModuleTypes } from "@telegram/TelegramModuleTypes"

import { UserService } from "@src/app/user/UserService";
import { TelegramQueryActions } from "../types/TelegramQueryActions";
import { TextEventContext } from "../types/TextEventContext";
import { TelegramTextHandler } from "./TelegramTextHandler";

@injectable()
export class TelegramQueryHandler {

    public constructor(

		@inject(LoggerContainerTypes.FileLoggerService)
		private readonly loggerService: FileLoggerService,

        @inject(AppModuleTypes.UserService)
        private readonly userService: UserService,

        @inject(TelegramModuleTypes.TelegramTextHandler)
        private readonly telegramTextHandler: TelegramTextHandler

    ) {}

    public async ourChatEvent(ctx: TextEventContext, bot: TelegramBot) {

        try {

            await bot.editMessageText(
            `Ссылка на наш чат - t.me/#`,
            {
                ...ctx,
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "В меню",
                                callback_data: TelegramQueryActions.start
                            }
                        ]
                    ]
                }
            })
        } catch(e) {
            console.log(e)
        }

    }

    public async getProfileEvent(ctx: TextEventContext, bot: TelegramBot) {

        const { chat_id } = ctx;
        
        console.log(chat_id)

        const user = await this.userService.getRepository().getUserByTgChatId(chat_id)

        console.log(user)

        if(!user) {
            return;
        }

        try {
            await bot.editMessageText(`\n
    id: ${user.id}
    regTime: ${user.createdAt}
    chatId: ${chat_id}
    username: ${user.username}
    balance: ${user.balance}
    totalgames: 0
    referal: https://t.me/fourpeoplebot?start=${user.id}
            `,
            {
                ...ctx,
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "Назад",
                                callback_data: TelegramQueryActions.start
                            },
                            {
                                text: "Пополнить",
                                callback_data: TelegramQueryActions.deposit
                            },
                            {
                                text : "Вывести",
                                callback_data: TelegramQueryActions.withdraw
                            }
                        ]
                    ]
                }
            })
        } catch(e) {
            console.log(e)
        }


    }

    public start(ctx: TextEventContext, bot: TelegramBot) {

        return this.telegramTextHandler.onStartEvent(ctx, bot, true)

    }

    public async deposit(ctx: TextEventContext, bot: TelegramBot) {

        const { chat_id } = ctx;

        try {
            await bot.editMessageText(`\n
    Выберите сервис для пополнения
            `,
            {
                ...ctx,
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "В меню",
                                callback_data: TelegramQueryActions.start
                            },
                            {
                                text: "Cryptomus",
                                callback_data: TelegramQueryActions.deposit_with_cryptomus
                            }
                        ]
                    ]
                }
            })
        } catch(e) {
            console.log(e)
        }

    }

    public async withdraw(ctx: TextEventContext, bot: TelegramBot) {
        
        const { chat_id } = ctx;
        
        const user = await this.userService.getRepository().getUserByTgChatId(chat_id)

        if(!user) {
            return;
        }

        try {
            await bot.editMessageText(`\n
    Доступно для вывода: ${user.balance}
    Комиссия сервиса: 0%
    Минимальная сумма для вывода: 100руб
            `,
            {
                ...ctx,
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "В меню",
                                callback_data: TelegramQueryActions.start
                            }
                        ]
                    ]
                }
            })
        } catch(e) {
            console.log(e)
        }


    }

    public async depositWithCryptomus(ctx: TextEventContext, bot: TelegramBot) {
        
        const { chat_id } = ctx;

        try {

            await bot.editMessageText(`\n
    Сервис будет доступен после прохождения модерации
            `,
            {
                ...ctx,
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "В меню",
                                callback_data: TelegramQueryActions.start
                            }
                        ]
                    ]
                }
            })
        } catch(e) {
            console.log(e)
        }


    }

    public async handle(bot: TelegramBot) {

        bot.on('callback_query', async (query: TelegramBot.CallbackQuery) => {

            const { data: action, message: msg } = query;

            if(!msg || !msg.from || !msg.from.username) {
                return;
            }

            const context: TextEventContext = {
                chat_id: msg.chat.id,
                message_id: msg.message_id,
                user_id: msg.from.id,
                username: msg.from.username
            };

            switch(action) {
                case TelegramQueryActions["my_profile"]: {
                    await this.getProfileEvent(context, bot)
                    break;
                }
                case TelegramQueryActions["our_chat"]: {
                    await this.ourChatEvent(context, bot)
                    break;
                }
                case TelegramQueryActions["deposit"]: {
                    await this.deposit(context, bot)
                    break;
                }
                case TelegramQueryActions["withdraw"]: {
                    await this.withdraw(context, bot)
                    break;
                }
                case TelegramQueryActions["deposit_with_cryptomus"]: {
                    await this.depositWithCryptomus(context, bot)
                    break;
                }
                case TelegramQueryActions["start"]: {
                    await this.start(context, bot)
                    break;
                }
            }

        });

    }

}