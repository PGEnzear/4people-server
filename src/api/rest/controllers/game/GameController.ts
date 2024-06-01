import { ResponseResult } from "@src/types/ResponseResult";
import * as express from "express";

import { controller, httpGet, httpPost, request , response, next } from "inversify-express-utils";

import { TYPES as ApiModuleTypes } from "@src/api/ApiModuleTypes"
import { TYPES as AppModuleTypes } from "@src/app/AppModuleTypes"
import { GameService } from "@src/app/game/GameService";
import { inject } from "inversify";
import { UserService } from "@src/app/user/UserService";
import { ERROR_CODES } from "@src/constants/error_codes";
import { takeOnly } from "@src/utils/takeOnly";

@controller("/game", ApiModuleTypes.VerifyMiddleware)
export class GameController {

    public constructor(
        @inject(AppModuleTypes.GameService)
        private readonly gameService: GameService,
        @inject(AppModuleTypes.UserService)
        private readonly userService: UserService
    ) {}

    @httpPost("/makeStep")
    private async makeStep(
        @request() req: express.Request,
        @response() res: express.Response,
        @next() next: express.NextFunction
    ): Promise<ResponseResult> {

        const index = req.body.index;

        if(!index) return {
            ok: false,
            code: ERROR_CODES.INVALID_BODY
        }

        //@ts-ignore
        const chatId = req.user.id

        const result = await this.gameService.makeStep(chatId, index);
        
        return result

    }
    
    @httpGet('/getAll')
    private async getAllRoom(
        @request() req: express.Request,
        @response() res: express.Response,
        @next() next: express.NextFunction
    ): Promise<ResponseResult> {

        const rooms = await this.gameService.getAllRooms();

        return rooms;

    }        

    @httpGet("/get")
    private async getRoom(
        @request() req: express.Request,
        @response() res: express.Response,
        @next() next: express.NextFunction
    ): Promise<ResponseResult> {

        //@ts-ignore
        const chatId = req.user.id

        const roomId = req.body.roomId;

        const room = await this.gameService.getRoom(roomId);

        const result = room.result?.room
        
        if(!room.ok || !result) return {
            ok: false,
            code: ERROR_CODES.ROOM_DOES_NOT_EXIST
        }

        let openedCells: any[] = [];

        if(room.result?.cells) {
            room.result.cells.forEach((cell: any) => {
                const info = takeOnly(["index", "amount"], cell)
                openedCells.push(info)
            })
        }

        return {
            ok: true,
            result: {
                room: {
                    ...takeOnly(["id", "amount", "status", "cells"], result),
                    openedCells,
                    members: result.members.length,
                    member: !!result.members.find((mem: {chatId: BigInt}) => mem.chatId == BigInt(chatId))
                }
            }
        }

    }

    @httpPost("/disconnect")
    private async disconnectGame(
        @request() req: express.Request,
        @response() res: express.Response,
        @next() next: express.NextFunction
    ): Promise<ResponseResult>  {

        //@ts-ignore
        const chatId = req.user.id

        const user = await this.userService.getUserByChatId(chatId);

        if(!user) return {
            ok: false,
            code: ERROR_CODES.USER_DOES_NOT_EXIST
        }

        const result = await this.gameService.disconnectGame(user.id);

        return result;

    }

    @httpPost("/joinGame")
    private async joinGame(
        @request() req: express.Request,
        @response() res: express.Response,
        @next() next: express.NextFunction
    ): Promise<ResponseResult> {

        //@ts-ignore
        const chatId = req.user.id

        const gameId = req.body.gameId;

        if(!gameId) {
            return {
                ok: false,
                code: ERROR_CODES.INVALID_BODY
            }
        }

        const user = await this.userService.getUserByChatId(chatId)

        if(!user) {
            return {
                ok: false,
                code: ERROR_CODES.USER_DOES_NOT_EXIST
            }
        }

        const result = await this.gameService.joinGame(user.id, gameId);

        if(!result || !result.ok) {
            //@ts-ignore
            return result
        }

        return {
            ok: true,
            result: {
                text: "Joined" 
            }
        };

    }

    @httpPost("/createGame")
    private async create(
        @request() req: express.Request,
        @response() res: express.Response,
        @next() next: express.NextFunction
    ): Promise<ResponseResult> {

        //@ts-ignore
        const userId = req.user.id

        const amount = req.body.amount;

        const user = await this.userService.getRepository().getUserByTgChatId(userId);

        if(!user) return {
            ok: false,
            code: ERROR_CODES.USER_DOES_NOT_EXIST
        }

        const result = await this.gameService.createGame(user.id, amount);

        if(!result.ok) {
            return result
        }

        return {
            ok: true,
            result: {
                text: "Game Created",
                roomId: result.result?.room.id
            }
        };

    }

}