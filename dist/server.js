"use strict";
// import { createServer } from "http";
// import dotenv from "dotenv";
// import app from "./app";
// import runMigrations from "./utils/runMigrations";
// // Load environment variables
// dotenv.config();
// // Define the server configuration
// const port: number = parseInt(process.env.PORT || "3000", 10);
// const hostname: string = process.env.DB_HOST || "localhost";
// // Create the HTTP server
// const server = createServer(app);
// // Uncomment if WebSocket integration is needed
// /*
// import { Server } from "socket.io";
// const io = new Server(server, {
//   cors: {
//     origin: ["http://localhost:3000"], // Update with your client URL
//   },
// });
// // Attach the Socket.IO instance to the app
// app.set("socketio", io);
// // Handle WebSocket connections
// io.on("connection", (socket) => {
//   console.log("User connected", socket.id);
//   // Handle disconnect event
//   socket.on("disconnect", () => {
//     console.log("User disconnected", socket.id);
//   });
// });
// */
// // Start the server and run migrations
// server.listen(port, async () => {
//   try {
//     // await runMigrations();
//     console.log(`Server running on http://${hostname}:${port}`);
//   } catch (error) {
//     console.error("Error running migrations:", error);
//   }
// });
