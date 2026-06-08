import { AnimationArgument, AnimationQueueItemType, DeepPartial } from "types";

export type Animatable = Actor | Tile | TileDocument;

export interface AnimationConfig {
  id: string;
  name: string;
  src: string;
  loop?: boolean;
  sound: string;
  volume: number;
  enableSound: boolean;
}

interface BaseAnimationQueueItem<t> {
  type: AnimationQueueItemType;
  data: t;
}

interface WaitData {
  duration: number;
}

export interface WaitAnimationQueueItem extends BaseAnimationQueueItem<WaitData> {
  type: "wait";
}

export interface PlayAnimationQueueItem extends BaseAnimationQueueItem<AnimationConfig> {
  type: "animation";
}

export type AnimationQueueItem = WaitAnimationQueueItem | PlayAnimationQueueItem;

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

export interface SequenceItem {
  id: string;
  animation: AnimationArgument;
  delay: number;
  loopCount: number
}

export interface AnimationSequence {
  id: string;
  name: string;
  resetAnimation?: string;
  immediate: boolean;
  sequence: SequenceItem[];
}

export const MESSAGE_TYPES = ["play", "queue", "playSequence"] as const;
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
  animations: AnimationArgument[];
  target: string;
}

export interface QueueSocketMessage extends SocketMessage {
  type: "queue";
  animations: AnimationArgument[];
  target: string;
}

export interface AnimationFlags {
  animations: AnimationConfig[];
  sequences: AnimationSequence[];
  meshAdjustments: MeshAdjustmentConfig;
}

export interface AnimatedPlaceable {
  getMesh(): foundry.canvas.primary.PrimarySpriteMesh | undefined;
  getDocument(): foundry.abstract.Document.Any | undefined;
  canAnimate: boolean;
  canUserAnimate(user: User): boolean;
  spriteAnimations: AnimationConfig[];
  spriteAnimationSequences: AnimationSequence[];
  animationMeshAdjustments: MeshAdjustmentConfig;
  getFittedMeshSize(): { x: number, y: number, width: number, height: number } | undefined;
  previewAnimationAdjustments: MeshAdjustmentConfig | undefined;
  applyAnimationMeshAdjustments(adjustments: MeshAdjustmentConfig, force?: boolean): void;
  getAnimation(name: string): AnimationConfig | undefined;
  getAnimationSequence(name: string): AnimationSequence | undefined;
  getAnimationFlags(): DeepPartial<AnimationFlags> | undefined;

  playAnimations(...animations: AnimationArgument[]): Promise<void>;
  playAnimation(animation: AnimationArgument): Promise<void>;
  queueAnimation(animation: AnimationArgument): Promise<void>;
  queueAnimations(...animations: AnimationArgument[]): Promise<void>;
  playAnimationSequence(sequence: AnimationSequence): Promise<void>;

  playLocalAnimations(...animations: AnimationArgument[]): Promise<void>;
  playLocalAnimation(animation: AnimationArgument): Promise<void>;
  queueLocalAnimations(...animations: AnimationArgument[]): Promise<void>;
  queueLocalAnimation(animation: AnimationArgument): Promise<void>;
  playLocalAnimationSequence(sequence: AnimationSequence): Promise<void>;

  doPlayAnimations(animations: AnimationConfig[], localOnly: boolean, loop: boolean): Promise<void>;
  doQueueAnimations(animations: AnimationConfig[], localOnly: boolean, loop: boolean): Promise<void>;
};

export const TASK_TYPES = ["wait", "animation"] as const;
export type AnimationSequenceTaskType = typeof TASK_TYPES[number];

interface BaseAnimationSequenceTask {
  type: AnimationSequenceTaskType;
}

export interface AnimationSequenceWaitTask extends BaseAnimationSequenceTask {
  type: "wait";
  duration: number;
}

export interface AnimationSequenceAnimationTask extends BaseAnimationSequenceTask {
  type: "animation";
  animation: AnimationConfig;
}

export type AnimationSequenceTask = AnimationSequenceWaitTask | AnimationSequenceAnimationTask;

export interface DND5EUseActivity {
  item: foundry.documents.Item;
  actor: foundry.documents.Actor;
  getUsageToken(): foundry.documents.TokenDocument | undefined;
  doPlayAnimations(animations: AnimationConfig[], localOnly: boolean): Promise<void>;
  doQueueAnimations(animations: AnimationConfig[], localOnly: boolean): Promise<void>;
};