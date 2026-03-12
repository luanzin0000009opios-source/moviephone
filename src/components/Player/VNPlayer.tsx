import { useState, useEffect } from 'react';
import { useStoryStore } from '../../store';
import { motion, AnimatePresence } from 'framer-motion';
import { BackgroundBlock, DialogueBlock, ChoiceBlock } from '../../types';

export const VNPlayer = () => {
  const { blocks, selectedBlockId, isPlaying } = useStoryStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Determine what block to show based on mode
  const activeBlock = isPlaying 
    ? blocks[currentIndex] 
    : blocks.find((b: any) => b.id === selectedBlockId);

  // Find the last background shown before the current block
  const getActiveBackground = () => {
    if (!activeBlock) return null;
    const blockIndex = blocks.findIndex((b: any) => b.id === activeBlock.id);
    for (let i = blockIndex; i >= 0; i--) {
      if (blocks[i].type === 'background') {
        return blocks[i] as BackgroundBlock;
      }
    }
    return null;
  };

  const currentBg = getActiveBackground();

  // Handle advancing the story in Play mode
  const handleNext = () => {
    if (!isPlaying) return;
    if (activeBlock?.type === 'choice') return; // Must click a choice
    if (currentIndex < blocks.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      setCurrentIndex(0);
    }
  }, [isPlaying]);

  return (
    <div 
      className="flex-1 bg-black relative overflow-hidden flex flex-col justify-end"
      onClick={handleNext}
    >
      {/* Background Layer */}
      <AnimatePresence mode="popLayout">
        {currentBg && (
          <motion.div
            key={currentBg.id}
            initial={{ opacity: currentBg.transition === 'fade' ? 0 : 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: currentBg.transition === 'fade' ? 0 : 1 }}
            transition={{ duration: currentBg.transition === 'fade' ? 1 : 0 }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${currentBg.url})` }}
          />
        )}
      </AnimatePresence>

      {!currentBg && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-600">
          Nenhum fundo definido
        </div>
      )}

      {/* Character Sprite Layer */}
      {activeBlock?.type === 'dialogue' && (activeBlock as DialogueBlock).poseUrl && (
        <AnimatePresence>
          <motion.div
            key={(activeBlock as DialogueBlock).poseUrl}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className={`absolute bottom-0 w-full flex ${
              (activeBlock as DialogueBlock).posePosition === 'left' ? 'justify-start pl-20' :
              (activeBlock as DialogueBlock).posePosition === 'right' ? 'justify-end pr-20' :
              'justify-center'
            } pointer-events-none`}
            style={{ height: '70%' }}
          >
             <img 
               src={(activeBlock as DialogueBlock).poseUrl} 
               alt="Character Sprite"
               className="h-full object-contain drop-shadow-2xl"
             />
          </motion.div>
        </AnimatePresence>
      )}

      {/* UI Layer: Dialogue */}
      {activeBlock?.type === 'dialogue' && (
        <div className="relative z-10 w-full p-8 pb-12 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
          <div className="max-w-4xl mx-auto">
            <div className="bg-slate-900/90 border border-slate-700/50 rounded-lg p-6 shadow-2xl backdrop-blur-sm">
              <h4 className="text-xl font-bold text-indigo-400 mb-3 font-serif tracking-wide">
                {(activeBlock as DialogueBlock).character}
              </h4>
              <p className="text-xl text-slate-100 leading-relaxed font-sans">
                {(activeBlock as DialogueBlock).text}
              </p>
            </div>
            {isPlaying && (
              <div className="mt-4 flex justify-end">
                <span className="animate-pulse text-indigo-300 text-sm flex items-center gap-2">
                  Clique para continuar <span className="text-lg">▼</span>
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* UI Layer: Choice */}
      {activeBlock?.type === 'choice' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="space-y-4 w-full max-w-lg">
            {(activeBlock as ChoiceBlock).options.map((opt, i) => (
              <button 
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isPlaying) {
                    // For now, choices just advance linearly unless we implement branching logic based on targetBlockId
                    if (currentIndex < blocks.length - 1) setCurrentIndex(currentIndex + 1);
                  }
                }}
                className="w-full bg-slate-800/90 hover:bg-indigo-600 border border-slate-600 hover:border-indigo-400 text-white p-4 rounded-xl shadow-xl transition-all transform hover:scale-105"
              >
                {opt.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty State Overlay */}
      {!isPlaying && !activeBlock && blocks.length > 0 && (
         <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-none z-10">
            <div className="bg-slate-900/80 px-6 py-3 rounded-full text-slate-300 backdrop-blur border border-slate-700">
               Modo Edição: Clique em um bloco na timeline
            </div>
         </div>
      )}
    </div>
  );
};