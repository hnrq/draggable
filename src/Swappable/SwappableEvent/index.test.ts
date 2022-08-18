import {
  SwappableEvent,
  SwappableStartEvent,
  SwappableSwapEvent,
  SwappableSwappedEvent,
  SwappableStopEvent,
} from '.';
import { DragEvent, DragOverContainerEvent } from '../../Draggable';

describe('SwappableEvent', () => {
  describe('#constructor', () => {
    it('is instance of SwappableEvent', () => {
      const event = new SwappableEvent({
        detail: { dragEvent: new DragEvent() },
      });

      expect(event).toBeInstanceOf(SwappableEvent);
    });

    it('initializes with `type` of `swappable`', () => {
      const event = new SwappableEvent({
        detail: { dragEvent: new DragEvent() },
      });

      expect(event.type).toBe('swappable');
    });

    it('initializes with dragEvent', () => {
      const dragEvent = new DragEvent();
      const event = new SwappableEvent({
        detail: { dragEvent },
      });

      expect(event.dragEvent).toBe(dragEvent);
    });
  });

  it('creates a clone of SwappableEvent', () => {
    const dragEvent = new DragEvent();
    const event = new SwappableEvent({
      detail: { dragEvent: new DragEvent() },
    });
    const clone = event.clone({ dragEvent });

    expect(clone.type).toBe('swappable');
    expect(clone.dragEvent).toBe(dragEvent);
  });
});

describe('SwappableStartEvent', () => {
  describe('#constructor', () => {
    it('initializes with `type` of `swappable:start`', () => {
      const event = new SwappableStartEvent({ dragEvent: new DragEvent() });

      expect(event.type).toBe('swappable:start');
    });
  });

  it('is cancellable', () => {
    const event = new SwappableStartEvent({ dragEvent: new DragEvent() });

    event.preventDefault();
    expect(event.defaultPrevented).toBe(true);
  });

  it('creates a clone of SwappableStartEvent', () => {
    const dragEvent = new DragEvent();

    const event = new SwappableStartEvent({
      dragEvent: undefined as unknown as DragEvent,
    });
    const clone = event.clone({ dragEvent });

    expect(clone.type).toBe('swappable:start');
    expect(clone.dragEvent).toBe(dragEvent);
  });
});

describe('SwappableSwapEvent', () => {
  describe('#constructor', () => {
    it('initializes with `type` of `swappable:swap`', () => {
      const event = new SwappableSwapEvent({
        over: document.createElement('h1'),
        overContainer: document.createElement('div'),
        dragEvent: new DragEvent(),
      });

      expect(event.type).toBe('swappable:swap');
    });

    it('initializes with over', () => {
      const over = document.createElement('h1');

      const event = new SwappableSwapEvent({
        over,
        overContainer: document.createElement('div'),
        dragEvent: new DragEvent(),
      });

      expect(event.over).toBe(over);
    });

    it('initializes with overContainer', () => {
      const overContainer = document.createElement('h1');

      const event = new SwappableSwapEvent({
        overContainer,
        over: document.createElement('div'),
        dragEvent: new DragEvent(),
      });

      expect(event.overContainer).toBe(overContainer);
    });
  });

  it('is cancellable', () => {
    const event = new SwappableSwapEvent({
      overContainer: document.createElement('div'),
      over: document.createElement('div'),
      dragEvent: new DragEvent(),
    });

    event.preventDefault();
    expect(event.defaultPrevented).toBe(true);
  });

  it('creates a clone of SwappableSwapEvent', () => {
    const newOver = document.createElement('h1');

    const event = new SwappableSwapEvent({
      over: document.createElement('h1'),
      overContainer: document.createElement('div'),
      dragEvent: new DragEvent(),
    });

    const clone = event.clone({ over: newOver });
    expect(clone.type).toBe('swappable:swap');

    expect(clone.over).toBe(newOver);
  });
});

describe('SwappableSwappedEvent', () => {
  describe('#constructor', () => {
    it('initializes with `type` of `swappable:swapped`', () => {
      const event = new SwappableSwappedEvent({
        swappedElement: document.createElement('h1'),
        dragEvent: new DragEvent(),
      });

      expect(event.type).toBe('swappable:swapped');
    });

    it('initializes with swappedElement`', () => {
      const swappedElement = document.createElement('h1');
      const oldContainer = document.createElement('h1');

      const event = new SwappableSwappedEvent({
        swappedElement,
        dragEvent: new DragEvent(),
      });

      expect(event.swappedElement).toBe(swappedElement);
    });
  });

  it('creates a clone of SwappableSwappedEvent', () => {
    const newSwappedElement = document.createElement('h1');

    const event = new SwappableSwappedEvent({
      swappedElement: document.createElement('div'),
      dragEvent: new DragEvent(),
    });

    const clone = event.clone({ swappedElement: newSwappedElement });
    expect(clone.type).toBe('swappable:swapped');

    expect(clone.swappedElement).toBe(newSwappedElement);
  });
});

describe('SwappableStopEvent', () => {
  describe('#constructor', () => {
    it('initializes with `type` of `swappable:stop`', () => {
      const event = new SwappableStopEvent({ dragEvent: new DragEvent() });
      expect(event.type).toBe('swappable:stop');
    });
  });

  it('creates a clone of SwappableStopEvent', () => {
    const dragEvent = new DragEvent();
    const event = new SwappableStopEvent({
      dragEvent: undefined as unknown as DragEvent,
    });

    const clone = event.clone({ dragEvent });
    expect(clone.type).toBe('swappable:stop');

    expect(clone.dragEvent).toBe(dragEvent);
  });
});
