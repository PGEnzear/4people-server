import { ERROR_CODES } from "../constants/error_codes"

export interface ResponseResultSuccess {

    result: object

}

export interface ResponseResultUnSuccess {

    code: ERROR_CODES
    problem?: string | object

}

export type ResponseResult = {
    ok: boolean,
} & (ResponseResultSuccess | ResponseResultUnSuccess)