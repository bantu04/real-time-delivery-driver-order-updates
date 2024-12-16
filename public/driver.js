const socket = io('http://172.20.10.2:3000'); // Replace with your computer's IP
const orderList = document.getElementById('orderList');
const readyToCollectList = document.getElementById('readyToCollectList');

// Add a new order
function addOrder() {
    const orderInput = document.getElementById('driverInput');
    const order = orderInput.value;
    if (order) {
        socket.emit('addOrder', order);
        orderInput.value = '';
    }
}

// Update the order list
socket.on('updateOrders', (orders) => {
    orderList.innerHTML = orders.map(order => `<li>${order}</li>`).join('');
});

// Update the "Ready to Collect" list
socket.on('readyToCollect', (order) => {
    const li = document.createElement('li');
    li.textContent = order;
    readyToCollectList.appendChild(li);

    setTimeout(() => {
        li.remove();
    }, 120000);
});

// Play live announcements
socket.on('liveAnnouncement', (buffer) => {
    console.log('Playing live announcement');
    console.log('Received buffer size:', buffer.byteLength);

    try {
        // Reconstruct the Blob from the Buffer
        const audioBlob = new Blob([buffer], { type: 'audio/webm' });
        const blobURL = URL.createObjectURL(audioBlob);

        const audio = new Audio();
        audio.src = blobURL;
        audio.play().catch((err) => {
            console.error('Audio playback error:', err);
        });
    } catch (error) {
        console.error('Error reconstructing Blob or playing audio:', error);
    }
});
