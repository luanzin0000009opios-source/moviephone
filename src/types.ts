export type BlockType = 'background' | 'dialogue' | 'choice';

export interface BaseBlock {
  id: string;
  type: BlockType;
  title?: string;
}

export interface BackgroundBlock extends BaseBlock {
  type: 'background';
  url: string;
  transition: 'fade' | 'instant';
}

export interface DialogueBlock extends BaseBlock {
  type: 'dialogue';
  character: string;
  text: string;
  poseUrl?: string; // Optional character sprite
  posePosition?: 'left' | 'center' | 'right'; // Position of character on screen
}

export interface User {
  id: string;
  username: string;
  color: string;
  cursorX: number;
  cursorY: number;
}

export interface ChoiceOption {
  id: string;
  text: string;
  targetBlockId: string | null; // Where this choice leads
}

export interface ChoiceBlock extends BaseBlock {
  type: 'choice';
  options: ChoiceOption[];
}

export type StoryBlock = BackgroundBlock | DialogueBlock | ChoiceBlock;

export interface AssetItem {
  id: string;
  type: 'image' | 'audio' | 'sprite';
  url: string;
  name: string;
}
