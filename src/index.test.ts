import { describe, test, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/dom";
import defo from "./index";
import { html } from "../test/helpers";
import type { ViewFnReturnValue } from "./types";
import type { EventHelpers } from "./events";

describe("defo", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  test("creates a instance", () => {
    const instance = defo();
    expect(instance).toHaveProperty("destroy");
    instance.destroy();
  });

  test("calls view functions (async) if bound before DOM is complete", async () => {
    const fakeView = vi.fn();
    const instance = defo({ views: { fakeView } });
    document.body.appendChild(html` <div data-defo-fake-view="" /> `);
    // Mutations happen async
    await waitFor(() => {
      expect(fakeView).toHaveBeenCalledTimes(1);
    });
    instance.destroy();
  });

  test("calls view functions (sync) if bound after DOM is complete", () => {
    const fakeView = vi.fn();
    document.body.appendChild(html` <div data-defo-fake-view="" /> `);
    const instance = defo({ views: { fakeView } });
    expect(fakeView).toHaveBeenCalledTimes(1);
    instance.destroy();
  });

  test("calls view functions that return a promise", async () => {
    const view = vi.fn();
    const fakeView = () => {
      return new Promise<void>((resolve) => {
        view();
        resolve();
      });
    };
    const instance = defo({ views: { fakeView } });
    const node = html` <div data-defo-fake-view="" /> `;
    document.body.appendChild(node);

    await waitFor(() => {
      expect(view).toHaveBeenCalled();
    });
    instance.destroy();
  });

  test("... handling multiple views bound on the same element", () => {
    const fakeViewOne = vi.fn();
    const fakeViewTwo = vi.fn();
    document.body.appendChild(html`
      <div data-defo-fake-view-one="" data-defo-fake-view-two="" />
    `);
    const instance = defo({ views: { fakeViewOne, fakeViewTwo } });
    expect(fakeViewOne).toHaveBeenCalledTimes(1);
    expect(fakeViewTwo).toHaveBeenCalledTimes(1);
    instance.destroy();
  });

  test("calls view functions with expected arguments", () => {
    const fakeView = vi.fn().mockImplementation((_el, _props) => {});
    const jsonView = vi.fn().mockImplementation((_el, _props) => {});
    const fakeNode = html` <div data-defo-fake-view="123"></div> `;
    const jsonNode = html` <div data-defo-json-view='{"foo":"bar"}'></div> `;
    document.body.appendChild(fakeNode);
    document.body.appendChild(jsonNode);
    const instance = defo({ views: { fakeView, jsonView } });
    const expectedHelpers = {
      on: expect.any(Function),
      signal: expect.any(AbortSignal),
    };
    expect(fakeView).toHaveBeenCalledWith(fakeNode, 123, expectedHelpers);
    expect(jsonView).toHaveBeenCalledWith(
      jsonNode,
      { foo: "bar" },
      expectedHelpers
    );
    instance.destroy();
  });
});

describe("... attributes", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  test("calls view function when attributes are added to an element", async () => {
    const fakeView = vi.fn();
    const instance = defo({ views: { fakeView } });
    const node = html` <div></div> `;
    document.body.appendChild(node);
    node.setAttribute("data-defo-fake-view", "");
    await waitFor(() => {
      expect(fakeView).toHaveBeenCalledTimes(1);
    });
    instance.destroy();
  });

  test("calls destroy when attribute is removed", async () => {
    const view = vi.fn();
    const destroy = vi.fn();
    const fakeView = () => {
      view();
      return {
        destroy,
      };
    };
    const instance = defo({ views: { fakeView } });
    const node = html` <div data-defo-fake-view="" /> `;
    document.body.appendChild(node);

    // Allow DOM time to flush before removing attribute
    setTimeout(() => {
      node.removeAttribute("data-defo-fake-view");
    }, 100);

    await waitFor(() => {
      expect(view).toHaveBeenCalledTimes(1);
      expect(destroy).toHaveBeenCalledTimes(1);
    });
    instance.destroy();
  });

  test("calls update when an attribute value is changed", async () => {
    const view = vi.fn();
    const update = vi.fn();
    const fakeView = () => {
      view();
      return {
        update,
      };
    };
    const instance = defo({ views: { fakeView } });
    const node = html` <div data-defo-fake-view="previousValue" /> `;
    document.body.appendChild(node);

    // Allow DOM time to flush before changing attribute
    setTimeout(() => {
      node.setAttribute("data-defo-fake-view", "newValue");
    }, 100);

    await waitFor(() => {
      expect(view).toHaveBeenCalled();
      expect(update).toHaveBeenCalledWith("newValue", "previousValue");
    });
    instance.destroy();
  });

  test("handles update for views that return a promise", async () => {
    const view = vi.fn();
    const update = vi.fn();
    const fakeView = () => {
      return new Promise<ViewFnReturnValue>((resolve) => {
        view();
        resolve({
          update,
        });
      });
    };
    const instance = defo({ views: { fakeView } });
    const node = html` <div data-defo-fake-view="previousValue" /> `;
    document.body.appendChild(node);

    // Allow DOM time to flush before changing attribute
    setTimeout(() => {
      node.setAttribute("data-defo-fake-view", "newValue");
    }, 100);

    await waitFor(() => {
      expect(view).toHaveBeenCalled();
      expect(update).toHaveBeenCalledWith("newValue", "previousValue");
    });
    instance.destroy();
  });
});

describe("... events", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  test("`on` binds a listener that fires on the node", () => {
    const handler = vi.fn();
    const fakeView = (
      _el: HTMLElement,
      _props: unknown,
      { on }: EventHelpers
    ) => {
      on("click", handler);
    };
    const node = html` <div data-defo-fake-view="" /> `;
    document.body.appendChild(node);
    const instance = defo({ views: { fakeView } });

    node.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(handler).toHaveBeenCalledTimes(1);
    instance.destroy();
  });

  test("`on` with a selector delegates to matching descendants", () => {
    const handler = vi.fn();
    const fakeView = (
      _el: HTMLElement,
      _props: unknown,
      { on }: EventHelpers
    ) => {
      on("click", "[data-action]", handler);
    };
    const node = html`
      <ul data-defo-fake-view="">
        <li data-action="remove">Remove</li>
      </ul>
    `;
    document.body.appendChild(node);
    const instance = defo({ views: { fakeView } });

    const button = node.querySelector("[data-action]") as HTMLElement;
    button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(handler).toHaveBeenCalledWith(expect.any(Event), button);
    instance.destroy();
  });

  test("listeners bound via `on` are removed when the attribute is removed", async () => {
    const handler = vi.fn();
    let capturedSignal: AbortSignal | undefined;
    const fakeView = (
      _el: HTMLElement,
      _props: unknown,
      { on, signal }: EventHelpers
    ) => {
      capturedSignal = signal;
      on("click", handler);
    };
    const node = html` <div data-defo-fake-view="" /> `;
    document.body.appendChild(node);
    const instance = defo({ views: { fakeView } });

    setTimeout(() => {
      node.removeAttribute("data-defo-fake-view");
    }, 100);

    await waitFor(() => {
      expect(capturedSignal?.aborted).toBe(true);
    });

    node.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(handler).not.toHaveBeenCalled();
    instance.destroy();
  });

  test("listeners bound via `on` are removed when the node is removed, even without a returned `destroy`", async () => {
    const view = vi.fn();
    const handler = vi.fn();
    let capturedSignal: AbortSignal | undefined;
    const fakeView = (
      _el: HTMLElement,
      _props: unknown,
      { on, signal }: EventHelpers
    ) => {
      view();
      capturedSignal = signal;
      on("click", handler);
      // Deliberately no return value — cleanup should still happen
    };
    const node = html` <div data-defo-fake-view="" /> `;
    document.body.appendChild(node);
    const instance = defo({ views: { fakeView } });

    await waitFor(() => {
      expect(view).toHaveBeenCalledTimes(1);
    });

    setTimeout(() => {
      document.body.removeChild(node);
    }, 100);

    await waitFor(() => {
      expect(capturedSignal?.aborted).toBe(true);
    });

    node.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(handler).not.toHaveBeenCalled();
    instance.destroy();
  });

  test("`signal` is aborted when the view is destroyed", async () => {
    let capturedSignal: AbortSignal | undefined;
    const fakeView = (
      _el: HTMLElement,
      _props: unknown,
      { signal }: EventHelpers
    ) => {
      capturedSignal = signal;
    };
    const node = html` <div data-defo-fake-view="" /> `;
    document.body.appendChild(node);
    const instance = defo({ views: { fakeView } });

    expect(capturedSignal?.aborted).toBe(false);

    setTimeout(() => {
      node.removeAttribute("data-defo-fake-view");
    }, 100);

    await waitFor(() => {
      expect(capturedSignal?.aborted).toBe(true);
    });
    instance.destroy();
  });
});

describe("... removal", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  test("calls destroy when element is removed", async () => {
    const view = vi.fn();
    const destroy = vi.fn();
    const fakeView = () => {
      view();
      return {
        destroy,
      };
    };
    const instance = defo({ views: { fakeView } });
    const node = html` <div data-defo-fake-view="" /> `;
    document.body.appendChild(node);

    // Wait for initial setup
    await waitFor(() => {
      expect(view).toHaveBeenCalledTimes(1);
    });

    // Allow DOM time to flush before removing
    setTimeout(() => {
      document.body.removeChild(node);
    }, 100);

    await waitFor(() => {
      expect(destroy).toHaveBeenCalledTimes(1);
    });
    instance.destroy();
  });

  test("handles destroy for views that return a promise", async () => {
    const view = vi.fn();
    const destroy = vi.fn();
    const fakeView = () => {
      return new Promise<ViewFnReturnValue>((resolve) => {
        view();
        resolve({
          destroy,
        });
      });
    };
    const instance = defo({ views: { fakeView } });
    const node = html` <div data-defo-fake-view="" /> `;
    document.body.appendChild(node);

    // Wait for initial setup
    await waitFor(() => {
      expect(view).toHaveBeenCalled();
    });

    // Allow DOM time to flush before removing
    setTimeout(() => {
      document.body.removeChild(node);
    }, 100);

    await waitFor(() => {
      expect(destroy).toHaveBeenCalled();
    });
    instance.destroy();
  });
});
