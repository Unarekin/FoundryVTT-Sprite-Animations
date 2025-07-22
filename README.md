[![GitHub License](https://img.shields.io/github/license/Unarekin/FoundryVTT-Sprite-Animations)](https://raw.githubusercontent.com/Unarekin/FoundryVTT-Sprite-Animations/refs/heads/master/LICENSE?token=GHSAT0AAAAAACYQQTQK6ODLNX6QMRS6G7GWZY22EZQ)
![GitHub package.json version](https://img.shields.io/github/package-json/v/Unarekin/FoundryVTT-Sprite-Animations)
![Supported Foundry Version](https://img.shields.io/endpoint?url=https%3A%2F%2Ffoundryshields.com%2Fversion%3Fstyle%3Dflat%26url%3Dhttps%3A%2F%2Fraw.githubusercontent.com%2FUnarekin%2FFoundryVTT-Sprite-Animations%2Frefs%2Fheads%2Fmain%2Fmodule.json)
![Supported Game Systems](https://img.shields.io/endpoint?url=https%3A%2F%2Ffoundryshields.com%2Fsystem%3FnameType%3Dfull%26showVersion%3D1%26style%3Dflat%26url%3Dhttps%3A%2F%2Fraw.githubusercontent.com%2FUnarekin%2FFoundryVTT-Sprite-Animations%2Frefs%2Fheads%2Fmain%2Fmodule.json)

![GitHub Downloads (specific asset, latest release)](https://img.shields.io/github/downloads/Unarekin/FoundryVTT-Sprite-Animations/latest/module.zip)
[![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2FSprite-Animations)](https://forge-vtt.com/bazaar#package=Sprite-Animations) 

# Sprite Animations

Sprite Animations adds a very simple mechanism to swap between a series of animated textures for a token.  This can be helpful for playing attack or casting animations like you might see in a video game.

![Sprite Animation Demo](https://github.com/user-attachments/assets/e1a7ab19-f87f-4c69-a8e0-2a45f1f8e74d)

*Sprite assets by [chierit](https://chierit.itch.io/); background by [Nidhoggn](https://opengameart.org/users/nidhoggn) on [OpenGameArt](https://opengameart.org/content/backgrounds-3); video uses the [Project FU](https://github.com/League-of-Fabulous-Developers/FoundryVTT-Fabula-Ultima) system module*

## Installation

To install this module, copy and paste the following manifest URL into the module installation dialog in Foundry VTT

```
https://github.com/Unarekin/FoundryVTT-Sprite-Animations/releases/latest/download/module.json
```

# Usage

Sprite Animations allows for two main methods of actually playing animations:  A static interface, and an instance one.  The functionality between the two is identical, but the instance interface does not necessitate specifying the token to animate on each call.

## Configuration Format

Sprite Animations uses a very simple configuration format for animations.

```typescript
interface AnimationConfig {
  name: string;     // Name of the animation to refer to it later
  src: string;      // Image URL of the animation
  loop?: boolean;   // Whether or not the animation is looped (optional, defaults to true)
}
```

> [!NOTE]  
> When executing multiple animations in sequence via one of the `playAnimations` functions, the `loop` option will be ignored for any animations prior to the final one in the sequence.

## Basic Usage

```javascript
// Static:
await SpriteAnimator.playAnimations(token,
  { src: "images/attack.webm" },
  { src: "images/idle.webm", loop: true }
);
```

```javascript
// Instance
const animator = new SpriteAnimator(token);
await animator.playAnimations(
  { src: "images/attack.webm" },
  { src: "images/idle.webm", loop: true }
)
```

> [!NOTE]  
> Sprite Animations expects a [Token](https://foundryvtt.com/api/classes/foundry.canvas.placeables.Token.html) or [Token Document](https://foundryvtt.com/api/classes/foundry.documents.TokenDocument.html) (or the id or UUID thereof) when playing animations.
>
> A [Token](https://foundryvtt.com/api/classes/foundry.canvas.placeables.Token.html), [Token Document](https://foundryvtt.com/api/classes/foundry.documents.TokenDocument.html), or [Actor](https://foundryvtt.com/api/classes/foundry.documents.Actor.html) may be used when adding/removing named animations.

## Named Animations

Animations can be pre-configured on a given actor and referred to later by their name.  In the future, a GUI will be added to make this process simpler, but for now a code snippet such as the following will need to be executed once.

```javascript
await SpriteAnimator.addAnimation(token, { name: "idle", src: "images/idle.webm", loop: true });
await SpriteAnimator.addAnimation(token, { name: "attack", src: "images/attack.webm" });
```

These named animations can be referred to in subsequent `playAnimation(s)` calls by name.

```javascript
const animator = new SpriteAnimator(token);
await animator.playAnimations("attack", "idle");
```

## Full Example

The following is an actual macro used when testing the module.  Change the URL of the animations used to fit your own setup.

```javascript
try {
  const token = await fromUuid("Scene.GYvGqIwzEK02pjsy.Token.ziUj6k7jI2z1LxaM");
  if (!(token instanceof TokenDocument)) throw new Error("Invalid token")

  await SpriteAnimator.playAnimations(token,
    { name: "idle", src: "uploads/images/sprites/Randi - Attack.webm", loop: false },
    { name: "attack", src: "uploads/images/sprites/Randi - Idle.webm", loop: true  }
  );
} catch (err) {
  ui.notifications.error(err.message);
}
```

# API Documentation
[API Documentation](https://unarekin.github.io/FoundryVTT-Sprite-Animations/)

# Known Issues

- Currently does not support the [Pixel Perfect](https://foundryvtt.com/packages/pixel-perfect) module.  Using both side-by-side will prevent the token's texture from updating when Sprite Animations does its thing.
