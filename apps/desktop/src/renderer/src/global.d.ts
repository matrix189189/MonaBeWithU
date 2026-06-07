export {};

declare global {
  interface Window {
    __petDebug?: Record<string, unknown>;
  }

  interface HTMLElement {
    dataset: DOMStringMap & {
      mood?: string;
      petPhase?: string;
      petError?: string;
    };
  }
}
