import { AnimationConfig } from "./interfaces";

declare global {
  interface FlagConfig {
    Actor: {
      "sprite-animations": {
        animations: AnimationConfig[];
      }
    }
  }
}
