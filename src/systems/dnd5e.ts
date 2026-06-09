import { AnimatedPlaceable, DND5EUseActivity } from "interfaces";
import { BaseSystemHandler } from "./base";
import { playAnimationSequence } from "utils";



export class DND5ESystemHandler extends BaseSystemHandler {

  // eslint-disable-next-line @typescript-eslint/class-literal-property-style
  public static get systemId() { return "dnd5e"; }
  public get systemId() { return DND5ESystemHandler.systemId; }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onPreUseActivity(activity: DND5EUseActivity, usageConfig: unknown, dialogConfig: unknown, messageConfig: unknown) {
    // const { item } = activity;
    const token = activity.getUsageToken();

    if (!token?.object) return;

    const flags = (activity as unknown as foundry.documents.Item).flags[__MODULE_ID__];

    if (flags?.enable && Array.isArray(flags.sequence) && flags.sequence.sequence.length) {
      void playAnimationSequence(token.object as unknown as AnimatedPlaceable, flags.sequence);
    }
  }

  public register() {
    // empty
    Hooks.on("dnd5e.preUseActivity", this.onPreUseActivity.bind(this));
  }
}