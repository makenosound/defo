import { describe, test, expect, vi, beforeEach } from "vitest";
import { waitFor } from "@testing-library/dom";
import defo from "./index";
import { html } from "../test/helpers";
import type { ViewFnReturnValue } from "./types";

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
    expect(fakeView).toHaveBeenCalledWith(fakeNode, 123);
    expect(jsonView).toHaveBeenCalledWith(jsonNode, { foo: "bar" });
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
