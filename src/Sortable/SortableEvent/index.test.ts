import {
  SortableEvent,
  SortableStartEvent,
  SortableSortEvent,
  SortableSortedEvent,
  SortableStopEvent,
} from '.';
import { DragEvent, DragOverContainerEvent } from '../../Draggable';

describe('SortableEvent', () => {
  describe('#constructor', () => {
    it('is instance of SortableEvent', () => {
      const event = new SortableEvent({
        detail: { dragEvent: new DragEvent() },
      });

      expect(event).toBeInstanceOf(SortableEvent);
    });

    it('initializes with `type` of `sortable`', () => {
      const event = new SortableEvent({
        detail: { dragEvent: new DragEvent() },
      });

      expect(event.type).toBe('sortable');
    });

    it('initializes with dragEvent', () => {
      const dragEvent = new DragEvent();
      const event = new SortableEvent({
        detail: { dragEvent },
      });

      expect(event.dragEvent).toBe(dragEvent);
    });
  });

  it('creates a clone of SortableEvent', () => {
    const dragEvent = new DragEvent();
    const event = new SortableEvent({
      detail: { dragEvent: new DragEvent() },
    });
    const clone = event.clone({ dragEvent });

    expect(clone.type).toBe('sortable');
    expect(clone.dragEvent).toBe(dragEvent);
  });
});

describe('SortableStartEvent', () => {
  describe('#constructor', () => {
    it('initializes with `type` of `sortable:start`', () => {
      const event = new SortableStartEvent({
        dragEvent: new DragEvent(),
        startIndex: 0,
        startContainer: document.createElement('div'),
      });

      expect(event.type).toBe('sortable:start');
    });

    it('initializes with startIndex', () => {
      const startIndex = 0;
      const event = new SortableStartEvent({
        startIndex,
        dragEvent: new DragEvent(),
        startContainer: document.createElement('div'),
      });

      expect(event.startIndex).toBe(startIndex);
    });

    it('initializes with startIndex', () => {
      const startContainer = document.createElement('div');
      const event = new SortableStartEvent({
        startIndex: 0,
        startContainer,
        dragEvent: new DragEvent(),
      });

      expect(event.startContainer).toBe(startContainer);
    });
  });

  it('is cancellable', () => {
    const event = new SortableStartEvent({
      dragEvent: new DragEvent(),
      startIndex: 0,
      startContainer: document.createElement('div'),
    });

    event.preventDefault();
    expect(event.defaultPrevented).toBe(true);
  });

  it('creates a clone of SortableStartEvent', () => {
    const dragEvent = new DragEvent();

    const event = new SortableStartEvent({
      dragEvent,
      startIndex: 0,
      startContainer: document.createElement('div'),
    });
    const clone = event.clone({ dragEvent });

    expect(clone.type).toBe('sortable:start');
    expect(clone.dragEvent).toBe(dragEvent);
  });
});

describe('SortableSortEvent', () => {
  describe('#constructor', () => {
    it('initializes with `type` of `sortable:sort`', () => {
      const source = document.createElement('div');
      const overContainer = document.createElement('div');

      const event = new SortableSortEvent({
        currentIndex: 0,
        overContainer,
        source,
        dragEvent: new DragOverContainerEvent({ source, overContainer }),
      });

      expect(event.type).toBe('sortable:sort');
    });

    it('initializes with source', () => {
      const source = document.createElement('div');
      const overContainer = document.createElement('div');

      const event = new SortableSortEvent({
        currentIndex: 0,
        overContainer,
        source,
        dragEvent: new DragOverContainerEvent({ source, overContainer }),
      });

      expect(event.source).toBe(source);
    });

    it('initializes with overContainer', () => {
      const source = document.createElement('div');
      const overContainer = document.createElement('div');

      const event = new SortableSortEvent({
        currentIndex: 0,
        overContainer,
        source,
        dragEvent: new DragOverContainerEvent({ source, overContainer }),
      });

      expect(event.overContainer).toBe(overContainer);
    });

    it('initializes with currentIndex', () => {
      const source = document.createElement('div');
      const overContainer = document.createElement('div');
      const currentIndex = 0;

      const event = new SortableSortEvent({
        currentIndex,
        overContainer,
        source,
        dragEvent: new DragOverContainerEvent({ source, overContainer }),
      });

      expect(event.currentIndex).toBe(currentIndex);
    });
  });

  it('is cancellable', () => {
    const source = document.createElement('div');
    const overContainer = document.createElement('div');

    const event = new SortableSortEvent({
      currentIndex: 0,
      overContainer,
      source,
      dragEvent: new DragOverContainerEvent({ source, overContainer }),
    });

    event.preventDefault();
    expect(event.defaultPrevented).toBe(true);
  });

  it('creates a clone of SortableSortEvent', () => {
    const source = document.createElement('div');
    const overContainer = document.createElement('div');
    const newSource = document.createElement('h1');

    const event = new SortableSortEvent({
      currentIndex: 0,
      overContainer,
      source,
      dragEvent: new DragOverContainerEvent({ source, overContainer }),
    });

    const clone = event.clone({ source: newSource });
    expect(clone.type).toBe('sortable:sort');

    expect(clone.source).toBe(newSource);
  });
});

describe('SortableSortedEvent', () => {
  describe('#constructor', () => {
    it('initializes with `type` of `sortable:sorted`', () => {
      const newContainer = document.createElement('h1');

      const event = new SortableSortedEvent({
        oldIndex: 0,
        newIndex: 1,
        newContainer,
        oldContainer: document.createElement('div'),
        dragEvent: new DragOverContainerEvent({
          source: document.createElement('h2'),
          overContainer: newContainer,
        }),
      });

      expect(event.type).toBe('sortable:sorted');
    });

    it('initializes with oldContainer`', () => {
      const newContainer = document.createElement('h1');
      const oldContainer = document.createElement('h1');

      const event = new SortableSortedEvent({
        oldIndex: 0,
        newIndex: 1,
        newContainer,
        oldContainer,
        dragEvent: new DragOverContainerEvent({
          source: document.createElement('h2'),
          overContainer: newContainer,
        }),
      });

      expect(event.oldContainer).toBe(oldContainer);
    });

    it('initializes with newContainer`', () => {
      const newContainer = document.createElement('h1');

      const event = new SortableSortedEvent({
        oldIndex: 0,
        newIndex: 1,
        newContainer,
        oldContainer: document.createElement('h1'),
        dragEvent: new DragOverContainerEvent({
          source: document.createElement('h2'),
          overContainer: newContainer,
        }),
      });

      expect(event.newContainer).toBe(newContainer);
    });

    it('initializes with oldIndex`', () => {
      const newContainer = document.createElement('h1');
      const oldIndex = 3;

      const event = new SortableSortedEvent({
        oldIndex,
        newIndex: 1,
        newContainer,
        oldContainer: document.createElement('h1'),
        dragEvent: new DragOverContainerEvent({
          source: document.createElement('h2'),
          overContainer: newContainer,
        }),
      });

      expect(event.oldIndex).toBe(oldIndex);
    });

    it('initializes with newIndex`', () => {
      const newContainer = document.createElement('h1');
      const newIndex = 3;

      const event = new SortableSortedEvent({
        newIndex,
        oldIndex: 1,
        newContainer,
        oldContainer: document.createElement('h1'),
        dragEvent: new DragOverContainerEvent({
          source: document.createElement('h2'),
          overContainer: newContainer,
        }),
      });

      expect(event.newIndex).toBe(newIndex);
    });
  });

  it('creates a clone of SortableSortedEvent', () => {
    const newContainer = document.createElement('h1');
    const newIndex = 3;

    const event = new SortableSortedEvent({
      oldIndex: 0,
      newIndex: 1,
      newContainer,
      oldContainer: document.createElement('div'),
      dragEvent: new DragOverContainerEvent({
        source: document.createElement('h2'),
        overContainer: newContainer,
      }),
    });

    const clone = event.clone({ newIndex });
    expect(clone.type).toBe('sortable:sorted');

    expect(clone.newIndex).toBe(newIndex);
  });
});

describe('SortableStopEvent', () => {
  describe('#constructor', () => {
    it('initializes with `type` of `sortable:stop`', () => {
      const newContainer = document.createElement('h1');

      const event = new SortableStopEvent({
        oldIndex: 0,
        newIndex: 1,
        newContainer,
        oldContainer: document.createElement('div'),
        dragEvent: new DragOverContainerEvent({
          source: document.createElement('h2'),
          overContainer: newContainer,
        }),
      });

      expect(event.type).toBe('sortable:stop');
    });

    it('initializes with oldContainer`', () => {
      const newContainer = document.createElement('h1');
      const oldContainer = document.createElement('h1');

      const event = new SortableStopEvent({
        oldIndex: 0,
        newIndex: 1,
        newContainer,
        oldContainer,
        dragEvent: new DragOverContainerEvent({
          source: document.createElement('h2'),
          overContainer: newContainer,
        }),
      });

      expect(event.oldContainer).toBe(oldContainer);
    });

    it('initializes with newContainer`', () => {
      const newContainer = document.createElement('h1');

      const event = new SortableStopEvent({
        oldIndex: 0,
        newIndex: 1,
        newContainer,
        oldContainer: document.createElement('h1'),
        dragEvent: new DragOverContainerEvent({
          source: document.createElement('h2'),
          overContainer: newContainer,
        }),
      });

      expect(event.newContainer).toBe(newContainer);
    });

    it('initializes with oldIndex`', () => {
      const newContainer = document.createElement('h1');
      const oldIndex = 3;

      const event = new SortableStopEvent({
        oldIndex,
        newIndex: 1,
        newContainer,
        oldContainer: document.createElement('h1'),
        dragEvent: new DragOverContainerEvent({
          source: document.createElement('h2'),
          overContainer: newContainer,
        }),
      });

      expect(event.oldIndex).toBe(oldIndex);
    });

    it('initializes with newIndex`', () => {
      const newContainer = document.createElement('h1');
      const newIndex = 3;

      const event = new SortableStopEvent({
        newIndex,
        oldIndex: 1,
        newContainer,
        oldContainer: document.createElement('h1'),
        dragEvent: new DragOverContainerEvent({
          source: document.createElement('h2'),
          overContainer: newContainer,
        }),
      });

      expect(event.newIndex).toBe(newIndex);
    });
  });

  it('creates a clone of SortableStopEvent', () => {
    const newContainer = document.createElement('h1');
    const newIndex = 3;

    const event = new SortableStopEvent({
      oldIndex: 0,
      newIndex: 1,
      newContainer,
      oldContainer: document.createElement('div'),
      dragEvent: new DragOverContainerEvent({
        source: document.createElement('h2'),
        overContainer: newContainer,
      }),
    });

    const clone = event.clone({ newIndex });
    expect(clone.type).toBe('sortable:stop');

    expect(clone.newIndex).toBe(newIndex);
  });
});
