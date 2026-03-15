import { Difficulty } from './types';

/** Contract definition — a mission the player can undertake */
export interface ContractDef {
  id: string;
  name: string;
  description: string;
  difficulty: Difficulty;
  roomCount: number;
}
