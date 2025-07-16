const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

app.use(cors());

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Store active rides
const rides = {}; 

// Handle connections
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Driver joins a ride
    socket.on("driverJoin", (rideId) => {
        socket.join(rideId);
        rides[rideId] = { driver: socket.id };
        console.log(`Driver joined ride: ${rideId}`);
    });

    // Rider joins the same ride room
    socket.on("riderJoin", (rideId) => {
        socket.join(rideId);
        console.log(`Rider joined ride: ${rideId}`);
    });

    // Driver sends live location
    socket.on("shareLocation", ({ rideId, location }) => {
        if (rides[rideId]) {
            console.log(`Updating location for ride ${rideId}:`, location);
            socket.to(rideId).emit("updateLocation", location);
        }
    });

    // Handle disconnect
    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

// Start server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
