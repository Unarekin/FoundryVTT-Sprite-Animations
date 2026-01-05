import { AnimationFlags } from "interfaces";
import { ConfigMixin } from "./ConfigMixin";
import { DeepPartial } from "types";
import { TokenConfiguration, TokenRenderContext, TokenRenderOptions } from "./types"
import { DEFAULT_ANIMATION_FLAGS } from "../constants";

export function TokenConfigMixin<t extends typeof foundry.applications.sheets.TokenConfig>(base: t) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  class AnimatedTokenConfig extends ConfigMixin<foundry.documents.TokenDocument, TokenRenderContext, TokenConfiguration, TokenRenderOptions>(base as any) {
    public getAnimationFlags(): AnimationFlags {
      const flags = foundry.utils.deepClone(DEFAULT_ANIMATION_FLAGS);
      if (this.document.actor)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        foundry.utils.mergeObject(flags, ((this.document.actor.flags as any)[__MODULE_ID__] as DeepPartial<AnimationFlags>) ?? {})
      return flags;
    }
  }

  return AnimatedTokenConfig;
}