import { AnimationFlags, MeshAdjustmentConfig } from "interfaces";

export const TRANSLATION_KEY = "SPRITE-ANIMATIONS";

export const DEFAULT_MESH_ADJUSTMENT: MeshAdjustmentConfig = {
  enable: false,
  x: 0,
  y: 0,
  width: 0,
  height: 0
}

export const DEFAULT_ANIMATION_FLAGS: AnimationFlags = {
  meshAdjustments: DEFAULT_MESH_ADJUSTMENT,
  animations: []
}