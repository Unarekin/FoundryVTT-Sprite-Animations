import { AnimationFlags, AnimatedPlaceable } from "interfaces";
import { ConfigMixin } from "./ConfigMixin";
import { TokenConfiguration, TokenRenderContext, TokenRenderOptions } from "./types";
import { DEFAULT_ANIMATION_FLAGS } from "../constants";
import { DeepPartial } from "types";

export function PrototypeTokenConfigMixin<t extends typeof foundry.applications.sheets.PrototypeTokenConfig>(base: t) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  class AnimatedPrototypeTokenConfig extends ConfigMixin<foundry.documents.TokenDocument, TokenRenderContext, TokenConfiguration, TokenRenderOptions>(base as any) {
    protected getPreviewMesh(): foundry.canvas.primary.PrimarySpriteMesh | undefined {
      return undefined;
    }
    protected getMesh(): foundry.canvas.primary.PrimarySpriteMesh | undefined {
      return undefined;
    }
    protected getAnimationFlags(): AnimationFlags {
      const flags = foundry.utils.deepClone(DEFAULT_ANIMATION_FLAGS);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if ((this as any).actor)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        foundry.utils.mergeObject(flags, ((this as any).actor.flags?.[__MODULE_ID__] as DeepPartial<AnimationFlags>) ?? {})
      console.log("Getting flags:", flags);
      return flags;
    }
    protected async setAnimationFlags(flags: AnimationFlags): Promise<void> {
      const actualFlags = foundry.utils.mergeObject(foundry.utils.deepClone(DEFAULT_ANIMATION_FLAGS), flags);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      console.log("Setting:", (this as any).actor);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if ((this as any).actor) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        await (this as any).actor.update({
          flags: {
            [__MODULE_ID__]: actualFlags
          }
        });
      }
    }

    protected getAnimatedPlaceable(): AnimatedPlaceable | undefined {
      return undefined;
    }

    protected getPreviewMeshTexture(): PIXI.Texture | undefined {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!(this as any).token?.texture?.src) return;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      return PIXI.Texture.from((this as any).token.texture.src as string);
    }

    protected getFittedMeshSize() {
      return { x: 0, y: 0, width: 100, height: 100 }
    }

    async _onSubmitForm(formConfig: foundry.applications.api.ApplicationV2.FormConfiguration, e: Event | SubmitEvent) {
      await super._onSubmitForm(formConfig, e);
      if (!(e.target instanceof HTMLFormElement)) return;

      const formData = foundry.utils.expandObject(new FormDataExtended(e.target).object);
      const flags = foundry.utils.mergeObject(foundry.utils.deepClone(DEFAULT_ANIMATION_FLAGS), foundry.utils.getProperty(formData, `flags.${__MODULE_ID__}`) as object) as AnimationFlags | undefined;

      console.log("Flags:", flags, this.animationFlagCache);
      if (flags) {
        await this.setAnimationFlags({
          ...flags,
          animations: this.animationFlagCache?.animations ?? []
        });
      }
    }
  }

  return AnimatedPrototypeTokenConfig;
}