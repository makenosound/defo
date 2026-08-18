import { describe, test, expect, vi, beforeEach } from "vitest";
import { createEventHelpers } from "./events";
import { html } from "../test/helpers";

describe("createEventHelpers", () => {
  let node: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = "";
    node = html`
      <ul>
        <li class="item" data-id="1">One</li>
        <li class="item" data-id="2">Two</li>
      </ul>
    `;
    document.body.appendChild(node);
  });

  test("returns an `on` function and an `AbortSignal`", () => {
    const { on, signal } = createEventHelpers(node);
    expect(on).toBeInstanceOf(Function);
    expect(signal).toBeInstanceOf(AbortSignal);
    expect(signal.aborted).toBe(false);
  });

  test("`on(type, handler)` binds directly to the node", () => {
    const { on } = createEventHelpers(node);
    const handler = vi.fn();
    on("click", handler);
    node.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  test("`on(type, handler)` does not fire for unrelated targets", () => {
    const { on } = createEventHelpers(node);
    const handler = vi.fn();
    on("click", handler);
    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(handler).not.toHaveBeenCalled();
  });

  test("`on(type, selector, handler)` delegates to matching descendants", () => {
    const { on } = createEventHelpers(node);
    const handler = vi.fn();
    on("click", ".item", handler);

    const [first] = Array.from(node.querySelectorAll(".item"));
    first.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(expect.any(Event), first);
  });

  test("`on(type, selector, handler)` fires for descendants added later", () => {
    const { on } = createEventHelpers(node);
    const handler = vi.fn();
    on("click", ".item", handler);

    const third = document.createElement("li");
    third.className = "item";
    third.dataset.id = "3";
    node.appendChild(third);

    third.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(handler).toHaveBeenCalledWith(expect.any(Event), third);
  });

  test("`on(type, selector, handler)` does not match ancestors outside of the target", () => {
    document.body.className = "item";
    const { on } = createEventHelpers(node);
    const handler = vi.fn();
    on("click", ".item", handler);

    node.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(handler).not.toHaveBeenCalled();
  });

  test("`on(target, type, handler)` binds directly to an explicit target", () => {
    const { on } = createEventHelpers(node);
    const handler = vi.fn();
    const [first] = Array.from(node.querySelectorAll(".item"));
    on(first, "focusin", handler);

    node.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(handler).not.toHaveBeenCalled();

    first.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  test("`on(target, type, selector, handler)` delegates from an explicit target", () => {
    const { on } = createEventHelpers(node);
    const handler = vi.fn();
    on(document.body, "click", ".item", handler);

    const [first] = Array.from(node.querySelectorAll(".item"));
    first.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(handler).toHaveBeenCalledWith(expect.any(Event), first);
  });

  test("supports multiple handlers for the same event", () => {
    const { on } = createEventHelpers(node);
    const handlerA = vi.fn();
    const handlerB = vi.fn();
    on("click", handlerA);
    on("click", handlerB);

    node.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(handlerA).toHaveBeenCalledTimes(1);
    expect(handlerB).toHaveBeenCalledTimes(1);
  });

  test("`destroy` removes all bound listeners and aborts `signal`", () => {
    const { on, signal, destroy } = createEventHelpers(node);
    const direct = vi.fn();
    const delegated = vi.fn();
    on("click", direct);
    on("click", ".item", delegated);

    destroy();
    expect(signal.aborted).toBe(true);

    node.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    const [first] = Array.from(node.querySelectorAll(".item"));
    first.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(direct).not.toHaveBeenCalled();
    expect(delegated).not.toHaveBeenCalled();
  });

  test("calling `on` after `destroy` is a no-op", () => {
    const { on, destroy } = createEventHelpers(node);
    destroy();

    const handler = vi.fn();
    // Binding against an already-aborted signal should silently no-op
    expect(() => on("click", handler)).not.toThrow();
    node.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(handler).not.toHaveBeenCalled();
  });
});
