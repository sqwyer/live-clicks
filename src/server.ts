import expressWs from "express-ws";
import { readFileSync, writeFileSync } from "fs";
import * as express from "express";
import { createWsRouter } from "./ws";
import { createServer } from "https";

const ex = express.default();
let server: any = undefined;
if (process.env.NODE_ENV == "production") {
	server = createServer(
		{
			key: readFileSync("key.pem"),
			cert: readFileSync("cert.pem"),
		},
		ex
	);
}
const { app, getWss } = expressWs(ex, server);
const PORT = process.env.PORT || 3000;

async function init() {
	try {
		readFileSync(`${process.cwd()}/clicks.json`);
	} catch (_err) {
		writeFileSync(`${process.cwd()}/clicks.json`, '{"clicks":0}');
	}
}

init();

app.use(createWsRouter(getWss()));
app.use("/", express.static("static"));

app.get("/api/get", async (_req, res) => {
	try {
		res.json(
			JSON.parse(readFileSync(`${process.cwd()}/clicks.json`).toString())
		);
	} catch (err) {
		await init();
		console.error(err);
		res.json({ clicks: 0 });
	}
});

if (process.env.NODE_ENV == "production") {
	server.listen(PORT, () => {
		console.log("🏃 Server running on PORT " + PORT);
	});
} else {
	app.listen(PORT, () => {
		console.log("🏃 Server running on PORT " + PORT);
	});
}
