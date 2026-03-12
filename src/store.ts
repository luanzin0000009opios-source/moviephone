import { create } from 'zustand';
import { StoryBlock, User } from './types';
import { io, Socket } from 'socket.io-client';

interface StoryState {
  blocks: StoryBlock[];
  selectedBlockId: string | null;
  isPlaying: boolean;
  
  // Multiplayer Network State
  socket: Socket | null;
  username: string | null;
  connectedUsers: Record<string, User>;
  isConnected: boolean;

  // Actions
  login: (username: string) => void;
  setBlocks: (blocks: StoryBlock[], emit?: boolean) => void;
  addBlock: (block: StoryBlock) => void;
  updateBlock: (id: string, updates: Partial<StoryBlock>) => void;
  deleteBlock: (id: string) => void;
  moveBlock: (id: string, direction: 'up' | 'down') => void;
  selectBlock: (id: string | null) => void;
  setPlaying: (playing: boolean) => void;
  updateCursorPosition: (x: number, y: number) => void;
}

export const useStoryStore = create<StoryState>((set, get) => ({
  blocks: [
    {
      id: 'default_offline_bg',
      type: 'background',
      url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000&auto=format&fit=crop',
      transition: 'fade'
    },
    {
      id: 'default_offline_text',
      type: 'dialogue',
      character: 'Narrador',
      text: 'Você está no modo OFFLINE. Inicie o "server.js" para o modo multiplayer!',
      poseUrl: 'https://cdn-icons-png.flaticon.com/512/3667/3667325.png',
      posePosition: 'center'
    }
  ],
  selectedBlockId: 'default_offline_text',
  isPlaying: false,

  socket: null,
  username: null,
  connectedUsers: {},
  isConnected: false,

  login: (username) => {
    // Attempt to connect to local server if running, or default to offline fallback behavior naturally
    const newSocket = io('http://localhost:3001');

    newSocket.on('connect', () => {
      set({ isConnected: true });
      newSocket.emit('join-lobby', username);
    });

    newSocket.on('init-state', (payload) => {
      set({ blocks: payload.blocks, connectedUsers: payload.users });
    });

    newSocket.on('blocks-updated', (newBlocks) => {
      set({ blocks: newBlocks });
    });

    newSocket.on('user-joined', (user: User) => {
      set((state) => ({
        connectedUsers: { ...state.connectedUsers, [user.id]: user }
      }));
    });

    newSocket.on('user-left', (socketId: string) => {
      set((state) => {
        const newUsers = { ...state.connectedUsers };
        delete newUsers[socketId];
        return { connectedUsers: newUsers };
      });
    });

    newSocket.on('cursor-moved', ({ id, x, y }) => {
      set((state) => {
        if (!state.connectedUsers[id]) return state;
        return {
          connectedUsers: {
            ...state.connectedUsers,
            [id]: { ...state.connectedUsers[id], cursorX: x, cursorY: y }
          }
        };
      });
    });

    newSocket.on('disconnect', () => set({ isConnected: false }));

    set({ socket: newSocket, username });
  },

  setBlocks: (blocks, emit = true) => {
    set({ blocks });
    const { socket } = get();
    if (emit && socket) {
      socket.emit('update-blocks', blocks);
    }
  },

  addBlock: (block) => {
    const { blocks, setBlocks } = get();
    setBlocks([...blocks, block], true);
    set({ selectedBlockId: block.id });
  },

  updateBlock: (id, updates) => {
    const { blocks, setBlocks } = get();
    const newBlocks = blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)) as StoryBlock[];
    setBlocks(newBlocks, true);
  },

  deleteBlock: (id) => {
    const { blocks, setBlocks, selectedBlockId } = get();
    setBlocks(blocks.filter((b) => b.id !== id), true);
    if (selectedBlockId === id) set({ selectedBlockId: null });
  },

  moveBlock: (id, direction) => {
    const { blocks, setBlocks } = get();
    const index = blocks.findIndex((b) => b.id === id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;

    const newBlocks = [...blocks];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
    
    setBlocks(newBlocks, true);
  },

  selectBlock: (id) => set({ selectedBlockId: id }),
  setPlaying: (playing) => set({ isPlaying: playing, selectedBlockId: playing ? null : get().selectedBlockId }),
  
  updateCursorPosition: (x, y) => {
    const { socket } = get();
    if (socket) socket.emit('cursor-move', { x, y });
  }
}));