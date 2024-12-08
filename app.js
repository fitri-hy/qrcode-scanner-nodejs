const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let scanResults = [];
let productData = [];

let scanCounter = 1;

app.use(express.json());
app.use(express.static('public'));

app.post('/api/product', (req, res) => {
    const { id, name, price } = req.body;

    if (!id || !name || !price) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    productData.push({ id, name, price });
    res.status(200).json({ success: true, message: 'Product added successfully' });
});

app.get('/api/product/:id', (req, res) => {
    const productId = req.params.id;
    const product = productData.find(p => p.id === productId);

    if (product) {
        res.json({ success: true, data: product });
    } else {
        res.status(404).json({ success: false, message: 'Product not found' });
    }
});

app.get('/api/scanner', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/api/data', (req, res) => {
    res.json({
        success: true,
        data: scanResults,
    });
});

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
