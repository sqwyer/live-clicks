import { Router } from "express";
import { readFileSync, writeFileSync } from "fs";
import { type Server, type WebSocket } from "ws";

export function createWsRouter(wss: Server<WebSocket>) {
	const wsRouter = Router();
	wsRouter.ws("/ws", (ws) => {
		wss.clients.forEach((client) => {
			client.send(
				JSON.stringify({
					type: "connections",
					connections: wss.clients.size,
				})
			);
		});
		ws.on("message", async function (msg: "click") {
			if (msg == "click") {
				try {
					const clicks =
						JSON.parse(
							readFileSync(
								`${process.cwd()}/clicks.json`
							).toString()
						).clicks + 1;
					wss.clients.forEach((client) => {
						client.send(JSON.stringify({ type: "clicks", clicks }));
					});
					writeFileSync(
						`${process.cwd()}/clicks.json`,
						`{"clicks":${clicks}}`
					);
				} catch (error) {
					try {
						readFileSync(`${process.cwd()}/clicks.json`);
					} catch (_err) {
						writeFileSync(
							`${process.cwd()}/clicks.json`,
							'{"clicks":0}'
						);
					}
				}
			}
		});
		ws.on("close", async function () {
			wss.clients.forEach((client) => {
				client.send(
					JSON.stringify({
						type: "connections",
						connections: wss.clients.size,
					})
				);
			});
		});
	});
	return wsRouter;
}
