
export type Animatable = Actor | Tile | TileDocument;

export interface AnimationConfig {
  name: string;
  src: string;
  loop?: boolean;
}

export interface MeshAdjustmentConfig {
  enable: boolean;
  height: number;
  width: number;
  x: number;
  y: number;
}