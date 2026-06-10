// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const cors = require('cors');
// require('dotenv').config();
// const connectDB = require('./config/db.js');

// // 1. Database Connect karein
// connectDB();

// const app = express();
// const server = http.createServer(app);

// // 2. Global Middlewares
// app.use(cors());
// app.use(express.json()); // Body parsing integration

// // 3. Routes Imports
// const authRoutes = require('./routes/authRoutes');
// const rideRoutes = require('./routes/rideRoutes');

// // 4. Routes Middleware Pipeline
// app.use('/api/auth', authRoutes);
// app.use('/api/rides', rideRoutes);

// // 5. Socket.io Configuration Layer
// const io = new Server(server, {
//     cors: {
//         origin: "*", 
//         methods: ["GET", "POST", "PUT"]
//     }
// });

// // Basic Base Route Check
// app.get('/', (req, res) => {
//     res.send('Campus Ride Platform Backend is running smoothly...');
// });

// // 6. Real-Time Event Handlers (Socket.io Symphony with Room Management)
// io.on('connection', (socket) => {
//     console.log(`User secure-connected: ${socket.id}`);

//     // [ROOM INTEGRATION] Driver login hote hi apne unique room mein join karega
//     socket.on('join_driver_room', (driverId) => {
//         if (driverId) {
//             socket.join(`driver_${driverId}`);
//             console.log(`🎯 Driver strictly registered into secure room: driver_${driverId}`);
//         }
//     });

//     // [EVENT 1] Jab passenger ride request submit kare
//     socket.on('request_ride', (rideData) => {
//         console.log('New Ride Request Received:', rideData);
//         // Saare active drivers ko notify karo
//         io.emit('ride_requested', rideData);
//     });

//     // [EVENT 2] Jab koi driver request ko accept kare
//     socket.on('accept_ride', (acceptData) => {
//         console.log('Ride Accepted by Driver:', acceptData);
//         // Passenger ko live match update notify karo
//         io.emit('ride_accepted_passenger', acceptData);
//     });

//     // [EVENT 3] Ride complete/destination drop event (FIXED payload destructuring)
//     socket.on('ride_completed', (data) => {
//         // data mein ab frontend se rideId aur driverId dono aa rahe hain
//         console.log(`Ride Lifecycle closed. ID: ${data.rideId} by Driver: ${data.driverId}`);
        
//         // Passenger ko object form mein details broadcast karo taaki frontend read kar sake
//         io.emit('ride_finished', { 
//             rideId: data.rideId, 
//             driverId: data.driverId, 
//             status: 'completed' 
//         });
//     });

//     // [EVENT 4] FIXED: Passenger rating submitted - Route directly to target driver room
//     socket.on('update_driver_rating_live', (payload) => {
//         console.log(`⚡ Live Rating Route Event: Sending to driver_${payload.driverId}`, payload.review);
        
//         // Target specific driver dynamically using Socket Rooms
//         io.to(`driver_${payload.driverId}`).emit('update_driver_rating_live_client', {
//             newAverage: payload.newAverage,
//             review: payload.review
//         });
//     });

//     // Client connection loss cleanup
//     socket.on('disconnect', () => {
//         console.log(`User network-disconnected: ${socket.id}`);
//     });
// });

// // 7. Core Server Initialization
// const PORT = process.env.PORT || 5000;
// server.listen(PORT, () => {
//     console.log(`🚀 Server blasting out beautifully on port ${PORT}`);
// });

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db.js');

connectDB();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
const rideRoutes = require('./routes/rideRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);

const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST", "PUT"] }
});

app.get('/', (req, res) => {
    res.send('Campus Ride Platform Backend is running smoothly...');
});

// Live drivers tracking structure
let onlineDriversCount = 0;

io.on('connection', (socket) => {
    console.log(`User secure-connected: ${socket.id}`);

    // Broadcast current initial online drivers count
    socket.emit('update_online_drivers_count', onlineDriversCount);

    socket.on('join_driver_room', (driverId) => {
        if (driverId) {
            socket.join(`driver_${driverId}`);
            console.log(`🎯 Driver registered into secure room: driver_${driverId}`);
        }
    });

    // Handle Live Driver Availability Updates
    socket.on('driver_status_toggle', (status) => {
        if (status === 'online') onlineDriversCount++;
        else if (status === 'offline' && onlineDriversCount > 0) onlineDriversCount--;
        
        io.emit('update_online_drivers_count', onlineDriversCount);
    });

    socket.on('request_ride', (rideData) => {
        console.log('New Ride Request Received:', rideData);
        io.emit('ride_requested', rideData);
    });

    socket.on('accept_ride', (acceptData) => {
        console.log('Ride Accepted by Driver:', acceptData);
        io.emit('ride_accepted_passenger', acceptData);
    });

    socket.on('ride_started_live', (rideId) => {
        io.emit('ride_started_passenger', { rideId, status: 'in_progress' });
    });

    socket.on('ride_completed', (data) => {
        console.log(`Ride Lifecycle closed. ID: ${data.rideId}`);
        io.emit('ride_finished', { 
            rideId: data.rideId, 
            driverId: data.driverId, 
            status: 'completed' 
        });
    });

    socket.on('ride_cancelled_live', (rideId) => {
        io.emit('ride_cancelled_client', rideId);
    });

    socket.on('update_driver_rating_live', (payload) => {
        io.to(`driver_${payload.driverId}`).emit('update_driver_rating_live_client', {
            newAverage: payload.newAverage,
            review: payload.review
        });
    });

    socket.on('disconnect', () => {
        console.log(`User network-disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server blasting out beautifully on port ${PORT}`);
});