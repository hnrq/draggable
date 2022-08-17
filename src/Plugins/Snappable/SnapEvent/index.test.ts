import { SnapEvent, SnapInEvent, SnapOutEvent } from '.';
import { DragEvent } from '../../../Draggable';

describe('SnapEvent', () => {
  describe('#constructor', () => {
    it('is instance of SnapEvent', () => {
      const event = new SnapEvent();

      expect(event).toBeInstanceOf(SnapEvent);
    });

    it('initializes with `type` of `snap`', () => {
      const event = new SnapEvent();

      expect(event.type).toBe('snap');
    });

    it('initializes with DragEvent', () => {
      const dragEvent = new DragEvent();
      const event = new SnapEvent({
        detail: { dragEvent, snappingElement: document.createElement('div') },
      });

      expect(event.dragEvent).toBe(dragEvent);
    });

    it('initializes with a snappingElement element', () => {
      const snappingElement = document.createElement('div');
      const event = new SnapEvent({
        detail: { dragEvent: new DragEvent(), snappingElement },
      });

      expect(event.snappingElement).toBe(snappingElement);
    });
  });
});

describe('SnapInEvent', () => {
  describe('#constructor', () => {
    it('is instance of SnapInEvent', () => {
      const event = new SnapInEvent({
        snappingElement: document.createElement('div'),
        dragEvent: new DragEvent(),
      });

      expect(event).toBeInstanceOf(SnapInEvent);
    });

    it('initializes with `type` of `snap:in`', () => {
      const event = new SnapInEvent({
        snappingElement: document.createElement('div'),
        dragEvent: new DragEvent(),
      });

      expect(event.type).toBe('snap:in');
    });

    it('is cancellable', () => {
      const event = new SnapInEvent({
        snappingElement: document.createElement('div'),
        dragEvent: new DragEvent(),
      });

      event.preventDefault();

      expect(event.defaultPrevented).toBe(true);
    });
  });
});

describe('SnapOutEvent', () => {
  describe('#constructor', () => {
    it('is instance of SnapOutEvent', () => {
      const event = new SnapOutEvent({
        snappingElement: document.createElement('div'),
        dragEvent: new DragEvent(),
      });

      expect(event).toBeInstanceOf(SnapOutEvent);
    });

    it('initializes with `type` of `snap:out`', () => {
      const event = new SnapOutEvent({
        snappingElement: document.createElement('div'),
        dragEvent: new DragEvent(),
      });

      expect(event.type).toBe('snap:out');
    });
  });
});
