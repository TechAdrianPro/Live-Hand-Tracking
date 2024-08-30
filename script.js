// script.js
const video = document.getElementById('video');
const canvas = document.getElementById('output');
const ctx = canvas.getContext('2d');

// Access the camera
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
        console.log("Camera is working.");
    })
    .catch(err => {
        console.error("Error accessing the camera: ", err);
    });

// Load MediaPipe Hands
const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

hands.onResults(onResults);

function onResults(results) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
            drawHand(landmarks);
        }
        console.log("Points drawn on canvas.");
    } else {
        console.log("No hands detected.");
    }
}

function drawHand(landmarks) {
    // Draw points
    landmarks.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x * canvas.width, point.y * canvas.height, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'blue';
        ctx.fill();
    });

    // Draw lines connecting points
    const connections = [
        [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
        [0, 5], [5, 6], [6, 7], [7, 8], // Index finger
        [0, 9], [9, 10], [10, 11], [11, 12], // Middle finger
        [0, 13], [13, 14], [14, 15], [15, 16], // Ring finger
        [0, 17], [17, 18], [18, 19], [19, 20] // Little finger
    ];

    connections.forEach(pair => {
        const [start, end] = pair;
        ctx.beginPath();
        ctx.moveTo(landmarks[start].x * canvas.width, landmarks[start].y * canvas.height);
        ctx.lineTo(landmarks[end].x * canvas.width, landmarks[end].y * canvas.height);
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 2;
        ctx.stroke();
    });

    // Draw hand contours
    ctx.beginPath();
    landmarks.forEach((point, index) => {
        if (index === 0) {
            ctx.moveTo(point.x * canvas.width, point.y * canvas.height);
        } else {
            ctx.lineTo(point.x * canvas.width, point.y * canvas.height);
        }
    });
    ctx.closePath();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;
    ctx.stroke();
}

// Initialization
const camera = new Camera(video, {
    onFrame: async () => {
        await hands.send({ image: video });
    },
    width: 640,
    height: 480
});
camera.start();
