import { ResponseResult } from "@src/types/ResponseResult";
import * as express from "express";

import { controller, httpGet, httpPost, request , response, next, requestParam, httpDelete } from "inversify-express-utils";

@controller("/payment")
export class PaymentController {

    public getHello()/*: Promise<ResponseResult>*/ {

        return {
            1: false,
            true: Boolean
        }

    }
}