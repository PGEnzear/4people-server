import "../../src/meta"

import config from "@src/config";

import * as express from "express";
import * as bodyParser from 'body-parser';

import { RootContainer } from "@src/container/production/MainContainer"
import { UserService } from "@src/app/user/UserService";

import { TYPES as AppModuleTypes } from "@src/app/AppModuleTypes"

import fs from "node:fs"
import path from "node:path"

interface fakeUser {
    chatId: number,
    balance: number,
    username: string
}

const bootstrap = async () => {

    try {

        const fakeUsers = JSON.parse(fs.readFileSync(
            path.join(__dirname, "data.json")).toString()).fakeUsers

        const userService: UserService = RootContainer.get<UserService>(
            AppModuleTypes.UserService
        );

        fakeUsers.forEach(async (fakeUser: fakeUser) => {
            
            const userRequest = await userService.registerUser(fakeUser.chatId, fakeUser.username)
            
            if(userRequest.ok) {
                
                const user = userRequest.result?.user!

                console.log(user.id)

                await userService.setBalance(user.id, fakeUser.balance);

                console.log(user)
            }

        })

    } catch(e) {

        console.log(e)

    }

}

bootstrap();