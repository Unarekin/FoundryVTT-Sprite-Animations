import { AnimationFlags } from "interfaces";
import { DeepPartial } from "types";
import { AnimatedPlaceableMixin } from "./AnimatedPlaceable";
import { HandleEmptyObject } from "fvtt-types/utils";

type TokenConstructor = new (...args: any[]) => foundry.canvas.placeables.Token;

export function AnimatedTokenMixin(base: TokenConstructor) {

  class AnimatedToken extends AnimatedPlaceableMixin<TokenConstructor>(base) {

    public getMesh() { return this.mesh; }

    protected getDocumentSize() { return this.document.getSize(); }
    protected resetAnimationMeshSize() {
      const mesh = this.getMesh();
      if (!mesh) return;
      const { width, height } = this.getDocumentSize();
      mesh.resize(width, height, { fit: this.document.texture.fit, scaleX: this.document.texture.scaleX, scaleY: this.document.texture.scaleY });
    }

    protected getAnimationMeshAdjustmentMultipliers(): { x: number, y: number, width: number, height: number } {
      return {
        x: this.document.width,
        y: this.document.height,
        width: this.document.width,
        height: this.document.height
      }
    }


    protected getAnimationFlags(): DeepPartial<AnimationFlags> | undefined {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
      return (this.actor as any)?.flags[__MODULE_ID__];
    }


    // These are implemented here entirely so that the linter doesn't complain because our direct parent is abstract
    get bounds() { return super.bounds; }
    protected _draw(options: HandleEmptyObject<foundry.canvas.placeables.PlaceableObject.DrawOptions>): Promise<void> { return super._draw(options) }

  }

  return AnimatedToken;
}
