import { DatabaseConnection } from "@src/database/adapters/DatabaseConnection";
import { inject, injectable } from "inversify";

import { TYPES as DatabaseModuleTypes } from "@database/DatabaseModuleTypes"
/*
import { IUserRepository } from "./IUserRepository";

import { PrismaUserResult } from "@src/types/PrismaResult";
*/
import { Prisma } from "@prisma/client";

@injectable()
export class UserRepository {//implements IUserRepository {

    public constructor(
        @inject(DatabaseModuleTypes.DatabaseConnection)
        private readonly databaseConnection: DatabaseConnection
    ) {}

    public getRepo() {
        return this.databaseConnection.getClient().user   
    }

    public getUserByRoomId(roomId: number) {

        return this.getRepo().findFirst({
            where: {
                roomId
            }
        })

    }

    public getUserByTgChatId(chatId: number) {

        return this.getRepo().findFirst({
            where: {
                chatId: chatId
            }
        })

    }

    public getUserById(id: number) {

        return this.getRepo().findFirst({
            where: {
                id
            }
        })

    }

    public createrUser(chatId: number, username: string) {
        
        return this.getRepo().create({
            data: {
                balance: 1000,
                chatId: chatId,
                username,
            }
        })

    }

}