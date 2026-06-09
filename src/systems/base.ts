export abstract class BaseSystemHandler {
  // eslint-disable-next-line @typescript-eslint/class-literal-property-style
  public static get systemId() { return ""; }
  public abstract register(): void;
  public abstract get systemId(): string;

}