const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("static"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/static/html/index.html");
});

io.on("connection", (socket) => {
  console.log("a user connected");
  let users = [];

  socket.on("login", (data) => {
    const user = { socketId: socket.id, ...data };
    users.push(user);
    socket.broadcast.emit("update", { type: "connect", ...user });
  });

  socket.on("sendMessage", (message) => {
    const sender = users.find((user) => user.socketId === socket.id);
    socket.broadcast.emit("update", {
      type: "message",
      nickname: sender.nickname,
      displayName: sender.displayName,
      message,
    });
  });

  socket.on("disconnectUser", () => {
    const disconnectedUser = users.find((user) => user.socketId === socket.id);
    if (disconnectedUser) {
      users = users.filter((user) => user.socketId !== socket.id);
      const nickname = disconnectedUser.nickname;
      const displayName = disconnectedUser.displayName;
      socket.broadcast.emit("update", {
        type: "disconnect",
        nickname,
        displayName,
      });
    }
  });
});

const port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});