import { useStoryStore } from '../../store';
import { Image as ImageIcon, MessageSquare, SplitSquareHorizontal, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { clsx } from 'clsx';
import { StoryBlock, BackgroundBlock, DialogueBlock, ChoiceBlock } from '../../types';

export const Timeline = () => {
  const { blocks, addBlock, deleteBlock, moveBlock, selectedBlockId, selectBlock } = useStoryStore();

  const handleAddBlock = (type: 'background' | 'dialogue' | 'choice') => {
    const id = Math.random().toString(36).substr(2, 9);
    
    let newBlock: StoryBlock;
    if (type === 'background') {
      newBlock = { id, type: 'background', url: '', transition: 'fade' } as BackgroundBlock;
    } else if (type === 'dialogue') {
      newBlock = { id, type: 'dialogue', character: 'Novo Personagem', text: '...', poseUrl: '', posePosition: 'center' } as DialogueBlock;
    } else {
      newBlock = { id, type: 'choice', options: [{ id: '1', text: 'Opção 1', targetBlockId: null }] } as ChoiceBlock;
    }
    
    addBlock(newBlock);
  };

  const getIcon = (type: StoryBlock['type']) => {
    switch(type) {
      case 'background': return <ImageIcon className="w-4 h-4 text-blue-500" />;
      case 'dialogue': return <MessageSquare className="w-4 h-4 text-green-500" />;
      case 'choice': return <SplitSquareHorizontal className="w-4 h-4 text-purple-500" />;
    }
  };

  const getPreview = (block: any) => {
     if (block.type === 'background') return '[' + block.transition + '] ' + (block.url || 'Vazio').substring(0, 10) + '...';
     if (block.type === 'dialogue') return block.character + ': ' + block.text.substring(0, 20) + '...';
     if (block.type === 'choice') return block.options.length + ' opções';
     return '';
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 w-80">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center">
        <h2 className="text-white font-semibold flex items-center gap-2 text-sm">
          <SplitSquareHorizontal className="w-4 h-4" /> Timeline
        </h2>
        <div className="flex gap-1">
           <button onClick={() => handleAddBlock('background')} title="Add Scene" className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition-colors"><ImageIcon size={14}/></button>
           <button onClick={() => handleAddBlock('dialogue')} title="Add Dialogue" className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition-colors"><MessageSquare size={14}/></button>
           <button onClick={() => handleAddBlock('choice')} title="Add Choice" className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition-colors"><SplitSquareHorizontal size={14}/></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {blocks.map((block: StoryBlock, index: number) => (
          <div 
            key={block.id}
            onClick={() => selectBlock(block.id)}
            className={clsx(
              "p-2 rounded-lg flex items-center gap-2 cursor-pointer group transition-all duration-200",
              selectedBlockId === block.id 
                ? "bg-indigo-600/20 border border-indigo-500" 
                : "bg-slate-800 border border-slate-700 hover:border-slate-600"
            )}
          >
            <div className="text-slate-500 flex items-center justify-center font-mono text-[10px] w-4 h-4 bg-slate-900 rounded">
              {index + 1}
            </div>
            
            <div className="p-1.5 bg-slate-900 rounded shadow-inner flex-shrink-0">
              {getIcon(block.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-slate-200 text-xs font-medium capitalize truncate">
                {block.type}
              </div>
              <div className="text-slate-400 text-[10px] truncate">
                {getPreview(block)}
              </div>
            </div>

            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all">
              <div className="flex flex-col gap-0.5">
                 <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'up'); }} className="p-0.5 text-slate-500 hover:text-white bg-slate-900 rounded"><ArrowUp size={10} /></button>
                 <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'down'); }} className="p-0.5 text-slate-500 hover:text-white bg-slate-900 rounded"><ArrowDown size={10} /></button>
              </div>
              <button 
                 onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
                 className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
        {blocks.length === 0 && (
           <div className="text-center p-8 text-slate-500 text-xs">
             A timeline está vazia. Adicione blocos para começar a história.
           </div>
        )}
      </div>
    </div>
  );
};