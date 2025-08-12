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
export declare const MESSAGE_TYPES: readonly ["play", "queue"];
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
