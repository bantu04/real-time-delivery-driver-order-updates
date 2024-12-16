const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    },
    transports: ['websocket', 'polling'],
});

app.use(express.static('public'));

let orders = [];

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle adding a new order
    socket.on('addOrder', (order) => {
        console.log(`Order added: ${order}`);
        orders.push(order);
        io.emit('updateOrders', orders);
    });

    // Handle marking an order as ready to collect
    socket.on('readyToCollect', (order) => {
        console.log(`Order marked as ready: ${order}`);
        orders = orders.filter((o) => o !== order);
        io.emit('updateOrders', orders);
        io.emit('readyToCollect', order);
    });

    // Handle live announcements
    socket.on('liveAnnouncement', (audioArrayBuffer) => {
        console.log('Received live announcement');

        // Convert ArrayBuffer to Buffer for reliable transmission
        const buffer = Buffer.from(audioArrayBuffer);

        console.log('Buffer size:', buffer.length);

        // Broadcast the Buffer
        socket.broadcast.emit('liveAnnouncement', buffer);
    });

    // Handle clearing all orders
    socket.on('clearAllOrders', () => {
        console.log('Clearing all orders');
        orders = [];
        io.emit('updateOrders', orders);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
