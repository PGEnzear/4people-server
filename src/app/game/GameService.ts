import { EGameAmount } from "@src/types/EGameAmount";
import { inject, injectable } from "inversify";

import { GameRepository } from "./GameRepository";

import { TYPES as AppModuleTypes } from "@app/AppModuleTypes"
import { TYPES as WebsocketModuleTypes } from "@src/websocket/WebsocketModuleTypes"

import { ResponseResult } from "@src/types/ResponseResult";
import { ERROR_CODES } from "@src/constants/error_codes";
import { UserService } from "../user/UserService";
import { takeOnly } from "@src/utils/takeOnly";
import shuffleArray from "@src/utils/shuffleArray";
import { IOWebsocketServer } from "@src/websocket/IOWebsocketServer";
import config from "@src/config";

@injectable()
export class GameService {

    public constructor(
        @inject(AppModuleTypes.GameRepository)
        private readonly gameRepository: GameRepository,
        @inject(AppModuleTypes.UserService)
        private readonly userService: UserService,
        @inject(WebsocketModuleTypes.IOWebsocketServer)
        private readonly ioWebsocketServer: IOWebsocketServer
    ) {}
    
    public async getAllRooms() {

        let rooms = await this.gameRepository.getRepo().findMany({
            where: {
                status: "waiting"
            },
            include: {
                members: true
            }
        });

        rooms = rooms.filter((room: {members: any[]}) => room.members.length < 4)

        let result: unknown[] = []

        rooms.forEach((_room: {members: any[]}) => {

            const room = takeOnly(["id", "amount"], _room)

            result.push({ ...room, players: _room.members.length })

        })
        
        return {
            ok: true,
            result: {
                rooms: result
            }
        }
    }

    public generateRandomPattern = (amount: number) => {

        const per = amount / 5

        const result = []

        for(let i = 0;i<5;i++) {

            const lim = Math.floor(per / 2) + 1;

            const amount1 = (Math.floor(Math.random() * lim) + 1)
            const amount2 = (Math.floor(Math.random() * lim) + 1)

            const amount3_ = per - (amount1 + amount2)

            const amount3 = parseFloat((Math.round(amount3_ * 100) / 100).toFixed(1))

            result.push(amount1, amount2, amount3)

        }

        const shuffled = shuffleArray(result)

        return shuffled
      
    }

    public async createCellsPattern(amount: number, roomId: number) {

        const pattern = this.generateRandomPattern(amount);

        const cells: any[] = [];
        
        const bombId = Math.floor(Math.random() * 15) + 1;

        const bomb = await this.gameRepository.createCell(0, true, roomId, bombId);

        for(let i = 0;i<15;i++) {

            let index = i;

            if(index >= bombId) {
                index+=1;
            }

            const amount = pattern[i]
            
            const cell = await this.gameRepository.createCell(amount, false, roomId, index);

            cells.push(cell)

        }

        const result = [...cells, bomb]

        return result

    }

    public async disconnectGame(userId: number) {

        const roomCandidate = await this.gameRepository.getRoomByUserId(userId);

        if(!roomCandidate) {
            return {
                ok: false,
                code: ERROR_CODES.ROOM_DOES_NOT_EXIST
            }
        }

        if(roomCandidate.status == "ingame") {
            return {
                ok: false,
                code: ERROR_CODES.CANT_DISCONNECT_IN_PROGRESS_GAME
            }
        }

        await this.gameRepository.removeUserFromGame(userId)

        //@ts-ignore
        roomCandidate.members.forEach(async (member: {
            chatId: number,
            id: number,
            userId: number
        }) => {
            if(member.id !== userId) {
                const userId = parseInt(`${member.chatId}`)
                this.ioWebsocketServer.sendMessage(userId, {
                    "event": "playerDisconnected"
                })
            }
        })

        return {
            ok: true,
            result: {
                room: roomCandidate
            }
        } 

    }

    public async getRoom(roomId: number) {

        const roomCandidate = await this.gameRepository.getRoomById(roomId);

        if(!roomCandidate) {
            return {
                ok: false,
                code: ERROR_CODES.INVALID_BODY
            }
        }

        const cells = await this.gameRepository.getCellRepo().findMany({
            where: {
                roomId,
                isOpen: true
            }
        });

        if(roomCandidate.status=="ingame") {
            return {
                ok: true,
                result: {
                    room: roomCandidate,
                    cells
                }
            }
        } else {
            return {
                ok: true,
                result: {
                    room: roomCandidate,
                }
            }
        }


    }

    public async startGame(roomId: number) {

        const room = await this.gameRepository.getRoomById(roomId);

        if(!room) {
            return {
                ok: false,
                error: ERROR_CODES.ROOM_DOES_NOT_EXIST
            }
        }

        if(room.status=="ingame") {
            return {
                ok: false,
                error: ERROR_CODES.GAME_ALREADY_STARTED
            }
        }

        if(room.members.length==1) {
            return {
                ok: false,
                error: ERROR_CODES.NOT_ENOUGH_MEMBERS
            }
        }

        const queue: number[] = []

        //@ts-ignore
        room.members.forEach((user: {id: number}) => {
            queue.push(user.id)
        })

        const shuffled = shuffleArray(queue)

        //@ts-ignore
        room.members.forEach(async (member: {
            id: number,
            balance: number,
            chatId: number
        }) => {

            await this.userService.setBalance(member.id, member.balance - (room.amount / room.members.length));
            await this.gameRepository.getWinRepo().create({
                data: {
                    roomId: room.id,
                    userId: member.id,
                }
            })

            const userId = parseInt(`${member.chatId}`)

            this.ioWebsocketServer.sendMessage(userId, {
                "event": "gameStarted"
            })

        })

        await this.gameRepository.getRepo().update({
            where: {
                id: room.id
            },
            data: {
                status: "ingame",
                stepQueue: shuffled,
            }
        })

        return {
            ok: true,
            result: "Game started"
        }

    }

    public async finishGame(roomId: number, loserId: number) {

        const room = await this.gameRepository.getRoomById(roomId);

        if(!room) {
            return {
                ok: false,
                code: ERROR_CODES.ROOM_DOES_NOT_EXIST
            }
        }
        
        const winResults = await this.gameRepository.getWinRepo().findMany({
            where: {
                roomId: room.id,
            }
        })

        let otherTotalWinResult = 0;

        winResults.forEach((winResult: {amount: number}) => {
            otherTotalWinResult += winResult.amount
        })

        const gameWin = room.amount - room.amount * 0.01

        const sharedWin = gameWin - otherTotalWinResult

        const sharedWinPart = sharedWin / (room.members.length - 1)

        console.log(winResults)
        console.log(otherTotalWinResult, gameWin, sharedWin, sharedWinPart)

        //@ts-ignore
        winResults.forEach(async (winResult: {amount: number, userId: number}) => {
            console.log(winResult)
            if(winResult.userId != loserId) {
                const win = winResult.amount + sharedWinPart
                await this.userService.addBalance(winResult.userId, win)
            }
        })

        //@ts-ignore
        room.members.forEach(async (member: {chatId: number}) => {
            const userId = parseInt(`${member.chatId}`)
            if(loserId != userId) {
                this.ioWebsocketServer.sendMessage(userId, {
                    "event": "gameFinished"
                })
            }
        })

        await this.gameRepository.getRepo().update({
            where: {
                id: roomId
            },
            data: {
                status: "played"
            }
        })

        await this.gameRepository.deleteRoom(room.id)

        return {
            ok: true,
            result: {
                message: "Game finished"
            }
        }

    }

    public async makeStep(chatId: number, _index: number) {

        const index = _index - 1;

        const user = await this.userService.getUserByChatId(chatId);

        if(!user) {
            return {
                ok: false,
                code: ERROR_CODES.USER_DOES_NOT_EXIST
            }
        }

        const room = await this.userService.getPlayingRoom(user.id);

        if(!room) {
            return {
                ok: false,
                code: ERROR_CODES.ROOM_DOES_NOT_EXIST
            }
        }

        if(user.id!=room.stepQueue[room.queue]) {
            return {
                ok: false,
                code: ERROR_CODES.NOT_YOUR_TURN
            }
        }

        const cell = await this.gameRepository.getCell(room.id, index);

        if(!cell) {
            return {
                ok: false,
                code: ERROR_CODES.SERVER_ERROR
            }
        }

        if(cell.isOpen) {
            return {
                ok: false,
                code: ERROR_CODES.CELL_ALREADY_OPEN
            }
        }

        if(cell.isBomb) {

            const winResult = await this.gameRepository.getWinRepo().findFirst({
                where: {
                    userId: user.id,
                    roomId: room.id
                }
            })

            if(!winResult) {
                return {
                    ok: false,
                    code: ERROR_CODES.SERVER_ERROR
                }
            }

            await this.userService.setBalance(user.id, user.balance + winResult?.amount)

            await this.finishGame(room.id, user.id);

            return {
                ok: true,
                result: {
                    message: "You lose",
                    win: winResult?.amount
                }
            }

        }

        const updatedCell = await this.gameRepository.getCellRepo().update({
            where: {
                id: cell.id
            },
            data: {
                isOpen: true
            }
        })

        let newQueue = room.queue + 1

        const userWinAmount = await this.gameRepository.getWinRepo().findFirst({
            where: {
                userId: user.id
            }
        })

        if(!userWinAmount) {
            return {
                ok: false,
                code: ERROR_CODES.SERVER_ERROR
            }
        }

        await this.gameRepository.getWinRepo().update({
            where: {
                id: userWinAmount.id
            },
            data: {
                amount: userWinAmount.amount + cell.amount
            }
        })

        //@ts-ignore
        room.members.forEach((member: {
            chatId: number,
        }) => {
            const userId = parseInt(`${member.chatId}`)
            this.ioWebsocketServer.sendMessage(userId, {
                "event": "openCell",
                "data": {
                    index: _index,
                    amount: updatedCell.amount,
                }
            })
        })

        if(newQueue >= room.members.length) {
            newQueue = 0;
        }

        const userByQueue = room.stepQueue[newQueue]

        this.ioWebsocketServer.sendMessage(userByQueue, {
            "event": "yourTurn"
        })

        const updatedRoom = await this.gameRepository.getRepo().update({
            where: {
                id: room.id
            },
            data: {
                queue: newQueue
            }
        })

        return {
            ok: true,
            result: {
                cell: takeOnly(["isBomb", "amount"], cell)
            }
        }

    }

    public async joinGame(userId: number, roomId: number) {

        const creatorCandidate = await this.userService
            .getRepository()
            .getUserById(userId);

        if(!creatorCandidate) {
            return {
                ok: false,
                code: ERROR_CODES.USER_DOES_NOT_EXIST
            }
        }

        const roomCandidate = await this.gameRepository
            .getRoomByUserId(creatorCandidate.id);

        if(roomCandidate && roomCandidate.id == roomId) {
            if(roomCandidate.status=="ingame") return {
                ok: false,
                error: ERROR_CODES.IN_ROOM
            }
        }

        if(roomCandidate) {
            return {
                ok: false,
                code: ERROR_CODES.IN_ANOTHER_ROOM
            }
        }

        const room = await this.gameRepository.getRoomById(roomId);

        if(!room) {
            return {
                ok: false,
                code: ERROR_CODES.ROOM_DOES_NOT_EXIST,
                problem: "Room does not exist"
            }
        }

        if(creatorCandidate.balance < room?.amount) {
            return {
                ok: false,
                code: ERROR_CODES.NOT_ENOUGH_MONEY,
                problem: "Not enough money"
            }
        }

        if(room.members.length >= 4) {
            return {
                ok: false,
                code: ERROR_CODES.TO_MANY_USERS_IN_ROOM,
                problem: "Too many users in room"
            }
        }

        //@ts-ignore
        room.members.forEach(async (member: {
            chatId: number,
            id: number
        }) => {
            if(member.id !== userId) {
                const userId = parseInt(`${member.chatId}`)
                this.ioWebsocketServer.sendMessage(userId, {
                    "event": "playerJoined"
                })
            }
        })

        const updated = await this.gameRepository.addUserToGame(creatorCandidate.id, room.id);

        if(updated.members.length == 2) {
            setTimeout(() => {
                this.startGame(updated.id)
            }, config.GAME.START_TIME * 1000)
        }

        return {
            ok: true,
            result: {
                event: "Joined"
            }
        }

    }

    public async createGame(userId: number, amount: number) {

        const creatorCandidate = await this.userService
            .getRepository()
            .getUserById(userId);

        if(!creatorCandidate) {
            return {
                ok: false,
                code: ERROR_CODES.USER_DOES_NOT_EXIST
            }
        }

        const roomCandidate = await this.gameRepository.getRoomByUserId(creatorCandidate.id);

        if(roomCandidate && roomCandidate.status=="ingame") {
            return {
                ok: false,
                code: ERROR_CODES.IN_ANOTHER_ROOM
            }
        }

        const gameAmount = amount - amount * 0.01

        const room = await this.gameRepository.createRoom(creatorCandidate.id, amount);
        
        const gamePattern = await this.createCellsPattern(gameAmount, room.id);

        return {
            ok: true,
            result: {
                room
            }
        }

    }

}