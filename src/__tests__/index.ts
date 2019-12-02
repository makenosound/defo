import { JSDOM } from "jsdom";
import html from "nanohtml";
import waitForExpect from "wait-for-expect";
import defo from "../index";
const MutationObserver = require("@sheerun/mutationobserver-shim");

const jsdom = new JSDOM();
const globalAny: any = global;
globalAny.MutationObserver = MutationObserver;
globalAny.document = jsdom.window.document;

describe("defo", () => {
  test("creates a instance", () => {
    const instance = defo();
    expect(instance).toHaveProperty("destroy");
    instance.destroy();
  });

  test("calls view functions (async) if bound before DOM is complete", async () => {
    const fakeView = jest.fn();
    const instance = defo({ views: { fakeView } });
    document.body.appendChild(html`
      <div data-defo-fake-view="" />
    `);
    // Mutations happen async
    await waitForExpect(() => {
      expect(fakeView).toHaveBeenCalledTimes(1);
    });
    instance.destroy();
  });

  test("calls view functions (sync) if bound after DOM is complete", () => {
    const fakeView = jest.fn();
    document.body.appendChild(html`
      <div data-defo-fake-view="" />
    `);
    const instance = defo({ views: { fakeView } });
    expect(fakeView).toHaveBeenCalledTimes(1);
    instance.destroy();
  });

  test("calls view functions that return a promise", async () => {
    const view = jest.fn();
    const fakeView = () => {
      return new Promise(resolve => {
        view();
      });
    };
    const instance = defo({ views: { fakeView } });
    const node = html`
      <div data-defo-fake-view="" />
    `;
    document.body.appendChild(node);

    await waitForExpect(() => {
      expect(view).toHaveBeenCalled();
    });
    instance.destroy();
  });

  test("... handling multiple views bound on the same element", () => {
    const fakeViewOne = jest.fn();
    const fakeViewTwo = jest.fn();
    document.body.appendChild(html`
      <div data-defo-fake-view-one="" data-defo-fake-view-two="" />
    `);
    const instance = defo({ views: { fakeViewOne, fakeViewTwo } });
    expect(fakeViewOne).toHaveBeenCalledTimes(1);
    expect(fakeViewTwo).toHaveBeenCalledTimes(1);
    instance.destroy();
  });

  test("calls view functions with expected arguments", () => {
    const fakeView = jest.fn().mockImplementation((el, props) => {});
    const jsonView = jest.fn().mockImplementation((el, props) => {});
    const fakeNode = html`
      <div data-defo-fake-view="123"></div>
    `;
    const jsonNode = html`
      <div data-defo-json-view='{"foo":"bar"}'></div>
    `;
    document.body.appendChild(fakeNode);
    document.body.appendChild(jsonNode);
    const instance = defo({ views: { fakeView, jsonView } });
    expect(fakeView).toHaveBeenCalledWith(fakeNode, 123);
    expect(jsonView).toHaveBeenCalledWith(jsonNode, { foo: "bar" });
    instance.destroy();
  });
});

describe("... attributes", () => {
  test("calls view function when attributes are added to an element", async () => {
    const fakeView = jest.fn();
    const instance = defo({ views: { fakeView } });
    const node = html`
      <div></div>
    `;
    document.body.appendChild(node);
    node.setAttribute("data-defo-fake-view", "");
    await waitForExpect(() => {
      expect(fakeView).toHaveBeenCalledTimes(1);
    });
    instance.destroy();
  });

  test("calls destroy when attribute is removed", async () => {
    const view = jest.fn();
    const destroy = jest.fn();
    const fakeView = () => {
      view();
      return {
        destroy
      };
    };
    const instance = defo({ views: { fakeView } });
    const node = html`
      <div data-defo-fake-view="" />
    `;
    document.body.appendChild(node);

    // Allow DOM time to flush before removing attribute
    setTimeout(() => {
      node.removeAttribute("data-defo-fake-view");
    }, 100);

    await waitForExpect(() => {
      expect(view).toHaveBeenCalledTimes(1);
      expect(destroy).toHaveBeenCalledTimes(1);
    });
    instance.destroy();
  });

  test("calls update when an attribute value is changed", async () => {
    const view = jest.fn();
    const update = jest.fn();
    const fakeView = () => {
      view();
      return {
        update
      };
    };
    const instance = defo({ views: { fakeView } });
    const node = html`
      <div data-defo-fake-view="previousValue" />
    `;
    document.body.appendChild(node);

    // Allow DOM time to flush before changing attribute
    setTimeout(() => {
      node.setAttribute("data-defo-fake-view", "newValue");
    }, 100);

    await waitForExpect(() => {
      expect(view).toHaveBeenCalled();
      expect(update).toHaveBeenCalledWith("newValue", "previousValue");
    });
    instance.destroy();
  });

  test("handles update for views that return a promise", async () => {
    const view = jest.fn();
    const update = jest.fn();
    const fakeView = () => {
      return new Promise(resolve => {
        view();
        resolve({
          update
        });
      });
    };
    const instance = defo({ views: { fakeView } });
    const node = html`
      <div data-defo-fake-view="previousValue" />
    `;
    document.body.appendChild(node);

    // Allow DOM time to flush before changing attribute
    setTimeout(() => {
      node.setAttribute("data-defo-fake-view", "newValue");
    }, 100);

    await waitForExpect(() => {
      expect(view).toHaveBeenCalled();
      expect(update).toHaveBeenCalledWith("newValue", "previousValue");
    });
    instance.destroy();
  });
});

describe("... removal", () => {
  test("calls destroy when element is removed", async () => {
    const view = jest.fn();
    const destroy = jest.fn();
    const fakeView = () => {
      view();
      return {
        destroy
      };
    };
    const instance = defo({ views: { fakeView } });
    const node = html`
      <div data-defo-fake-view="" />
    `;
    document.body.appendChild(node);

    // Allow DOM time to flush before removing
    setTimeout(() => {
      node.remove();
    }, 100);

    await waitForExpect(() => {
      expect(view).toHaveBeenCalledTimes(1);
      expect(destroy).toHaveBeenCalledTimes(1);
    });
    instance.destroy();
  });

  test("handles destroy for views that return a promise", async () => {
    const view = jest.fn();
    const destroy = jest.fn();
    const fakeView = () => {
      return new Promise(resolve => {
        view();
        resolve({
          destroy
        });
      });
    };
    const instance = defo({ views: { fakeView } });
    const node = html`
      <div data-defo-fake-view="" />
    `;
    document.body.appendChild(node);

    // Allow DOM time to flush before removing
    setTimeout(() => {
      node.remove();
    }, 100);

    await waitForExpect(() => {
      expect(view).toHaveBeenCalled();
      expect(destroy).toHaveBeenCalled();
    });
    instance.destroy();
  });
});
