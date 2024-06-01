import { injectable } from "inversify";
import winston from "winston";

import { ILoggerService } from "./IService";

import "reflect-metadata";

@injectable()
export class TelegramLoggerService implements ILoggerService {

	constructor() {
		
	}

}