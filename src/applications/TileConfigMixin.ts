import { AnimationFlags, AnimatedPlaceable } from "interfaces";
import { ConfigMixin } from "./ConfigMixin";
import { TileConfiguration, TileRenderContext, TileRenderOptions } from "./types";
import { DEFAULT_ANIMATION_FLAGS } from "../constants";

export function TileConfigMixin<t extends typeof foundry.applications.sheets.TileConfig>(base: t) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  class AnimatedTileConfig extends ConfigMixin<foundry.documents.TileDocument, TileRenderContext, TileConfiguration, TileRenderOptions>(base as any) {
    protected getPreviewMesh(): foundry.canvas.primary.PrimarySpriteMesh | undefined {
      return canvas?.primary?.tiles.find(tile => tile.name === `Tile.${this.document.id}.preview`)
    }
    protected getMesh(): foundry.canvas.primary.PrimarySpriteMesh | undefined {
      return this.document.object?.mesh ?? undefined;
    }
    protected getAnimationFlags(): AnimationFlags {
      const flags = foundry.utils.deepClone(DEFAULT_ANIMATION_FLAGS);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if ((this.document.flags as any)[__MODULE_ID__])
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        foundry.utils.mergeObject(flags, (this.document.flags as any)[__MODULE_ID__])
      return flags;
    }
    protected async setAnimationFlags(flags: AnimationFlags): Promise<void> {
      const actualFlags = foundry.utils.mergeObject(foundry.utils.deepClone(DEFAULT_ANIMATION_FLAGS), flags);
      await this.document.update({
        flags: {
          [__MODULE_ID__]: actualFlags
        }
      });
    }
    protected getAnimatedPlaceable(): AnimatedPlaceable | undefined { return this.document.object as unknown as AnimatedPlaceable ?? undefined; }

  }
  return AnimatedTileConfig
}