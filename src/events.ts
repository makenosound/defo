import type { DestroyFn } from "./types";

/**
 * Handler for a delegated event. Receives the original event along with the
 * descendant element that actually matched the delegation selector.
 */
export type DelegatedEventHandler = (
  event: Event,
  matchedTarget: HTMLElement
) => void;

export interface OnFn {
  // Bound directly to the view’s node
  (
    type: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ): void;
  // Delegated from the view’s node to descendants matching `selector`
  (
    type: string,
    selector: string,
    handler: DelegatedEventHandler,
    options?: AddEventListenerOptions
  ): void;
  // Bound directly to an explicit target
  (
    target: EventTarget,
    type: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ): void;
  // Delegated from an explicit target to descendants matching `selector`
  (
    target: EventTarget,
    type: string,
    selector: string,
    handler: DelegatedEventHandler,
    options?: AddEventListenerOptions
  ): void;
}

export interface EventHelpers {
  /**
   * Bind an event listener that is automatically removed when the view is
   * destroyed. Defaults to binding on the view’s own node, but an explicit
   * target may be passed as the first argument. Passing a selector delegates
   * the handler to matching descendants, including ones added later.
   */
  on: OnFn;
  /**
   * An `AbortSignal` that is aborted when the view is destroyed. Useful for
   * cancelling `fetch` calls or other abortable work started by a view,
   * independently of (or in addition to) `on`.
   */
  signal: AbortSignal;
}

/**
 * Create the `on`/`signal` helpers for a single view instance, along with a
 * `destroy` function that tears down every listener registered via `on` in
 * one call.
 */
export function createEventHelpers(node: HTMLElement): EventHelpers & {
  destroy: DestroyFn;
} {
  const controller = new AbortController();
  const { signal } = controller;

  const on = ((...args: unknown[]) => {
    let target: EventTarget = node;
    let rest = args;

    // If the first argument isn’t a string, it’s an explicit target
    if (typeof rest[0] !== "string") {
      target = rest[0] as EventTarget;
      rest = rest.slice(1);
    }

    const [type, second, third, fourth] = rest as [
      string,
      string | EventListener,
      DelegatedEventHandler | AddEventListenerOptions | undefined,
      AddEventListenerOptions | undefined,
    ];

    if (typeof second === "string") {
      // Delegated: (..., type, selector, handler, options?)
      const selector = second;
      const handler = third as DelegatedEventHandler;
      const options = fourth;
      target.addEventListener(type, delegate(target, selector, handler), {
        ...options,
        signal,
      });
    } else {
      // Direct: (..., type, handler, options?)
      const handler = second;
      const options = third as AddEventListenerOptions | undefined;
      target.addEventListener(type, handler, { ...options, signal });
    }
  }) as OnFn;

  return {
    on,
    signal,
    destroy: () => controller.abort(),
  };
}

/**
 * Wrap a handler so it only fires when the event originated from a
 * descendant of `root` that matches `selector`. Traversal stops at `root`
 * so ancestors outside of it are never considered a match.
 */
function delegate(
  root: EventTarget,
  selector: string,
  handler: DelegatedEventHandler
): EventListener {
  return (event: Event) => {
    let candidate = event.target as HTMLElement | null;
    while (candidate && candidate !== root) {
      if (candidate.matches?.(selector)) {
        handler(event, candidate);
        return;
      }
      candidate = candidate.parentElement;
    }
  };
}
