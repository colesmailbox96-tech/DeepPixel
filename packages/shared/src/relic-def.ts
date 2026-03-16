import { Rarity, type RelicId } from './types';

/** When a relic effect triggers */
export type RelicTrigger =
  | 'on_kill'
  | 'on_hit'
  | 'on_take_damage'
  | 'on_room_clear'
  | 'on_room_enter'
  | 'passive';

/** What a relic effect does */
export type RelicEffectKind =
  | 'heal'
  | 'bonus_damage'
  | 'damage_reduction'
  | 'bonus_coins'
  | 'bonus_speed'
  | 'thorns'
  | 'lifesteal'
  | 'crit_chance'
  | 'loot_luck';

/** A single relic definition */
export interface RelicDef {
  id: RelicId;
  name: string;
  description: string;
  rarity: Rarity;
  trigger: RelicTrigger;
  effect: RelicEffectKind;
  /** Numeric magnitude of the effect (interpretation depends on effect kind) */
  magnitude: number;
}
