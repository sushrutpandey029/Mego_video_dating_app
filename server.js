import express from "express";
import { createServer } from "http";
import sequelize from "./Database/MySql.js";

import routernew from './Routes/apiroute.js'

import dotenv from "dotenv";
import { initSocket } from "./socket.js"; // Import your socket initialization function

dotenv.config();
const app = express();
const port = process.env.Port || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', routernew);

// Create HTTP server for socket and express
const server = createServer(app);

console.log(server);

// Initialize Socket.IO with the server
initSocket(server);

const startServer = () => {
    sequelize.sync().then(() => {

        server.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    }).catch((err) => {
        console.error("MySQL connection failed:", err);
    });
};

startServer();
