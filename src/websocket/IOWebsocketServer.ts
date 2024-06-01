import "reflect-metadata";

import { Server as HttpServer } from "http"

import { injectable } from "inversify";
import { Server as WebsocketServer, Socket } from "socket.io";
import isHashValid from "@src/utils/initData";
import config from "@src/config";
import IncomingUserData from "@src/types/IncomingUserData";
import UserData from "@src/types/UserData";

@injectable()
export class IOWebsocketServer {

	private io!: WebsocketServer;
	
	public users: Map<Socket, number> = new Map<Socket, number>();

	public constructor() {
		this.users = new Map<Socket, number>();
	}

	public emitUser(chatId: number, data: string) {

		this.io.sockets.sockets.forEach((socket) => {
			//@ts-ignore
			if(socket.chatId == chatId) {
				socket.emit(data);
			}
		})

	}

	public async sendMessage(chatId: number, data: object) {

		const message = JSON.stringify(data);

		this.io.sockets.sockets.forEach((socket) => {
			//@ts-ignore
			if(socket.chatId == chatId) {
				return socket.send(message);
			}
		})

	}

	public createServer(server: HttpServer) {

		this.io = new WebsocketServer(server, {
			cors: {
				origin: "*"
			}
		});

		this.io.on("connection", async (socket: Socket) => {
			
			if (!socket.handshake.headers.hash) {
				return;
			}

			const tgHash = socket.handshake.headers.hash;

			const data = Object.fromEntries(new URLSearchParams(tgHash as string));

			const isValid = await isHashValid(data, config.TELEGRAM.TOKEN);

			if (!isValid) {
				socket.emit("close");
				return socket.disconnect();
			}
			
			const payload = data as unknown as IncomingUserData;
	
			const decoded: UserData = JSON.parse(decodeURIComponent(payload.user)) as UserData;

			//@ts-ignore
			socket.chatId = decoded.id;

			this.users.set(socket, decoded.id);

			this.users.set(socket, 0);

			socket.on("disconnect", () => {
				this.users.delete(socket);
			});

		});

	}

}