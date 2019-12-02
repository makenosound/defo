# Defo

A tiny library that simplifies the process of attaching JavaScript behaviour to the DOM.

## Usage

```html
 // Add a `data-defo-*` attribute
<input data-defo-hello="World">

<script>
  import defo from "defo";
  // Create an object to hold our views
  const views = {
    // Create a camelCased key matching the dasherized data-view-hello-world
    // from our HTML: data-view-hello-world -> helloWorld
    helloWorld: (el, name) => {
      // The DOM node is passed here as `el` so we can do stuff!
      el.value = `Hello, {name}!`;
      return {
        update: (newName, oldName) => {
          el.value = `Hello, {newName}! Goodbye, ${oldName}`;
        },
        destroy: () => {
          el.value = "";
        }
      }
    }
  }

  // Create a defo instance
  const instance = defo({views});
</script>
```

## Prior art

- [Viewloader](http://viewloader.icelab.com.au/)
- [Trimmings](https://postlight.github.io/trimmings/)
- [Stimulus](https://stimulusjs.org/)
