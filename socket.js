import { Server } from "socket.io";

export const initSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        socket.on("sendMessage", (data) => {
            console.log(`Sending message: ${data.message}`);
            io.emit("receiveMessage", data); // Broadcast the message to all clients
        });

        socket.on("disconnect", () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });
};

