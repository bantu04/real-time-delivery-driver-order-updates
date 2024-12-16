const socket = io('http://172.20.10.2:3000'); // Replace with your computer's IP
const orderList = document.getElementById('orderList');
let mediaRecorder;
let audioChunks = [];

// Clear all orders
function clearAllOrders() {
    socket.emit('clearAllOrders');
}

// Mark an order as ready to collect
function readyToCollect(order) {
    socket.emit('readyToCollect', order);
}

// Update the order list
socket.on('updateOrders', (orders) => {
    orderList.innerHTML = orders.map(order =>
        `<li onclick="readyToCollect('${order}')">${order}</li>`
    ).join('');
});

// Start live announcement
async function startLiveAnnouncement() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
            console.log('Audio chunk captured');
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            audioChunks = [];
            console.log('Broadcasting live announcement');
            console.log('Blob type:', audioBlob.type);
            console.log('Blob size:', audioBlob.size);

            // Convert Blob to ArrayBuffer and send
            audioBlob.arrayBuffer().then((buffer) => {
                socket.emit('liveAnnouncement', buffer); // Send ArrayBuffer
            });
        };

        mediaRecorder.start();
        console.log('Live announcement started...');
    } catch (error) {
        console.error('Error accessing microphone:', error);
    }
}

// Stop live announcement
function stopLiveAnnouncement() {
    if (mediaRecorder) {
        mediaRecorder.stop();
        console.log('Live announcement stopped.');
    }
}
