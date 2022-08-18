## Collidable

When you use the collidable plugin you can specify which elements you **can't** drag over and it will freeze
the mirror movement for you. These currently only work with `Sortable`, `Swappable` and `Droppable`.

This plugin is not included by default, so make sure to import it before using.

### Usage

- ES6:

```js
import { Draggable, Plugins } from '@hnrq/draggable';
// Or
// import Draggable from '@hnrq/draggable/lib/draggable';
// import Collidable from '@hnrq/draggable/lib/plugins/collidable';

const draggable = new Draggable(document.querySelectorAll('ul'), {
  draggable: 'li',
  collidables: '.other-list',
  plugins: [Plugins.Collidable], // Or [Collidable]
});
```

- Browser (All bundle):

```html
<script src="https://cdn.jsdelivr.net/npm/@hnrq/draggable@1.0.0-beta.13/lib/draggable.bundle.js"></script>
<script>
  const draggable = new Draggable.Draggable(document.querySelectorAll('ul'), {
    draggable: 'li',
    collidables: '.other-list',
    plugins: [Draggable.Plugins.Collidable],
  });
</script>
```

- Browser (Standalone):

```html
<script src="https://cdn.jsdelivr.net/npm/@hnrq/draggable@1.0.0-beta.13/lib/draggable.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@hnrq/draggable@1.0.0-beta.13/lib/plugins/collidable.js"></script>
<script>
  const draggable = new Draggable.default(document.querySelectorAll('ul'), {
    draggable: 'li',
    collidables: '.other-list',
    plugins: [Collidable.default],
  });
</script>
```

### Options

**`collidables {String|HTMLElement[]|NodeList|HTMLElement|Function}`**  
A css selector string, an array of elements, a NodeList, a HTMLElement or a function returning elements for collidable elements.

### Events

| Name                        | Description                                             | Cancelable | Cancelable action |
| --------------------------- | ------------------------------------------------------- | ---------- | ----------------- |
| [`collide:in`][collidein]   | Gets fired when dragging near a collidable element      | false      | -                 |
| [`collide:out`][collideout] | Gets fired when dragging away from a collidable element | false      | -                 |

[collidein]: CollidableEvent#collideinevent
[collideout]: CollidableEvent#collideoutevent

### Example

```js
import { Sortable, Plugins } from '@hnrq/draggable';

const sortable = new Sortable(document.querySelectorAll('ul'), {
  draggable: 'li',
  collidables: '.other-list',
  plugins: [Plugins.Collidable],
});

sortable.on('collide:in', () => console.log('collide:in'));
sortable.on('collide:out', () => console.log('collide:out'));
```

### Plans

- Improving collision detection for mirror

### Caveats

- Currently only bases collision based on mouse cursor and not mirror element
