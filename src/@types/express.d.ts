import UserData from "@src/types/UserData";

declare module 'express' {
    interface Request {
        user: UserData
    }
}