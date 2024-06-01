import * as express from "express";

import { controller, httpGet, httpPost, request , response, next, requestParam, httpDelete } from "inversify-express-utils";

import { TYPES as ApiModuleTypes } from "@src/api/ApiModuleTypes"

import { TYPES as AppModuleTypes } from "@src/app/AppModuleTypes"

import { ResponseResult } from "@src/types/ResponseResult";
import { inject } from "inversify";
import { UserService } from "@src/app/user/UserService";
import { takeOnly } from "@src/utils/takeOnly";
import { ERROR_CODES } from "@src/constants/error_codes";

@controller("/user", ApiModuleTypes.VerifyMiddleware)
export class UserController {

    public constructor(
        @inject(AppModuleTypes.UserService)
        private readonly userService: UserService,
    ) {}

    @httpGet("/getMyActiveRoom")
    private async getActiveRoom(
        @request() req: express.Request,
        @response() res: express.Response,
        @next() next: express.NextFunction
    ): Promise<ResponseResult> {
        
        //@ts-ignore
        const chatId = req.user.id

        const user = await this.userService.getUserByChatId(chatId)

        if(!user) return {
            ok: false,
            code: ERROR_CODES.USER_DOES_NOT_EXIST
        }

        const room = await this.userService.getActiveRoom(user.id)

        return {
            ok: true,
            result: {
                room: takeOnly(["id", "amount"], room || {})
            }
        }

    }

    @httpGet("/me")
    private async getMe(
        @request() req: express.Request,
        @response() res: express.Response,
        @next() next: express.NextFunction
    ): Promise<ResponseResult> {
        
        //@ts-ignore
        const userId = req.user.id

        const userResult = await this.userService.getRepository().getUserByTgChatId(userId)

        return {
            ok: true,
            result: {
                me: takeOnly(["id", "balance", "username", "chatId"], userResult || {})
            }
        }

    }

}