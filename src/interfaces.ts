
export type Animatable = Actor | Tile | TileDocument;

export interface AnimationConfig {
  name: string;
  src: string;
  loop?: boolean;
}