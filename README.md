# Defo

A tiny library (2KB) that simplifies the process of attaching JavaScript
behaviour to the DOM. It does a couple of things:

- Creates a pattern for attaching and scoping behaviour to specific parts of the
  DOM, and for passing data from the DOM to your JavaScript functions.
- Defines an API for managing the life-cycle of DOM-attached behaviour
- Magically handles that life-cycle by reacting to changes to the DOM

## Example usage

Add an element with a `data-defo-*` to your HTML:

```html
<input data-defo-gday-mate="World" />
```

Define a matching view function and pass it to `defo`:

```js
import defo from "defo";
// Create an object to hold our views
const views = {
  // Create a camelCased key matching the dasherized HTML attribute:
  //   data-defo-gday-mate -> gdayMate
  gdayMate: (el, name) => {
    // Attach some behaviour! Each view function receives the bound DOM node
    // and the value of its `defo` attribute as arguments
    el.value = `G’day, {name}!`;
    // Return methods for managing the life-cycle of your view
    return {
      // Called whenever the value of the `defo` attribute changes
      update: (newName, oldName) => {
        el.value = `G’day, {newName}! Bye, ${oldName}`;
      },
      // Caled when the element (or its defo attribute) is removed from the DOM
      destroy: () => {
        el.value = "";
      }
    };
  }
};

// Create a defo instance
const instance = defo({ views });
```

When initialized defo will call the view functions of any matching elements that
are in the DOM, as well as for *any and all future changes to the DOM*.

## Options

The `defo` function takes three options arguments:

* `scope` — a DOM scope for defo to use. Defaults to `document.documentElement`.
* `prefix` — The prefix used for namespacing data attributes. Defaults to `defo`.
* `views` — an object for mapping view functions to known attribute names

## View functions API

View functions are at the core of defo’s functionality. They have a simple
shape:

```js
function viewName(el, props) {
  return {
    update: (nextProps, prevProps) = {},
    destroy: () = {},
  }
}
```

The view function itself will be called on initialization for a given DOM node,
and will receive two agruments:

* `el` — the DOM node that triggered the instance of the function call
* `props` — JSON-parsed version of the relevent `el`s matching data-attribute
  value

### Life-cycle methods

The return value of each view function is expected to be an object defining
`update` and `destroy` methods for managing the full life-cycle of the instance
of a view.

#### Update

`update` will be called whenever the value of a nodes matching data-attribute
is changed. If defined, that method will be called with two arguments:

* `nextProps` — JSON-parsed version of the current attribute value
* `prevProps` — JSON-parsed version of the previous attribute value

#### Destroy

`destroy` will be called whenever a node:

* Is removed from the DOM
* Has its relevant data-attribute removed

### Async views functions

View functions can return a Promise. This will be automatically unwrapped to
retrive any returned life-cycle methods:

```js
async function asyncViewName(el, props) {
  const dependency = await import("dependency");
  // Do something with dependency
  return {
    update: (nextProps, prevProps) = {},
    destroy: () = {},
  }
}
```

## Browser support

Defo should work in [any browser that support MutationObserver](https://caniuse.com/#search=MutationObserver).

## Prior art

- [Viewloader](http://viewloader.icelab.com.au/)
- [Trimmings](https://postlight.github.io/trimmings/)
- [Stimulus](https://stimulusjs.org/)
