import { inject, injectable } from "inversify";


import { TYPES as AppModuleTypes } from "@app/AppModuleTypes"
import { DatabaseConnection } from "@src/database/adapters/DatabaseConnection";
import { UserRepository } from "./UserRepository";
import { ResponseResult } from "@src/types/ResponseResult";
import { ERROR_CODES } from "@src/constants/error_codes";
import { GameService } from "../game/GameService";
import { GameRepository } from "../game/GameRepository";

@injectable()
export class UserService {

	public constructor(
		@inject(AppModuleTypes.UserRepository)
		private readonly userRepository: UserRepository,
		@inject(AppModuleTypes.GameRepository)
		private readonly gameRepository: GameRepository,
	) {}

	public getRepository() {
		return this.userRepository;
	}

	public getUserByChatId(chatId: number) {
		return this.userRepository.getUserByTgChatId(chatId)
	}

	public getMe(userId: number) {

		return this.userRepository.getUserById(userId)

	}

	public async getPlayingRoom(userId: number) {

		return this.gameRepository.getRepo().findFirst({
			where: {
				status: {
					equals: "ingame"
				},
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

	public async getActiveRoom(userId: number) {

		return this.gameRepository.getRepo().findFirst({
			where: {
				status: {
					not: "played"
				},
				members: {
					some: {
						id: userId
					}
				}
			},
		})

	}

	public async addBalance(userId: number, balance: number) {

		try {

			const candidate = await this.userRepository.getUserById(userId);

			if(!candidate) {
				return {
					ok: false,
					code: ERROR_CODES.USER_DOES_NOT_EXIST
				}
			}

			return this.setBalance(userId, candidate.balance + balance)

		} catch(e) {
			return {
				ok: false,
				code: ERROR_CODES.SERVER_ERROR
			}
		}

	}

	public async setBalance(userId: number, balance: number) {

		try {

			const candidate = await this.userRepository.getUserById(userId);

			if(!candidate) {
				return {
					ok: false,
					code: ERROR_CODES.USER_DOES_NOT_EXIST
				}
			}

			const user = await this.userRepository.getRepo().update({
				where: {
					id: userId
				},
				data: {
					balance
				}
			})

			if(!user) {
				return {
					ok: false,
					code: ERROR_CODES.SERVER_ERROR
				}
			}

			return {
				ok: true,
				result: {
					user
				}
			}

		} catch(e) {
			return {
				ok: false,
				code: ERROR_CODES.SERVER_ERROR
			}
		}

	}

	public async registerUser(chatId: number, username: string)  {

		try {
			const candidate = await this.userRepository.getUserByTgChatId(chatId);

			if(candidate) {
				return {
					ok: false,
					code: ERROR_CODES.USER_ALREADY_EXISTS
				}
			}

			const user = await this.userRepository.createrUser(chatId, username);

			if(!user) {
				return {
					ok: false,
					code: ERROR_CODES.SERVER_ERROR
				}
			}

			return {
				ok: true,
				result: {
					user
				}
			}

		} catch(e) {
			return {
				ok: false,
				code: ERROR_CODES.SERVER_ERROR
			}
		}

	}

}