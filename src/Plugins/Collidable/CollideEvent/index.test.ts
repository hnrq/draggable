import { CollideEvent, CollideInEvent, CollideOutEvent } from '.';
import { DragEvent } from '../../../Draggable';

describe('CollideEvent', () => {
  describe('#constructor', () => {
    it('is instance of CollideEvent', () => {
      const event = new CollideEvent();

      expect(event).toBeInstanceOf(CollideEvent);
    });

    it('initializes with `type` of `collidable`', () => {
      const event = new CollideEvent();

      expect(event.type).toBe('collidable');
    });

    it('initializes with DragEvent', () => {
      const dragEvent = new DragEvent();
      const event = new CollideEvent({
        detail: { dragEvent },
      });

      expect(event.dragEvent).toBe(dragEvent);
    });
  });
});

describe('CollideInEvent', () => {
  describe('#constructor', () => {
    it('is instance of CollideInEvent', () => {
      const event = new CollideInEvent({
        collidingElement: document.createElement('div'),
        dragEvent: new DragEvent(),
      });

      expect(event).toBeInstanceOf(CollideInEvent);
    });

    it('initializes with `type` of `collide:in`', () => {
      const event = new CollideInEvent({
        collidingElement: document.createElement('div'),
        dragEvent: new DragEvent(),
      });

      expect(event.type).toBe('collide:in');
    });

    it('initializes with collidingElement', () => {
      const collidingElement = document.createElement('div');
      const event = new CollideInEvent({
        collidingElement,
        dragEvent: new DragEvent(),
      });

      expect(event.collidingElement).toBe(collidingElement);
    });
  });
});

describe('CollideOutEvent', () => {
  describe('#constructor', () => {
    it('is instance of CollideOutEvent', () => {
      const event = new CollideOutEvent({
        collidingElement: document.createElement('div'),
        dragEvent: new DragEvent(),
      });

      expect(event).toBeInstanceOf(CollideOutEvent);
    });

    it('initializes with `type` of `collide:out`', () => {
      const event = new CollideOutEvent({
        collidingElement: document.createElement('div'),
        dragEvent: new DragEvent(),
      });

      expect(event.type).toBe('collide:out');
    });

    it('initializes with collidingElement', () => {
      const collidingElement = document.createElement('div');
      const event = new CollideOutEvent({
        collidingElement,
        dragEvent: new DragEvent(),
      });

      expect(event.collidingElement).toBe(collidingElement);
    });
  });
});
