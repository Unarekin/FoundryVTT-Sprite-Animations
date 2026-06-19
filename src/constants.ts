import { AnimationConfig, AnimationFlags, AnimationSequence, MeshAdjustmentConfig, SequenceItem } from "interfaces";

export const TRANSLATION_KEY = "SPRITE-ANIMATIONS";

export const DEFAULT_MESH_ADJUSTMENT: MeshAdjustmentConfig = {
  enable: false,
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  anchor: {
    x: 0.5,
    y: 0.5
  }
}

export const DEFAULT_ANIMATION: AnimationConfig = {
  id: "",
  name: "",
  src: "",
  loop: false,
  sound: "",
  volume: 1,
  enableSound: false
}

export const DEFAULT_ANIMATION_FLAGS: AnimationFlags = {
  meshAdjustments: DEFAULT_MESH_ADJUSTMENT,
  sequences: [],
  animations: []
}

export const DEFAULT_ANIMATION_SEQUENCE: AnimationSequence = {
  id: "",
  name: game.i18n?.localize("SPRITE-ANIMATIONS.NEWSEQUENCE") ?? "New Sequence",
  resetAnimation: "",
  immediate: false,
  sequence: []
}

export const DEFAULT_ANIMATION_SEQUENCE_ITEM: SequenceItem = Object.freeze({
  id: "",
  animation: "",
  delay: 0,
  loopCount: 0
})