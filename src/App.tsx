import { useEffect } from 'react';
import { useStoryStore } from './store';
import { Timeline } from './components/Editor/Timeline';
import { PropertiesPanel } from './components/Editor/PropertiesPanel';
import { VNPlayer } from './components/Player/VNPlayer';
import Login from './components/Login';
import { Play, Square, Users, Wand2, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const isPlaying = useStoryStore((state) => state.isPlaying);
  const setPlaying = useStoryStore((state) => state.setPlaying);
  const username = useStoryStore((state) => state.username);
  const isConnected = useStoryStore((state) => state.isConnected);
  const connectedUsers = useStoryStore((state) => state.connectedUsers);
  const updateCursorPosition = useStoryStore((state) => state.updateCursorPosition);

  // Send real mouse cursor positions to the Lobby
  useEffect(() => {
    if (!username) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      // Throttle or send directly (for this demo, we'll send every event, but in prod we'd throttle)
      updateCursorPosition(e.clientX, e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [username, updateCursorPosition]);

  if (!username) {
    return <Login />;
  }

  const usersArray = Object.values(connectedUsers);

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Wand2 size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-wide">NovelMash</h1>
            <p className="text-[10px] text-slate-400 -mt-1 uppercase tracking-widest">
              Lobby: <span className="text-indigo-400 font-semibold">{username}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={"flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold " + (isConnected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400')}>
            {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
            {isConnected ? 'Online' : 'Conectando/Offline'}
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400">
            <Users size={14} /> {usersArray.length + 1} na Sala
          </div>
          
          <div className="h-6 w-px bg-slate-800 mx-2" />

          {!isPlaying ? (
            <button 
              onClick={() => setPlaying(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded shadow-lg font-medium transition-all transform hover:scale-105"
            >
              <Play size={16} fill="currentColor" /> Jogar História
            </button>
          ) : (
            <button 
              onClick={() => setPlaying(false)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-5 py-2 rounded shadow-lg font-medium transition-all"
            >
              <Square size={16} fill="currentColor" /> Parar Teste
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Editor Layout */}
        {!isPlaying && <Timeline />}
        
        {/* The Game / Preview Engine */}
        <VNPlayer />
        
        {!isPlaying && <PropertiesPanel />}

        {/* Real Multiplayer Cursors Layer */}
        <AnimatePresence>
          {usersArray.map(user => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0 }}
              animate={{ x: user.cursorX, y: user.cursorY, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "tween", duration: 0.1, ease: 'linear' }}
              className="absolute pointer-events-none z-50 flex flex-col items-start"
              style={{ left: 0, top: 0 }}
            >
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 drop-shadow-md" style={{ color: user.color }}>
                  <path d="m3 3 7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/>
                  <path d="m13 13 6 6"/>
               </svg>
               <div className="mt-1 px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-lg" style={{ backgroundColor: user.color }}>
                 {user.username}
               </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;