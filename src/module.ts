import { SpriteAnimator } from "./SpriteAnimator";
import "./settings";
import "./sockets";
import "./tokenHUD";
import "./hooks";
import "./sequencer";
import "./helpers";
import "./integrations";

export { SpriteAnimator }

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
(window as any).SpriteAnimator = SpriteAnimator;

