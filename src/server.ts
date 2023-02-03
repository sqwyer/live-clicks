import expressWs from 'express-ws';
import {readFileSync, writeFileSync} from "fs";
import * as express from 'express';

const { app, getWss, applyTo } = expressWs(express.default());
const PORT = process.env.PORT || 3000;

async function init() {
    try {
        readFileSync(`${process.cwd()}/clicks.json`);
    } catch(_err) {
        writeFileSync(`${process.cwd()}/clicks.json`, '{"clicks":0}');
    }
}

init();

app.use('/', express.static('static'));

app.ws('/ws', (ws) => {

    getWss().clients.forEach(client => {
        client.send(JSON.stringify({type:'connections',connections:getWss().clients.size}));
    })

    ws.on('message', async function(msg: 'click') {
        if(msg == 'click') {
            try {
                const clicks = JSON.parse(readFileSync(`${process.cwd()}/clicks.json`).toString()).clicks + 1;
                getWss().clients.forEach(client => {
                    client.send(JSON.stringify({type:'clicks',clicks}));
                })
                writeFileSync(`${process.cwd()}/clicks.json`, `{"clicks":${clicks}}`);
            } catch(err) {
                await init();
                console.error(err);
            }
        }
    });

    ws.on('close', async function() {
        getWss().clients.forEach(client => {
            client.send(JSON.stringify({type:'connections',connections:getWss().clients.size}));
        })
    })
});

app.get('/api/get', async (_req, res) => {
    try {
        res.json(JSON.parse(readFileSync(`${process.cwd()}/clicks.json`).toString()));
    } catch(err) {
        await init();
        console.error(err);
        res.json({clicks: 0})
    }
})

app.listen(PORT, () => {
    console.log('🏃 Server running on PORT ' + PORT);
});