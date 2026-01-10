import { SpriteAnimator } from "./SpriteAnimator";
import "./settings";
import "./sockets";
import "./tokenConfig";
import "./tokenHUD";
import "./hooks";
import "./sequencer";
import "./helpers";

export { SpriteAnimator }

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
(window as any).SpriteAnimator = SpriteAnimator;

