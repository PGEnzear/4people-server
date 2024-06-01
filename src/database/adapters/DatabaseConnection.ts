import { inject, injectable } from "inversify";
import { PrismaClient } from "@prisma/client";

import { FileLoggerService } from "@logger/services/FileLoggerService";

import { TYPES as LoggerContainerTypes } from "@logger/LoggerModuleTypes"

import "reflect-metadata";

@injectable()
export class DatabaseConnection {

	private client: PrismaClient;

	public constructor(
		@inject(LoggerContainerTypes.FileLoggerService)
		private readonly loggerService: FileLoggerService,
	) {
		this.client = new PrismaClient();
	}

	public getClient() {
		return this.client;
	}

	async connect(): Promise<void> {
		try {
			await this.client.$connect();
			this.loggerService.log("[PrismaService] Connected to database");
		} catch (e) {
			if (e instanceof Error) {
				this.loggerService.error(
					"[PrismaService] Connection failed, message: " + e.message,
				);
			}
		}
	}

	async disconnect(): Promise<void> {
		await this.client.$disconnect();
	}
}