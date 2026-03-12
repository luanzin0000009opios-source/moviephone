import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

// Lobby State
let storyBlocks = [
  {
    id: 'block_start_bg',
    type: 'background',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop',
    transition: 'fade'
  },
  {
    id: 'block_start_text',
    type: 'dialogue',
    character: 'Mestre',
    text: 'Bem-vindo ao NovelMash! Aguarde os outros jogadores entrarem no Lobby Eterno.',
    poseUrl: 'https://cdn-icons-png.flaticon.com/512/3667/3667325.png',
    posePosition: 'center'
  }
];

const connectedUsers = {};

io.on('connection', (socket) => {
  socket.on('join-lobby', (username) => {
    // Generate a random color
    const color = '#' + Math.floor(Math.random()*16777215).toString(16);
    
    connectedUsers[socket.id] = {
      id: socket.id,
      username,
      color,
      cursorX: 0,
      cursorY: 0
    };
    
    socket.join('eternal-lobby');
    
    // Send the current project state to the new user
    socket.emit('init-state', { blocks: storyBlocks, users: connectedUsers });
    
    // Broadcast to others that someone joined
    socket.to('eternal-lobby').emit('user-joined', connectedUsers[socket.id]);
    console.log(`[LOBBY] ${username} joined.`);
  });

  socket.on('update-blocks', (newBlocks) => {
    // Last write wins
    storyBlocks = newBlocks;
    socket.to('eternal-lobby').emit('blocks-updated', storyBlocks);
  });

  socket.on('cursor-move', (pos) => {
    if (connectedUsers[socket.id]) {
      connectedUsers[socket.id].cursorX = pos.x;
      connectedUsers[socket.id].cursorY = pos.y;
      socket.to('eternal-lobby').emit('cursor-moved', { id: socket.id, x: pos.x, y: pos.y });
    }
  });

  socket.on('disconnect', () => {
    const user = connectedUsers[socket.id];
    if (user) {
      delete connectedUsers[socket.id];
      io.to('eternal-lobby').emit('user-left', socket.id);
      console.log(`[LOBBY] ${user.username} left.`);
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`NovelMash Multiplayer Server rodando na porta ${PORT}`);
});