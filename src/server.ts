import expressWs from "express-ws";
import { readFileSync, writeFileSync } from "fs";
import * as express from "express";
import { createWsRouter } from "./ws";

const ex = express.default();
const { app, getWss } = expressWs(ex);
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

app.listen(PORT, () => {
	console.log("🏃 Server running on PORT " + PORT);
});
