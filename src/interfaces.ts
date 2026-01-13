import { AnimationArgument, DeepPartial } from "types";

export type Animatable = Actor | Tile | TileDocument;

export interface AnimationConfig {
  id: string;
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
  anchor: {
    x: number;
    y: number;
  }
}

export const MESSAGE_TYPES = ["play", "queue"] as const;
export type SocketMessageType = typeof MESSAGE_TYPES[number];


export interface SocketMessage {
  id: string;
  type: SocketMessageType;
  timestamp: number;
  sender: string;
  users: string[];
}

export interface PlaySocketMessage extends SocketMessage {
  type: "play";
  animations: (string | AnimationConfig)[];
  target: string;
}

export interface QueueSocketMessage extends SocketMessage {
  type: "queue";
  animations: (string | AnimationConfig)[];
  target: string;
}



export interface AnimationFlags {
  animations: AnimationConfig[];
  meshAdjustments: MeshAdjustmentConfig;
}

export interface AnimatedPlaceable {
  getMesh(): foundry.canvas.primary.PrimarySpriteMesh | undefined;
  getDocument(): foundry.abstract.Document.Any | undefined;
  canAnimate: boolean;
  canUserAnimate(user: User): boolean;
  spriteAnimations: AnimationConfig[];
  animationMeshAdjustments: MeshAdjustmentConfig;
  getFittedMeshSize(): { x: number, y: number, width: number, height: number } | undefined;
  previewAnimationAdjustments: MeshAdjustmentConfig | undefined;
  applyAnimationMeshAdjustments(adjustments: MeshAdjustmentConfig, force?: boolean): void;
  getAnimation(name: string): AnimationConfig | undefined;
  getAnimationFlags(): DeepPartial<AnimationFlags> | undefined;

  playAnimations(...animations: AnimationArgument[]): Promise<void>;
  playAnimation(animation: AnimationArgument): Promise<void>;
  queueAnimation(animation: AnimationArgument): Promise<void>;
  queueAnimations(...animations: AnimationArgument[]): Promise<void>;
};