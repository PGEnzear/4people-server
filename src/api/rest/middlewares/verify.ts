import * as express from "express"

import config from "@src/config";
import { injectable, inject } from "inversify";
import { BaseMiddleware } from "inversify-express-utils";

import crypto from "node:crypto";
import IncomingUserData from "@src/types/IncomingUserData";
import UserData from "@src/types/UserData";

import isHashValid from "@src/utils/initData";

import { TYPES as AppModuleTypes } from "@app/AppModuleTypes"
import { UserRepository } from "@src/app/user/UserRepository";

const TELEGRAM_BOT_TOKEN = config.TELEGRAM.TOKEN

@injectable()
export class VerifyMiddleware extends BaseMiddleware {

    public constructor(
        @inject(AppModuleTypes.UserRepository)
        private readonly userRepository: UserRepository
    ) {
        super();
    }

    public async handler(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) {

        /* DEVELOPMENT
        if(req.body.chatId) {
            //@ts-ignore
            req.user = {
                id: parseInt(req.body.chatId)
            }

            return next();
    
        }*/

        const {headers: {['hash']: tgHash}} = req;

        if(!tgHash) {
            return res.json({
                ok: false,
                result: `unauthorized`
            })
        }

        const data = Object.fromEntries(new URLSearchParams(tgHash as string));

        const isValid = await isHashValid(data, config.TELEGRAM.TOKEN);
      
        if (!isValid) {
            return res.status(403).json({ error: 'Invalid hash' });
        }

        const payload = data as unknown as IncomingUserData;

        const decoded: UserData = JSON.parse(decodeURIComponent(payload.user)) as UserData;

        //@ts-ignore
        req.user = decoded

        return next();

    }
}