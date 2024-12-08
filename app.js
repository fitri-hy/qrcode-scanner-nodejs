const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let scanResults = [];
let scanCounter = 1;

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('scan-result', (data) => {
        console.log('Scanned Data Received:', data);

        if (!isDuplicate(data)) {
            const result = {
                id: `no${scanCounter++}`,
                qr: data
            };
            scanResults.push(result);
            console.log('Data saved:', result);
        } else {
            console.log('Duplicate data ignored:', data);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

const isDuplicate = (data) => scanResults.some((entry) => entry.qr === data);
