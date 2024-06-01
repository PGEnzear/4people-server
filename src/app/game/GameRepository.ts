import { EGameAmount } from "@src/types/EGameAmount";

/*
import { IGameRepository } from "./IGameRepository";

import { PrismaRoomResult } from "@src/types/PrismaResult";
*/

import { TYPES as DatabaseModuleTypes } from "@database/DatabaseModuleTypes"
import { DatabaseConnection } from "@src/database/adapters/DatabaseConnection";
import { inject, injectable } from "inversify";

@injectable()
export class GameRepository {

    public constructor(
        @inject(DatabaseModuleTypes.DatabaseConnection)
        private readonly databaseConnection: DatabaseConnection
    ) {}

    public _getUserRepo() {
        return this.databaseConnection.getClient().user
    }

    public getCellRepo() {
        return this.databaseConnection.getClient().cell
    }

    public getRepo() {
        return this.databaseConnection.getClient().room
    }

    public getWinRepo() {
        return this.databaseConnection.getClient().winAmount
    }

    public async createCell(
        amount: number,
        isBomb: boolean,
        roomId: number,
        index: number,
    ) {

        return this.getCellRepo().create({
            data: {
                index,
                amount,
                isBomb,
                room: {
                    connect: {
                        id: roomId,
                    }
                }
            }
        })

    }
    
    public getCell(roomId: number, index: number) {

        return this.getCellRepo().findFirst({
            where: {
                index,
                roomId
            }
        })

    }

    public async deleteRoom(roomId: number) {
        await this.getCellRepo().deleteMany({
            where: {
                roomId
            }
        })
        await this.getWinRepo().deleteMany({
            where: {
                roomId
            }
        })
        await this.getRepo().delete({
            where: {
                id: roomId
            }
        })
    }

    public async removeUserFromGame(userId: number) {

        const room = await this.getRoomByUserId(userId)

        if(!room) {
            return;
        }

        const result = await this.getRepo().update({
            where: {
                id: room.id
            },
            data: {
                members: {
                    disconnect: {
                        id: userId
                    }
                }
            },
            include: {
                members: true
            }
        })

        if(result.members.length == 0) {
            await this.deleteRoom(room.id)
        }
        
        return result

    }

    public addUserToGame(userId: number, roomId: number) {

        return this.getRepo().update({
            where: {
                id: roomId,
            },
            data: {
                members: {
                    connect: {
                        id: userId
                    }
                }
            },
            include: {
                members: true
            }
        })

    }

    public getRoomById(roomId: number)  {

        return this.getRepo().findFirst({
            where: {
                id: roomId
            },
            include: {
                members: true
            }
        })

    }

    public getRoomByUserId(userId: number, active = false) {        

        return this.getRepo().findFirst({
            where: {
                
                members: {
                    some: {
                        id: userId
                    }
                }
            },
            include: {
                members: true
            }
        })
        
    }

    public createRoom(userId: number, amount: number)  {

        return this.getRepo().create({
            data: {
                amount,
                members: {
                    connect: {
                        id: userId
                    }
                }
            }
        })

    }

}