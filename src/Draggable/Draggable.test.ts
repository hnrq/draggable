import {
  createSandbox,
  triggerEvent,
  TestPlugin,
  clickMouse,
  moveMouse,
  releaseMouse,
  waitForDragDelay,
  waitForRequestAnimationFrame,
} from '../test-utils/helpers';
import Draggable, { defaultOptions } from './Draggable';
import {
  DragStartEvent,
  DragMoveEvent,
  DragStopEvent,
  DragStoppedEvent,
} from './DragEvent';
import {
  DraggableInitializeEvent,
  DraggableDestroyEvent,
  DraggableEvent,
} from './DraggableEvent';
import { Focusable, Mirror, Scrollable, Announcement } from './Plugins';
import { MouseSensor, TouchSensor } from './Sensors';
import { Mock } from 'vitest';
import { getAllByTestId, getByTestId, within } from '@testing-library/dom';

const sampleMarkup = `
  <ul data-testid="container">
    <li data-testid="draggable-item">First item</li>
    <li data-testid="draggable-item">Second item</li>
  </ul>
  <ul data-testid="dynamic-container">
    <li data-testid="draggable-item">First item</li>
    <li data-testid="draggable-item">Second item</li>
  </ul>
`;

describe('Draggable', () => {
  let dom;
  const expectedClientX = 39;
  const expectedClientY = 82;

  beforeEach(() => {
    dom = createSandbox(sampleMarkup);
    vi.useFakeTimers();
  });

  afterEach(() => {
    dom.remove();
    vi.useRealTimers();
  });

  describe('.Plugins', () => {
    it('is available statically', () => {
      expect(Draggable.Plugins).toBeDefined();
      expect(Draggable.Plugins.Mirror).toEqual(Mirror);
      expect(Draggable.Plugins.Focusable).toEqual(Focusable);
      expect(Draggable.Plugins.Scrollable).toEqual(Scrollable);
    });
  });

  describe('#constructor', () => {
    it('is an instance of Draggable', () => {
      const draggable = new Draggable(getByTestId(dom, 'container'), {
        draggable: 'li',
        delay: 0,
      });

      expect(draggable).toBeInstanceOf(Draggable);
    });

    it('initializes with default options', () => {
      const newInstance = new Draggable(getByTestId(dom, 'container'));

      for (const key in defaultOptions) {
        if (defaultOptions.hasOwnProperty(key)) {
          expect(newInstance.options[key]).toEqual(defaultOptions[key]);
        }
      }
    });

    it('sets containers', () => {
      const newInstance = new Draggable(getByTestId(dom, 'container'));

      expect(newInstance.containers).toEqual([getByTestId(dom, 'container')]);
    });

    it('sets single container if a list is not passed', () => {
      const newInstance = new Draggable(getByTestId(dom, 'container')[0]);

      expect(newInstance.containers).toMatchObject([
        getByTestId(dom, 'container'),
      ]);
    });

    it('throws an error if `containers` argument is wrong type', () => {
      expect(() => {
        // @ts-ignore
        return new Draggable({});
      }).toThrow();

      expect(() => {
        // @ts-ignore
        return new Draggable('.li');
      }).toThrow();
    });

    it('attaches default plugins', () => {
      const newInstance = new Draggable();

      expect(newInstance.plugins).toHaveLength(4);
      expect(newInstance.plugins[0]).toBeInstanceOf(Announcement);
      expect(newInstance.plugins[1]).toBeInstanceOf(Focusable);
      expect(newInstance.plugins[2]).toBeInstanceOf(Mirror);
      expect(newInstance.plugins[3]).toBeInstanceOf(Scrollable);
    });

    it('removes default plugins from the list of exclude plugins', () => {
      const newInstance = new Draggable([], {
        exclude: {
          plugins: [Draggable.Plugins.Focusable],
        },
      });

      expect(newInstance.plugins).toHaveLength(3);

      newInstance.plugins.forEach((plugin) => {
        expect(plugin).not.toBeInstanceOf(Focusable);
      });
    });

    it('attaches custom plugins', () => {
      const newInstance = new Draggable([], {
        plugins: [TestPlugin],
      });

      expect(newInstance.plugins).toHaveLength(5);

      const customPlugin = <TestPlugin>newInstance.plugins[4];

      expect(customPlugin.draggable).toBe(newInstance);

      expect(customPlugin.attachFunction).toHaveBeenCalled();

      expect(customPlugin.detachFunction).not.toHaveBeenCalled();
    });

    it('attaches sensors', () => {
      const newInstance = new Draggable([]);

      expect(newInstance.sensors).toHaveLength(2);

      expect(newInstance.sensors[0]).toBeInstanceOf(MouseSensor);

      expect(newInstance.sensors[1]).toBeInstanceOf(TouchSensor);
    });

    it('removes default sensors from the list of exclude sensors', () => {
      const newInstance = new Draggable([], {
        exclude: {
          sensors: [Draggable.Sensors.TouchSensor],
        },
      });

      expect(newInstance.sensors).toHaveLength(1);

      newInstance.sensors.forEach((sensor) => {
        expect(sensor).not.toBeInstanceOf(TouchSensor);
      });
    });

    it('triggers DraggableInitializeEvent on init', () => {
      const spy = vi.spyOn(Draggable.prototype, 'trigger');
      const newInstance = new Draggable();

      expect(spy.mock.calls).toHaveLength(1);

      expect(spy.mock.calls[0][0]).toBeInstanceOf(DraggableInitializeEvent);

      expect((<DraggableEvent>spy.mock.calls[0][0]).draggable).toBe(
        newInstance
      );

      spy.mockReset();
      spy.mockRestore();
    });
  });

  describe('#destroy', () => {
    it('triggers `draggable:destroy` event on destroy', () => {
      const newInstance = new Draggable();
      const callback = vi.fn();

      newInstance.on('draggable:destroy', callback);

      newInstance.destroy();

      const call = callback.mock.calls[0][0];

      expect(call.type).toBe('draggable:destroy');

      expect(call).toBeInstanceOf(DraggableDestroyEvent);

      expect(call.draggable).toBe(newInstance);
    });

    it('calls Plugin#detach once on each of provided plugins', () => {
      const plugins = [TestPlugin, TestPlugin, TestPlugin];
      const newInstance = new Draggable([], {
        plugins,
      });
      const expectedPlugins: TestPlugin[] = newInstance.plugins.slice();

      newInstance.destroy();

      expect(expectedPlugins[4].detachFunction).toHaveBeenCalled();

      expect(expectedPlugins[4].detachFunction).toHaveBeenCalledTimes(1);

      expect(expectedPlugins[5].detachFunction).toHaveBeenCalled();

      expect(expectedPlugins[5].detachFunction).toHaveBeenCalledTimes(1);

      expect(expectedPlugins[6].detachFunction).toHaveBeenCalled();

      expect(expectedPlugins[6].detachFunction).toHaveBeenCalledTimes(1);
    });

    it('removes all sensor event listeners', () => {
      document.removeEventListener = vi.fn();

      const newInstance = new Draggable();

      newInstance.destroy();

      const mockCalls = (<Mock>document.removeEventListener).mock.calls;

      expect(mockCalls[0][0]).toEqual('drag:start');
      expect(mockCalls[1][0]).toEqual('drag:move');
      expect(mockCalls[2][0]).toEqual('drag:stop');
      expect(mockCalls[3][0]).toEqual('drag:pressure');

      (<Mock>document.removeEventListener).mockRestore();
    });
  });

  describe('#on', () => {
    it('adds an event handler to the list of callbacks', () => {
      const newInstance = new Draggable();
      function stubHandler() {
        /* do nothing */
      }

      expect('my:event' in newInstance.emitter.callbacks).toBe(false);

      newInstance.on('my:event', stubHandler);

      expect('my:event' in newInstance.emitter.callbacks).toBe(true);

      expect(newInstance.emitter.callbacks['my:event']).toMatchObject([
        stubHandler,
      ]);
    });

    it('returns a Draggable instance', () => {
      const newInstance = new Draggable();
      function stubHandler() {
        /* do nothing */
      }

      expect('my:event' in newInstance.emitter.callbacks).toBe(false);

      const returnValue = newInstance.on('my:event', stubHandler);

      expect(returnValue).toBe(newInstance);
    });
  });

  describe('#off', () => {
    it('removes event handler from the list of callbacks', () => {
      const newInstance = new Draggable();
      function stubHandler() {
        /* do nothing */
      }

      newInstance.on('my:event', stubHandler);

      expect('my:event' in newInstance.emitter.callbacks).toBe(true);

      newInstance.off('my:event', stubHandler);

      expect('my:event' in newInstance.emitter.callbacks).toBe(true);

      expect(newInstance.emitter.callbacks['my:event']).toMatchObject([]);
    });

    it('returns a Draggable instance', () => {
      const newInstance = new Draggable();
      function stubHandler() {
        /* do nothing */
      }

      newInstance.on('my:event', stubHandler);

      expect('my:event' in newInstance.emitter.callbacks).toBe(true);

      const returnValue = newInstance.off('my:event', stubHandler);

      expect(returnValue).toBe(newInstance);
    });
  });

  describe('#trigger', () => {
    it('invokes bound event', () => {
      const newInstance = new Draggable(getByTestId(dom, 'container'));
      const handler = vi.fn();
      const expectedEvent = new CustomEvent('my:event');

      newInstance.on('my:event', handler);

      newInstance.trigger(expectedEvent);

      expect(handler.mock.calls).toHaveLength(1);

      expect(handler.mock.calls[0]).toHaveLength(1);

      expect(handler.mock.calls[0][0]).toBe(expectedEvent);
    });
  });

  describe('#getDraggableElementsForContainer', () => {
    it('returns draggable elements, excluding mirror and original source', () => {
      const newInstance = new Draggable(getByTestId(dom, 'container'), {
        draggable: 'li',
      });
      const draggableElement = dom.querySelector('li');

      triggerEvent(draggableElement, 'mousedown', { button: 0 });

      // Wait for delay
      waitForDragDelay();

      const containerChildren = newInstance.getDraggableElementsForContainer(
        draggableElement.parentNode
      );

      expect(containerChildren).toHaveLength(2);

      triggerEvent(draggableElement, 'mouseup', { button: 0 });
    });
  });

  describe('#addContainer', () => {
    it('adds single container dynamically', () => {
      const dragOverContainerHandler = vi.fn();
      const container = getByTestId(dom, 'container');
      const newInstance = new Draggable(container, { draggable: 'li' });

      newInstance.on('drag:over:container', dragOverContainerHandler);

      const draggableElement = within(container).getByText('First item');
      const dynamicContainer = getByTestId(dom, 'dynamic-container');

      clickMouse(draggableElement);
      waitForDragDelay();
      moveMouse(dynamicContainer);

      // will be called once after delay
      expect(dragOverContainerHandler).toHaveBeenCalledTimes(1);

      releaseMouse(newInstance.source);

      newInstance.addContainer(<HTMLElement>dynamicContainer);

      expect(newInstance.containers).toEqual([container, dynamicContainer]);

      clickMouse(draggableElement);
      waitForDragDelay();
      moveMouse(dynamicContainer);
      expect(dragOverContainerHandler).toHaveBeenCalledTimes(3);

      releaseMouse(newInstance.source);
    });
  });

  describe('#removeContainer', () => {
    it('removes single container dynamically', () => {
      let dragOverContainerHandler = vi.fn();
      const allContainers = <HTMLElement[]>[
        getByTestId(dom, 'container'),
        getByTestId(dom, 'dynamic-container'),
      ];
      const newInstance = new Draggable(allContainers, {
        draggable: 'li',
      });

      newInstance.on('drag:over:container', dragOverContainerHandler);

      const draggableElement = document.querySelector('li');
      const dynamicContainer = getByTestId(dom, 'dynamic-container');

      clickMouse(draggableElement);
      waitForDragDelay();
      moveMouse(dynamicContainer);

      expect(dragOverContainerHandler).toHaveBeenCalledTimes(2);

      releaseMouse(newInstance.source);

      newInstance.removeContainer(dynamicContainer);

      expect(newInstance.containers).toEqual([
        getByTestId(dom, 'container'),
        getByTestId(dom, 'dynamic-container'),
      ]);

      dragOverContainerHandler = vi.fn();
      newInstance.on('drag:over:container', dragOverContainerHandler);

      clickMouse(draggableElement);
      waitForDragDelay();
      moveMouse(dynamicContainer);

      expect(dragOverContainerHandler).toHaveBeenCalledTimes(1);

      releaseMouse(newInstance.source);
    });
  });

  describe('#getDraggableElements', () => {
    it('returns draggable elements', () => {
      const draggable = new Draggable(getByTestId(dom, 'container'), {
        draggable: 'li',
      });

      expect(draggable.getDraggableElements()).toEqual(
        within(getByTestId(dom, 'container')).getAllByTestId('draggable-item')
      );
    });

    it('returns draggable elements after adding a container', () => {
      const dynamicContainer = getByTestId(dom, 'dynamic-container');
      const draggable = new Draggable(getByTestId(dom, 'container'), {
        draggable: 'li',
      });

      expect(draggable.getDraggableElements()).toEqual(
        within(dynamicContainer).getAllByTestId('draggable-item')
      );

      draggable.addContainer(dynamicContainer);

      expect(draggable.getDraggableElements()).toEqual(
        getAllByTestId(dom, 'draggable-item')
      );

      draggable.removeContainer(dynamicContainer);

      expect(draggable.getDraggableElements()).toEqual(
        within(dynamicContainer).getAllByTestId('draggable-item')
      );
    });
  });

  it('triggers `drag:move` as part of the `drag:start` event', () => {
    const dragStartHandler = vi.fn();
    const dragMoveHandler = vi.fn();

    let dragStartTarget;
    let dragMoveTarget;
    const container = getByTestId(dom, 'container');
    const draggableElement = within(container).getByText('First item');

    const draggable = new Draggable(container, {
      draggable: 'li',
    });

    draggable.on('drag:start', (dragStartEvent) => {
      dragStartTarget = dragStartEvent.sensorEvent.target;
      dragStartHandler(dragStartEvent);
    });

    draggable.on('drag:move', (dragMoveEvent) => {
      dragMoveTarget = dragMoveEvent.sensorEvent.target;
      dragMoveHandler(dragMoveEvent);
    });

    clickMouse(draggableElement);
    waitForDragDelay();
    waitForRequestAnimationFrame();

    expect(dragStartHandler).toHaveBeenCalledTimes(1);
    expect(dragMoveHandler).toHaveBeenCalledTimes(1);

    expect(draggableElement).not.toEqual(draggable.source);
    expect(dragStartTarget).toBe(draggableElement);
    expect(dragMoveTarget).toBe(draggable.source);

    releaseMouse(draggable.source);
  });

  it('triggers `drag:start` drag event on mousedown', () => {
    const newInstance = new Draggable(getByTestId(dom, 'container'), {
      draggable: 'li',
    });
    const draggableElement = dom.querySelector('li');

    const callback = vi.fn();
    newInstance.on('drag:start', callback);

    triggerEvent(draggableElement, 'mousedown', { button: 0 });
    // Wait for delay
    waitForDragDelay();

    const call = callback.mock.calls[0][0];

    expect(call.type).toBe('drag:start');

    expect(call).toBeInstanceOf(DragStartEvent);

    triggerEvent(draggableElement, 'mouseup', { button: 0 });
  });

  it('triggers `drag:start` drag event on dragstart', () => {
    const newInstance = new Draggable(getByTestId(dom, 'container'), {
      draggable: 'li',
    });
    const draggableElement = dom.querySelector('li');

    const callback = vi.fn();
    newInstance.on('drag:start', callback);

    triggerEvent(draggableElement, 'mousedown', { button: 0 });

    // Wait for delay
    waitForDragDelay();

    triggerEvent(draggableElement, 'dragstart', { button: 0 });

    const call = callback.mock.calls[0][0];

    expect(call.type).toBe('drag:start');

    expect(call).toBeInstanceOf(DragStartEvent);

    triggerEvent(draggableElement, 'mouseup', { button: 0 });
  });

  it('cleans up when `drag:start` event is canceled', () => {
    const newInstance = new Draggable(getByTestId(dom, 'container'), {
      draggable: 'li',
    });
    const draggableElement = dom.querySelector('li');

    let source;
    let originalSource;
    const callback = vi.fn((event) => {
      source = event.source;
      originalSource = event.originalSource;
      event.preventDefault();
    });

    newInstance.on('drag:start', callback);

    triggerEvent(draggableElement, 'mousedown', { button: 0 });

    // Wait for delay
    waitForDragDelay();

    triggerEvent(draggableElement, 'dragstart', { button: 0 });

    expect(newInstance.dragging).toBeFalsy();
    expect(source.parentNode).toBeNull();
    expect(originalSource.style.display).toEqual('');
  });

  it('triggers `drag:move` drag event on mousedown', () => {
    const newInstance = new Draggable(getByTestId(dom, 'container'), {
      draggable: 'li',
    });
    const draggableElement = dom.querySelector('li');

    triggerEvent(draggableElement, 'mousedown', { button: 0 });

    // Wait for delay
    waitForDragDelay();

    const callback = vi.fn();
    newInstance.on('drag:move', callback);

    triggerEvent(document.body, 'mousemove', {
      clientX: expectedClientX,
      clientY: expectedClientY,
    });

    const call = callback.mock.calls[0][0];
    const sensorEvent = call.sensorEvent;

    expect(call.type).toBe('drag:move');

    expect(call).toBeInstanceOf(DragMoveEvent);

    expect(sensorEvent.clientX).toBe(expectedClientX);

    expect(sensorEvent.clientY).toBe(expectedClientY);

    triggerEvent(draggableElement, 'mouseup', { button: 0 });
  });

  it('triggers `drag:stop` drag event on mouseup', () => {
    const newInstance = new Draggable(getByTestId(dom, 'container'), {
      draggable: 'li',
    });
    const draggableElement = dom.querySelector('li');

    triggerEvent(draggableElement, 'mousedown', { button: 0 });

    // Wait for delay
    waitForDragDelay();

    const callback = vi.fn();
    newInstance.on('drag:stop', callback);

    triggerEvent(draggableElement, 'mouseup', { button: 0 });

    const call = callback.mock.calls[0][0];

    expect(call.type).toBe('drag:stop');

    expect(call).toBeInstanceOf(DragStopEvent);
  });

  it('triggers `drag:stop` drag event on cancel', () => {
    const newInstance = new Draggable(getByTestId(dom, 'container'), {
      draggable: 'li',
    });

    const draggableElement = dom.querySelector('li');

    triggerEvent(draggableElement, 'mousedown', { button: 0 });

    // Wait for delay
    waitForDragDelay();

    const callback = vi.fn();
    newInstance.on('drag:stop', callback);

    newInstance.cancel();

    const call = callback.mock.calls[0][0];

    expect(call.type).toBe('drag:stop');

    expect(call).toBeInstanceOf(DragStopEvent);
  });

  it('triggers `drag:stopped` drag event on mouseup', () => {
    const newInstance = new Draggable(getByTestId(dom, 'container'), {
      draggable: 'li',
    });
    const draggableElement = dom.querySelector('li');

    triggerEvent(draggableElement, 'mousedown', { button: 0 });

    // Wait for delay
    waitForDragDelay();

    const callback = vi.fn();
    newInstance.on('drag:stopped', callback);

    triggerEvent(draggableElement, 'mouseup', { button: 0 });

    const call = callback.mock.calls[0][0];

    expect(call.type).toBe('drag:stopped');

    expect(call).toBeInstanceOf(DragStoppedEvent);
  });

  it('triggers `drag:stopped` drag event on cancel', () => {
    const newInstance = new Draggable(getByTestId(dom, 'container'), {
      draggable: 'li',
    });
    const draggableElement = dom.querySelector('li');

    triggerEvent(draggableElement, 'mousedown', { button: 0 });

    // Wait for delay
    waitForDragDelay();

    const callback = vi.fn();
    newInstance.on('drag:stopped', callback);

    newInstance.cancel();

    const call = callback.mock.calls[0][0];

    expect(call.type).toBe('drag:stopped');

    expect(call).toBeInstanceOf(DragStoppedEvent);
  });

  it('adds `source:dragging` classname to draggable element on mousedown', () => {
    const newInstance = new Draggable(getByTestId(dom, 'container'), {
      draggable: 'li',
    });
    const draggableElement = dom.querySelector('li');

    triggerEvent(draggableElement, 'mousedown', { button: 0 });

    // Wait for delay
    waitForDragDelay();

    expect([...newInstance.source.classList]).toContain(
      'draggable-source--is-dragging'
    );

    triggerEvent(draggableElement, 'mouseup', { button: 0 });
  });

  it('removes `source:dragging` classname from draggable element on mouseup', () => {
    const newInstance = new Draggable(getByTestId(dom, 'container'), {
      draggable: 'li',
    });
    const draggableElement = dom.querySelector('li');

    triggerEvent(draggableElement, 'mousedown', { button: 0 });

    // Wait for delay
    waitForDragDelay();

    const source = newInstance.source;

    expect([...source.classList]).toContain('draggable-source--is-dragging');

    triggerEvent(draggableElement, 'mouseup', { button: 0 });

    expect([...source.classList]).not.toContain(
      'draggable-source--is-dragging'
    );
  });

  it('removes `source:dragging` classname from draggable element on dragEvent.preventDefault()', () => {
    const newInstance = new Draggable(getByTestId(dom, 'container'), {
      draggable: 'li',
    });
    const draggableElement = dom.querySelector('li');

    newInstance.on('drag:start', (event) => {
      event.preventDefault();
    });

    triggerEvent(draggableElement, 'mousedown', { button: 0 });

    // Wait for delay
    waitForDragDelay();

    const source = newInstance.source;

    expect([...source.classList]).not.toContain(
      'draggable-source--is-dragging'
    );

    triggerEvent(draggableElement, 'mouseup', { button: 0 });
  });

  it('adds `body:dragging` classname to body on mousedown', () => {
    (() =>
      new Draggable(getByTestId(dom, 'container'), {
        draggable: 'li',
      }))();
    const draggableElement = dom.querySelector('li');

    triggerEvent(draggableElement, 'mousedown', { button: 0 });

    // Wait for delay
    waitForDragDelay();

    expect([...document.body.classList]).toContain('draggable--is-dragging');

    triggerEvent(draggableElement, 'mouseup', { button: 0 });
  });

  it('removes `body:dragging` classname from body on mouseup', () => {
    (() =>
      new Draggable(getByTestId(dom, 'container'), {
        draggable: 'li',
      }))();
    const draggableElement = dom.querySelector('li');

    triggerEvent(draggableElement, 'mousedown', { button: 0 });

    // Wait for delay
    waitForDragDelay();
    expect([...document.body.classList]).toContain('draggable--is-dragging');

    triggerEvent(document.body, 'mouseup', { button: 0 });

    expect([...document.body.classList]).not.toContain(
      'draggable--is-dragging'
    );
  });

  it('removes `body:dragging` classname from body on dragEvent.preventDefault()', () => {
    const newInstance = new Draggable(getByTestId(dom, 'container'), {
      draggable: 'li',
    });
    const draggableElement = dom.querySelector('li');

    newInstance.on('drag:start', (event) => {
      event.preventDefault();
    });

    triggerEvent(draggableElement, 'mousedown', { button: 0 });

    // Wait for delay
    waitForDragDelay();

    expect([...document.body.classList]).not.toContain(
      'draggable--is-dragging'
    );

    triggerEvent(draggableElement, 'mouseup', { button: 0 });
  });

  it('adds `container:placed` classname to draggable container element on mouseup', () => {
    (() =>
      new Draggable(getByTestId(dom, 'container'), {
        draggable: 'li',
      }))();
    const draggableElement = dom.querySelector('li');

    triggerEvent(draggableElement, 'mousedown', { button: 0 });

    // Wait for delay
    waitForDragDelay();

    triggerEvent(draggableElement, 'mouseup', { button: 0 });

    expect([...getByTestId(dom, 'container').classList]).toContain(
      'draggable-container--placed'
    );
  });

  it('removes `container:placed` classname from draggable container element on mouseup after delay', () => {
    (() =>
      new Draggable(getByTestId(dom, 'container'), {
        draggable: 'li',
      }))();
    const draggableElement = dom.querySelector('li');

    triggerEvent(draggableElement, 'mousedown', { button: 0 });

    // Wait for delay
    waitForDragDelay();

    triggerEvent(document.body, 'mouseup', { button: 0 });

    expect([...getByTestId(dom, 'container').classList]).toContain(
      'draggable-container--placed'
    );

    // Wait for default draggable.options.placedTimeout delay
    vi.advanceTimersByTime(800);

    expect([...getByTestId(dom, 'container').classList]).not.toContain(
      'draggable-container--placed'
    );
  });

  it('adds `container:dragging` classname to draggable container element on mousedown', () => {
    (() =>
      new Draggable(getByTestId(dom, 'container'), {
        draggable: 'li',
      }))();
    const draggableElement = dom.querySelector('li');

    triggerEvent(draggableElement, 'mousedown', { button: 0 });

    // Wait for delay
    waitForDragDelay();

    expect([...getByTestId(dom, 'container').classList]).toContain(
      'draggable-container--is-dragging'
    );

    triggerEvent(draggableElement, 'mouseup', { button: 0 });
  });

  it('removes `container:dragging` classname from draggable container element on mouseup', () => {
    (() =>
      new Draggable(getByTestId(dom, 'container'), {
        draggable: 'li',
      }))();
    const draggableElement = dom.querySelector('li');

    triggerEvent(draggableElement, 'mousedown', { button: 0 });

    // Wait for delay
    waitForDragDelay();

    expect([...getByTestId(dom, 'container').classList]).toContain(
      'draggable-container--is-dragging'
    );

    triggerEvent(document.body, 'mouseup', { button: 0 });

    expect([...getByTestId(dom, 'container').classList]).not.toContain(
      'draggable-container--is-dragging'
    );
  });

  it('removes `container:dragging` classname from draggable container element on dragEvent.preventDefault()', () => {
    const newInstance = new Draggable(getByTestId(dom, 'container'), {
      draggable: 'li',
    });
    const draggableElement = dom.querySelector('li');

    newInstance.on('drag:start', (event) => {
      event.preventDefault();
    });

    triggerEvent(draggableElement, 'mousedown', { button: 0 });

    // Wait for delay
    waitForDragDelay();

    expect([...getByTestId(dom, 'container').classList]).not.toContain(
      'draggable-container--is-dragging'
    );

    triggerEvent(draggableElement, 'mouseup', { button: 0 });
  });

  it('adds and removes `source:original` on start and stop', () => {
    const newInstance = new Draggable(getByTestId(dom, 'container'), {
      draggable: 'li',
    });
    const draggableElement = dom.querySelector('li');

    triggerEvent(draggableElement, 'mousedown', { button: 0 });

    // Wait for delay
    waitForDragDelay();

    expect(
      draggableElement.classList.contains(
        newInstance.getClassNameFor('source:original')
      )
    ).toBeTruthy();

    triggerEvent(document.body, 'mouseup', { button: 0 });

    expect(
      draggableElement.classList.contains(
        newInstance.getClassNameFor('source:original')
      )
    ).toBeFalsy();
  });

  it('has multiple classes for `source:original` on start', () => {
    const sourceOriginalClasses = ['draggable--original', 'class1', 'class2'];
    const newInstance = new Draggable(getByTestId(dom, 'container'), {
      draggable: 'li',
      classes: {
        'source:original': sourceOriginalClasses,
      },
    });
    const draggableElement = dom.querySelector('li');

    triggerEvent(draggableElement, 'mousedown', { button: 0 });

    // Wait for delay
    waitForDragDelay();

    expect(newInstance.getClassNamesFor('source:original')).toEqual(
      sourceOriginalClasses
    );

    triggerEvent(document.body, 'mouseup', { button: 0 });
  });

  it('removes all draggable classes for `source:original` on stop', () => {
    const sourceOriginalClasses = ['draggable--original', 'class1', 'class2'];
    const newInstance = new Draggable(getByTestId(dom, 'container'), {
      draggable: 'li',
      classes: {
        'source:original': sourceOriginalClasses,
      },
    });
    const draggableElement = dom.querySelector('li');

    triggerEvent(draggableElement, 'mousedown', { button: 0 });

    // Wait for delay
    waitForDragDelay();

    triggerEvent(document.body, 'mouseup', { button: 0 });

    newInstance.getClassNamesFor('source:original').forEach((className) => {
      expect([...draggableElement.classList]).not.toContain(className);
    });
  });

  it('`drag:out:container` event specifies leaving container', () => {
    const newInstance = new Draggable(getByTestId(dom, 'container'), {
      draggable: 'li',
    });

    newInstance.on('drag:over:container', (dragEvent) => {
      expect(dragEvent.overContainer).toEqual(getByTestId(dom, 'container')[0]);
    });

    newInstance.on('drag:out:container', (dragEvent) => {
      expect(dragEvent.overContainer).toEqual(getByTestId(dom, 'container')[0]);
    });

    const draggableElement = dom.querySelector('li');

    triggerEvent(draggableElement, 'mousedown', { button: 0 });

    // Wait for delay
    waitForDragDelay();

    expect(newInstance.isDragging()).toBe(true);

    document.elementFromPoint = () => draggableElement.nextElementSibling;
    triggerEvent(draggableElement.nextElementSibling, 'mousemove', {
      button: 0,
    });

    // Wait for delay
    waitForDragDelay();

    document.elementFromPoint = () => document.body;
    triggerEvent(document.body, 'mousemove', { button: 0 });

    // Wait for delay
    waitForDragDelay();

    triggerEvent(document.body, 'mouseup', { button: 0 });
  });

  describe('when `drag:stopped`', () => {
    it('source element was removed from document', () => {
      const newInstance = new Draggable(getByTestId(dom, 'container'), {
        draggable: 'li',
      });
      const draggableElement = dom.querySelector('li');

      newInstance.on('drag:stopped', (event) => {
        expect(event.source.parentNode).toBeNull();
      });

      clickMouse(draggableElement);

      // Wait for delay
      waitForDragDelay();

      releaseMouse(newInstance.source);
    });
  });

  describe('when `drag:out`', () => {
    it('triggers dragOutEvent', () => {
      const newInstance = new Draggable(getByTestId(dom, 'container'), {
        draggable: 'li',
      });
      const draggableElement = dom.querySelector('li');

      newInstance.on('drag:out', (event) => {
        expect(event.overContainer).toBe(getByTestId(dom, 'container')[0]);
      });

      clickMouse(draggableElement);

      waitForDragDelay();

      document.elementFromPoint = () => draggableElement.nextElementSibling;
      moveMouse(draggableElement.nextElementSibling);

      waitForDragDelay();

      releaseMouse(newInstance.source);
    });
  });
});
