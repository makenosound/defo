import { JSDOM } from "jsdom";
import renderTree, { renderViewForNode } from "../render";
var nanohtml = require("nanohtml/dom");

const jsdom = new JSDOM();
const html = nanohtml(jsdom.window.document);
const prefix = "defo";

describe("renderViewForNode", () => {
  const fakeView = jest.fn();
  const viewName = "fakeView";
  const node = html`
    <div data-defo-fake-view="" />
  `;

  test("calls passed view function", () => {
    renderViewForNode(node, prefix, { fakeView }, viewName);
    expect(fakeView).toHaveBeenCalled();
  });

  test("... once only", () => {
    renderViewForNode(node, prefix, { fakeView }, viewName);
    expect(fakeView).toHaveBeenCalledTimes(1);
  });

  test("should decorate the node with view API methods", () => {
    expect(node._defoUpdate[viewName]).toBeInstanceOf(Function);
    expect(node._defoDestroy[viewName]).toBeInstanceOf(Function);
  });

  test("should call multiple views separately", () => {
    const newFakeView = jest.fn();
    node.setAttribute(`data-${prefix}-new-fake-view`, true);
    renderViewForNode(node, prefix, { newFakeView, fakeView }, "newFakeView");
    expect(newFakeView).toHaveBeenCalled();
    expect(fakeView).toHaveBeenCalledTimes(1);
  });

  test("should not call views that aren’t specified on the node", () => {
    const otherView = jest.fn();
    renderViewForNode(node, prefix, { otherView }, "otherView");
    expect(otherView).not.toHaveBeenCalled();
  });

  test("should gracefully handle a view function being undefined", () => {
    let threw = false;
    try {
      renderViewForNode(node, prefix, {}, "missingView");
    } catch (error) {
      threw = true;
    }
    expect(threw).toBe(false);
  });
});

describe("renderTree", () => {
  const fakeView = jest.fn();
  const scope = html`
    <section>
      <div data-defo-fake-view="1"></div>
      <div data-defo-fake-view="2"></div>
      <div data-defo-fake-view="3">
        <span data-defo-fake-view="4"></span>
      </div>
    </section>
  `;

  test("calls passed view function for each node", () => {
    renderTree({ prefix, scope, views: { fakeView } });
    expect(fakeView).toHaveBeenCalledTimes(4);
  });
  test("... once only", () => {
    renderTree({ prefix, scope, views: { fakeView } });
    expect(fakeView).toHaveBeenCalledTimes(4);
  });
});
