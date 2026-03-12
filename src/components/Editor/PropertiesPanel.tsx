import { useStoryStore } from '../../store';
import { BackgroundBlock, DialogueBlock, ChoiceBlock } from '../../types';

export const PropertiesPanel = () => {
  const { blocks, selectedBlockId, updateBlock } = useStoryStore();
  
  const block = blocks.find((b: any) => b.id === selectedBlockId);

  if (!block) {
    return (
      <div className="w-80 bg-slate-900 border-l border-slate-800 p-6 flex flex-col items-center justify-center text-slate-500">
        <p className="text-center">Selecione um bloco na timeline para editar suas propriedades.</p>
      </div>
    );
  }

  const handleChange = (field: string, value: any) => {
    updateBlock(block.id, { [field]: value });
  };

  return (
    <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
        <h3 className="text-white font-semibold flex items-center gap-2">
          Propriedades: <span className="text-indigo-400 capitalize">{block.type}</span>
        </h3>
        <span className="text-xs font-mono text-slate-500 mt-1 block">ID: {block.id}</span>
      </div>

      <div className="p-4 space-y-4">
        {block.type === 'background' && (
          <BackgroundEditor 
            block={block as BackgroundBlock} 
            onChange={handleChange} 
          />
        )}
        {block.type === 'dialogue' && (
          <DialogueEditor 
            block={block as DialogueBlock} 
            onChange={handleChange} 
          />
        )}
        {block.type === 'choice' && (
          <ChoiceEditor 
            block={block as ChoiceBlock} 
            onChange={handleChange} 
          />
        )}
      </div>
    </div>
  );
};

const BackgroundEditor = ({ block, onChange }: { block: BackgroundBlock, onChange: (f: string, v: any) => void }) => (
  <>
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1">Imagem de Fundo (URL)</label>
      <input 
        type="text" 
        value={block.url}
        onChange={(e) => onChange('url', e.target.value)}
        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        placeholder="https://..."
      />
    </div>
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1">Transição</label>
      <select 
        value={block.transition}
        onChange={(e) => onChange('transition', e.target.value)}
        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200"
      >
        <option value="fade">Fade (Suave)</option>
        <option value="instant">Instantâneo (Corte)</option>
      </select>
    </div>
  </>
);

const DialogueEditor = ({ block, onChange }: { block: DialogueBlock, onChange: (f: string, v: any) => void }) => (
  <>
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1">Nome do Personagem</label>
      <input 
        type="text" 
        value={block.character}
        onChange={(e) => onChange('character', e.target.value)}
        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
      />
    </div>
    
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1">Imagem do Personagem (URL)</label>
      <input 
        type="text" 
        value={block.poseUrl || ''}
        onChange={(e) => onChange('poseUrl', e.target.value)}
        placeholder="Ex: https://.../sprite.png"
        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
      />
    </div>
    
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1">Posição na Tela</label>
      <select 
        value={block.posePosition || 'center'}
        onChange={(e) => onChange('posePosition', e.target.value)}
        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
      >
        <option value="left">Esquerda</option>
        <option value="center">Centro</option>
        <option value="right">Direita</option>
      </select>
    </div>

    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1">Texto da Fala</label>
      <textarea 
        value={block.text}
        onChange={(e) => onChange('text', e.target.value)}
        rows={4}
        className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
      />
    </div>
  </>
);

const ChoiceEditor = ({ block, onChange }: { block: ChoiceBlock, onChange: (f: string, v: any) => void }) => {
  const updateOption = (index: number, text: string) => {
    const newOptions = [...block.options];
    newOptions[index].text = text;
    onChange('options', newOptions);
  };

  const addOption = () => {
    onChange('options', [...block.options, { id: Math.random().toString(), text: 'Nova Opção', targetBlockId: null }]);
  };

  return (
    <>
      <label className="block text-xs font-medium text-slate-400 mb-2">Opções Disponíveis</label>
      <div className="space-y-3">
        {block.options.map((opt, idx) => (
          <div key={opt.id} className="bg-slate-950 p-2 rounded border border-slate-800">
             <input 
              type="text" 
              value={opt.text}
              onChange={(e) => updateOption(idx, e.target.value)}
              className="w-full bg-transparent border-b border-slate-700 px-1 py-1 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 mb-2"
            />
            <div className="text-[10px] text-slate-500">Destino: Próximo Bloco na Timeline</div>
          </div>
        ))}
      </div>
      <button 
        onClick={addOption}
        className="w-full mt-2 py-2 border border-dashed border-slate-600 rounded text-slate-400 text-xs hover:text-slate-300 hover:border-slate-500 transition-colors"
      >
        + Adicionar Opção
      </button>
    </>
  )
};