## Sortable

Sortable is built on top of Draggable and allows you to reorder elements. It maintains the order internally and fires
four events on top of the draggable events: `sortable:start`, `sortable:sort`, `sortable:sorted` and `sortable:stop`.

Make sure to nest draggable elements as immediate children elements to their corresponding containers, this is a requirement for `Sortable`.

### Usage

- ES6:

```js
import { Sortable } from '@hnrq/draggable';
// Or
// import Sortable from '@hnrq/draggable/lib/sortable';

const sortable = new Sortable(document.querySelectorAll('ul'), {
  draggable: 'li',
});
```

- Browser (All Bundle):

```html
<script src="https://cdn.jsdelivr.net/npm/@hnrq/draggable@1.0.0-beta.13/lib/draggable.bundle.js"></script>
<script>
  const sortable = new Draggable.Sortable(document.querySelectorAll('ul'), {
    draggable: 'li',
  });
</script>
```

- Browser (Standalone):

```html
<script src="https://cdn.jsdelivr.net/npm/@hnrq/draggable@1.0.0-beta.13/lib/sortable.js"></script>
<script>
  const sortable = new Sortable.default(document.querySelectorAll('ul'), {
    draggable: 'li',
  });
</script>
```

### API

Check out [Draggables API](../Draggable#api) for the base API

### Options

Check out [Draggables options](../Draggable#options) for the base options

### Events

Check out [Draggables events](../Draggable#events) for base events

| Name                                | Description                                       | Cancelable | Cancelable action   |
| ----------------------------------- | ------------------------------------------------- | ---------- | ------------------- |
| [`sortable:start`][sortablestart]   | Gets fired when drag action begins                | true       | Prevents drag start |
| [`sortable:sort`][sortablesort]     | Gets fired before sorting                         | true       | Prevents sorting    |
| [`sortable:sorted`][sortablesorted] | Gets fired when the source gets sorted in the DOM | false      | -                   |
| [`sortable:stop`][sortablestop]     | Gets fired when dragging over other draggable     | false      | -                   |

[sortablestart]: SortableEvent#sortablestartevent
[sortablesort]: SortableEvent#sortablesortevent
[sortablesorted]: SortableEvent#sortablesortedevent
[sortablestop]: SortableEvent#sortablestopevent

### Classes

Check out [Draggables class identifiers](../Draggable#classes)

### Example

This sample code will make list items sortable:

```js
import { Sortable } from '@hnrq/draggable';

const sortable = new Sortable(document.querySelectorAll('ul'), {
  draggable: 'li',
});

sortable.on('sortable:start', () => console.log('sortable:start'));
sortable.on('sortable:sort', () => console.log('sortable:sort'));
sortable.on('sortable:sorted', () => console.log('sortable:sorted'));
sortable.on('sortable:stop', () => console.log('sortable:stop'));
```

### Plans

- Add `copy` option, which will allow draggable elements to be copied when dropped in a different container
- Add `removeOnSpill` option, which will allow draggable elements to be removed from the DOM when dropped outside a container

### Caveats

- Needs draggable elements to be immediate children of draggable containers.
- Currently just appends draggable elements in different containers
