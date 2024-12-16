const socket = io();
let localStream;
let peerConnection;

const servers = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
};

// Handle WebRTC signaling
socket.on('offer', async (offer) => {
    if (!peerConnection) setupPeerConnection();
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit('answer', answer);
});

socket.on('answer', async (answer) => {
    if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }
});

socket.on('ice-candidate', (candidate) => {
    if (peerConnection) {
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
});

function setupPeerConnection() {
    peerConnection = new RTCPeerConnection(servers);

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            socket.emit('ice-candidate', event.candidate);
        }
    };

    peerConnection.ontrack = (event) => {
        const audio = document.getElementById('audioStream');
        audio.srcObject = event.streams[0];
    };
}

// Start audio streaming
async function startAudioStreaming() {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    setupPeerConnection();

    localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit('offer', offer);
}

// Stop audio streaming
function stopAudioStreaming() {
    if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
        localStream = null;
    }
    if (peerConnection) {
        peerConnection.close();
        peerConnection = null;
    }
}
