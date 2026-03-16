/**
 * Phase 9 — Art Direction Types
 *
 * Shared type definitions for the art pipeline: palette families, sprite
 * specifications, icon standards, and VFX descriptors. These types are the
 * canonical reference consumed by tooling scripts and the client renderer.
 */

// ── Palette Types ─────────────────────────────────────────────────────────────

/** A single colour expressed as a 6-digit hex string (no # prefix). */
export type HexColor = string;

/**
 * A palette family groups semantically related colours used together across
 * a particular context (biome, UI state, rarity tier, etc.).
 */
export interface PaletteFamily {
  /** Human-readable name, e.g. "Sewer" or "Common Rarity". */
  readonly name: string;
  /** Primary colour — dominant fill / background. */
  readonly primary: HexColor;
  /** Secondary colour — accents and supporting fills. */
  readonly secondary: HexColor;
  /** Tertiary colour — highlights, small details. */
  readonly tertiary: HexColor;
  /** Shadow colour — used for outlines, drop shadows. */
  readonly shadow: HexColor;
  /** Highlight colour — specular / glow spots. */
  readonly highlight: HexColor;
}

/** Palette collection keyed by a tag identifier. */
export type PaletteMap<K extends string = string> = Readonly<Record<K, PaletteFamily>>;

// ── Sprite Specification Types ────────────────────────────────────────────────

/** Standard frame dimensions for a sprite sheet. */
export interface SpriteSpec {
  /** Width of a single frame in pixels. */
  readonly frameWidth: number;
  /** Height of a single frame in pixels. */
  readonly frameHeight: number;
  /** Total number of animation frames per direction / state. */
  readonly framesPerAnim: number;
  /** Pixels of padding between frames in a sheet or atlas. */
  readonly padding: number;
}

/** Named animation state within a sprite sheet. */
export interface AnimationDef {
  readonly key: string;
  readonly startFrame: number;
  readonly endFrame: number;
  readonly frameRate: number;
  readonly repeat: number; // -1 = loop
}

/** Full character sprite definition with animation map. */
export interface CharacterSpriteSheet {
  readonly id: string;
  readonly spec: SpriteSpec;
  readonly animations: readonly AnimationDef[];
}

// ── Icon Standards ────────────────────────────────────────────────────────────

/** Standard icon cell dimensions and spacing. */
export interface IconStandard {
  /** Canvas size (icons are square). */
  readonly size: number;
  /** Inner safe-zone inset from each edge (pixels). */
  readonly safeZoneInset: number;
  /** Whether the icon should have a 1px outline. */
  readonly outline: boolean;
  /** Outline colour (when outline = true). */
  readonly outlineColor: HexColor;
}

/** Rarity glow/border parameters applied around icons. */
export interface RarityVisual {
  readonly borderColor: HexColor;
  readonly glowColor: HexColor;
  readonly glowRadius: number;
}

// ── Environment Tile Standards ────────────────────────────────────────────────

/** Defines the tile grid used by a biome environment tileset. */
export interface TileStandard {
  /** Tile width in pixels (must equal height for square tiles). */
  readonly tileSize: number;
  /** Number of tile variants for visual noise (e.g. 4 floor variants). */
  readonly variants: number;
  /** Whether the tileset supports auto-tiling via bitmask. */
  readonly autotile: boolean;
}

// ── VFX Descriptor ────────────────────────────────────────────────────────────

/** Categories of VFX used in the game. */
export type VfxCategory = 'combat' | 'loot' | 'ambient' | 'elemental';

/** Describes a single VFX effect for pipeline / atlas tooling. */
export interface VfxDescriptor {
  readonly id: string;
  readonly category: VfxCategory;
  readonly frameWidth: number;
  readonly frameHeight: number;
  readonly frameCount: number;
  readonly loop: boolean;
}

// ── Atlas Types ───────────────────────────────────────────────────────────────

/** An entry in the sprite atlas manifest produced by the packing workflow. */
export interface AtlasEntry {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** Full atlas manifest written to disk after packing. */
export interface AtlasManifest {
  readonly atlasWidth: number;
  readonly atlasHeight: number;
  readonly entries: readonly AtlasEntry[];
}

// ── Readability Validation ────────────────────────────────────────────────────

/** Result of a single readability check. */
export interface ReadabilityResult {
  readonly assetId: string;
  readonly passed: boolean;
  readonly contrastRatio: number;
  readonly minimumRequired: number;
  readonly notes: string;
}
