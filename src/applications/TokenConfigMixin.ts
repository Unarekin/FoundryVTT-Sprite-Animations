import { AnimatedPlaceable, AnimationFlags } from "interfaces";
import { ConfigMixin } from "./ConfigMixin";
import { DeepPartial } from "types";
import { TokenConfiguration, TokenRenderContext, TokenRenderOptions } from "./types"
import { DEFAULT_ANIMATION_FLAGS } from "../constants";

export function TokenConfigMixin<t extends typeof foundry.applications.sheets.TokenConfig>(base: t) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  class AnimatedTokenConfig extends ConfigMixin<foundry.documents.TokenDocument, TokenRenderContext, TokenConfiguration, TokenRenderOptions>(base as any) {
    protected getAnimationFlags(): AnimationFlags {
      const flags = foundry.utils.deepClone(DEFAULT_ANIMATION_FLAGS);
      if (this.document.actor)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        foundry.utils.mergeObject(flags, ((this.document.actor.flags as any)[__MODULE_ID__] as DeepPartial<AnimationFlags>) ?? {})
      return flags;
    }

    protected async setAnimationFlags(flags: AnimationFlags) {
      const actualFlags = foundry.utils.mergeObject(foundry.utils.deepClone(DEFAULT_ANIMATION_FLAGS), flags);
      if (this.document.actor) {
        await this.document.actor.update({
          flags: {
            [__MODULE_ID__]: actualFlags
          }
        });
      }
    }



    protected getMesh(): foundry.canvas.primary.PrimarySpriteMesh | undefined {
      return this.document.object?.mesh ?? undefined
    }

    protected getPreviewMesh(): foundry.canvas.primary.PrimarySpriteMesh | undefined {
      // console.log(`Token.${this.document.id}.preview`);
      return canvas?.primary?.tokens.find(token => token.name === `Token.${this.document.id}.preview`);
    }
    protected getAnimatedPlaceable(): AnimatedPlaceable | undefined { return this.document.object as unknown as AnimatedPlaceable ?? undefined; }
  }

  return AnimatedTokenConfig;
}