import { AnimationConfig } from "interfaces";
import { generatePreviewTooltip } from "utils";

Handlebars.registerHelper("isEven", function (index) {
  return (index % 2) === 0;
});

Handlebars.registerHelper("isOdd", function (index) {
  return (index % 2) === 1;
});

Handlebars.registerHelper("animationPreviewTooltip", function (animation: AnimationConfig) {
  if (!animation) return "";
  const elem = generatePreviewTooltip(animation);
  return elem.outerHTML;
});

Handlebars.registerHelper("durationFormat", function (value: number) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const formatter = new Intl.DurationFormat(undefined, { style: "short", millisecondsDisplay: "always" });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  return formatter.format({ milliseconds: value }) as string;
})