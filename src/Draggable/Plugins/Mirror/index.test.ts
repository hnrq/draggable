import {
  createSandbox,
  clickMouse,
  moveMouse,
  releaseMouse,
  DRAG_DELAY,
  waitForDragDelay,
  waitForRequestAnimationFrame,
} from '../../../test-utils/helpers';

import {
  MirrorCreateEvent,
  MirrorCreatedEvent,
  MirrorAttachedEvent,
  MirrorMoveEvent,
  MirrorMovedEvent,
  MirrorDestroyEvent,
} from './MirrorEvent';

import Draggable, { DraggableOptions, Scrollable } from '../..';
import {
  screen,
  getByTestId,
  getByText,
  waitFor,
  queryByTestId,
} from '@testing-library/dom';
import { Mock } from 'vitest';

const sampleMarkup = `
  <ul data-testid="container">
    <li>First item</li>
  </ul>
`;

describe('Mirror', () => {
  let dom;
  let container;
  let draggable;

  const draggableOptions: DraggableOptions = {
    draggable: 'li',
    delay: DRAG_DELAY,
    exclude: { plugins: [Scrollable] },
  };

  beforeEach(() => {
    dom = createSandbox(sampleMarkup);
    container = getByTestId(dom, 'container');
    vi.useFakeTimers();
    vi.spyOn(global, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => {
    draggable.destroy();
    dom.remove();
    vi.useRealTimers();
    (global.requestAnimationFrame as Mock).mockRestore();
  });

  it('creates mirror element on `drag:start`', async () => {
    draggable = new Draggable(container, draggableOptions);

    clickMouse(getByText(dom, 'First item'));
    waitForDragDelay();

    const mirrorElement = getByTestId(dom, 'mirror');

    expect(mirrorElement).toBeInstanceOf(HTMLElement);

    releaseMouse(draggable.source);
  });

  it('triggers `mirror:create` event on `drag:start`', () => {
    draggable = new Draggable(container, draggableOptions);

    const mirrorCreateHandler = vi.fn();
    let dragEvent;

    draggable.on('mirror:create', mirrorCreateHandler);
    draggable.on(
      'drag:start',
      (dragStartEvent) => (dragEvent = dragStartEvent)
    );

    clickMouse(getByText(dom, 'First item'));
    waitForDragDelay();

    expect(mirrorCreateHandler).toHaveBeenCalledWithEvent(MirrorCreateEvent);
    expect(mirrorCreateHandler).toHaveBeenCalledWithEventProperties({
      dragEvent,
      source: dragEvent.source,
      originalSource: dragEvent.originalSource,
      sourceContainer: dragEvent.sourceContainer,
      sensorEvent: dragEvent.sensorEvent,
      originalEvent: dragEvent.originalEvent,
    });

    releaseMouse(draggable.source);
  });

  it('prevents mirror creation when `drag:start` gets canceled', () => {
    draggable = new Draggable(container, draggableOptions);

    draggable.on('drag:start', (dragEvent) => {
      dragEvent.preventDefault();
    });

    clickMouse(getByText(dom, 'First item'));
    waitForDragDelay();

    const mirrorElement = getByTestId(dom, 'mirror');

    expect(mirrorElement).toBeNull();

    releaseMouse(draggable.source);
  });

  it('prevents mirror creation when `mirror:create` gets canceled', () => {
    draggable = new Draggable(container, draggableOptions);

    draggable.on('mirror:create', (mirrorEvent) => {
      mirrorEvent.preventDefault();
    });

    clickMouse(getByText(dom, 'First item'));
    waitForDragDelay();

    const mirrorElement = getByTestId(dom, 'mirror');

    expect(mirrorElement).toBeNull();

    releaseMouse(draggable.source);
  });

  it('triggers `mirror:created` event on `drag:start`', async () => {
    draggable = new Draggable(container, draggableOptions);

    const mirrorCreatedHandler = vi.fn();
    let dragEvent;

    draggable.on('mirror:created', mirrorCreatedHandler);
    draggable.on(
      'drag:start',
      (dragStartEvent) => (dragEvent = dragStartEvent)
    );

    clickMouse(getByText(dom, 'First item'));
    waitForDragDelay();

    const mirrorElement = getByTestId(dom, 'mirror');

    expect(mirrorCreatedHandler).toHaveBeenCalledWithEvent(MirrorCreatedEvent);
    expect(mirrorCreatedHandler).toHaveBeenCalledWithEventProperties({
      dragEvent,
      mirror: mirrorElement,
      source: dragEvent.source,
      originalSource: dragEvent.originalSource,
      sourceContainer: dragEvent.sourceContainer,
      sensorEvent: dragEvent.sensorEvent,
      originalEvent: dragEvent.originalEvent,
    });

    releaseMouse(draggable.source);
  });

  it('triggers `mirror:attached` event on `drag:start`', async () => {
    draggable = new Draggable(container, draggableOptions);

    const mirrorAttachedHandler = vi.fn();
    let dragEvent;

    draggable.on('mirror:attached', mirrorAttachedHandler);
    draggable.on(
      'drag:start',
      (dragStartEvent) => (dragEvent = dragStartEvent)
    );

    clickMouse(getByText(dom, 'First item'));
    waitForDragDelay();

    const mirrorElement = getByTestId(dom, 'mirror');

    expect(mirrorAttachedHandler).toHaveBeenCalledWithEvent(
      MirrorAttachedEvent
    );
    expect(mirrorAttachedHandler).toHaveBeenCalledWithEventProperties({
      dragEvent,
      mirror: mirrorElement,
      source: dragEvent.source,
      originalSource: dragEvent.originalSource,
      sourceContainer: dragEvent.sourceContainer,
      sensorEvent: dragEvent.sensorEvent,
      originalEvent: dragEvent.originalEvent,
    });

    releaseMouse(draggable.source);
  });

  it('triggers `mirror:move` event on `drag:move`', async () => {
    draggable = new Draggable(container, draggableOptions);

    const mirrorMoveHandler = vi.fn();
    let dragEvent;

    draggable.on('mirror:move', mirrorMoveHandler);
    draggable.on('drag:move', (dragMoveEvent) => (dragEvent = dragMoveEvent));

    clickMouse(getByText(dom, 'First item'));
    waitForDragDelay();

    moveMouse(document.body);

    const mirrorElement = getByTestId(dom, 'mirror');

    expect(mirrorMoveHandler).toHaveBeenCalledWithEvent(MirrorMoveEvent);
    expect(mirrorMoveHandler).toHaveBeenCalledWithEventPropertiets({
      dragEvent,
      mirror: mirrorElement,
      source: dragEvent.source,
      originalSource: dragEvent.originalSource,
      sourceContainer: dragEvent.sourceContainer,
      sensorEvent: dragEvent.sensorEvent,
      originalEvent: dragEvent.originalEvent,
    });

    releaseMouse(draggable.source);
  });

  it('triggers `mirror:moved` event on `drag:move` was done', async () => {
    draggable = new Draggable(container, draggableOptions);

    const mirrorMovedHandler = vi.fn();
    let mirrorMoveEvent;

    draggable.on('mirror:moved', mirrorMovedHandler);
    draggable.on('mirror:move', (evt) => (mirrorMoveEvent = evt));

    clickMouse(getByText(dom, 'First item'));
    waitForDragDelay();

    moveMouse(document.body);

    expect(mirrorMovedHandler).toHaveBeenCalledWithEvent(MirrorMovedEvent);
    expect(mirrorMovedHandler).toHaveBeenCalledWithEventProperties({
      dragEvent: mirrorMoveEvent.dragEvent,
      mirror: mirrorMoveEvent.mirror,
      source: mirrorMoveEvent.source,
      originalSource: mirrorMoveEvent.originalSource,
      sourceContainer: mirrorMoveEvent.sourceContainer,
      sensorEvent: mirrorMoveEvent.sensorEvent,
      originalEvent: mirrorMoveEvent.originalEvent,
    });

    releaseMouse(draggable.source);
  });

  it('prevents `mirror:move` event trigger when `drag:move` gets canceled', async () => {
    draggable = new Draggable(container, draggableOptions);

    const mirrorMoveHandler = vi.fn();
    draggable.on('mirror:move', mirrorMoveHandler);
    draggable.on('drag:move', (dragEvent) => {
      dragEvent.preventDefault();
    });

    clickMouse(getByText(dom, 'First item'));
    waitForDragDelay();

    moveMouse(document.body);

    expect(mirrorMoveHandler).not.toHaveBeenCalledWithEvent(MirrorMoveEvent);

    releaseMouse(draggable.source);
  });

  it.only('moves mirror on `mirror:move`', async () => {
    draggable = new Draggable(container, draggableOptions);

    clickMouse(getByText(dom, 'First item'));
    waitForDragDelay();
    waitForRequestAnimationFrame();

    const mirrorElement = getByTestId(dom, 'mirror');

    await waitFor(() => {
      expect(mirrorElement.style.transform).toBe('translate3d(0px, 0px, 0)');
    });

    moveMouse(document.body, {
      clientX: 100,
      clientY: 100,
    });

    await waitFor(() => {
      expect(mirrorElement.style.transform).toBe(
        'translate3d(100px, 100px, 0)'
      );
    });

    moveMouse(document.body, {
      clientX: 23,
      clientY: 172,
    });

    waitForRequestAnimationFrame();

    expect(mirrorElement.style.transform).toBe('translate3d(23px, 172px, 0)');

    releaseMouse(draggable.source);
  });

  it('moves mirror only when past `thresholdX` or `thresholdY`', async () => {
    draggable = new Draggable(container, {
      ...draggableOptions,
      mirror: {
        thresholdX: 10,
        thresholdY: 50,
      },
    });

    clickMouse(getByText(dom, 'First item'));
    waitForDragDelay();

    const mirrorElement = getByTestId(dom, 'mirror');

    moveMouse(document.body, {
      clientX: 5,
      clientY: 10,
    });

    await waitFor(() => {
      expect(mirrorElement.style.transform).toBe('translate3d(0px, 0px, 0)');
    });

    moveMouse(document.body, {
      clientX: 10,
      clientY: 40,
    });

    expect(mirrorElement.style.transform).toBe('translate3d(10px, 0px, 0)');

    moveMouse(document.body, {
      clientX: 100,
      clientY: 100,
    });

    waitForRequestAnimationFrame();

    expect(mirrorElement.style.transform).toBe('translate3d(100px, 100px, 0)');

    releaseMouse(draggable.source);
  });

  it('prevents mirror movement when `mirror:move` gets canceled', async () => {
    draggable = new Draggable(container, draggableOptions);

    draggable.on('mirror:move', (mirrorEvent) => {
      mirrorEvent.preventDefault();
    });

    clickMouse(getByText(dom, 'First item'));
    waitForDragDelay();

    const mirrorElement = getByTestId(dom, 'mirror');

    await waitFor(() => {
      expect(mirrorElement.style.transform).toBe('translate3d(0px, 0px, 0)');
    });

    moveMouse(document.body, {
      clientX: 100,
      clientY: 100,
    });

    expect(mirrorElement.style.transform).toBe('translate3d(0px, 0px, 0)');

    releaseMouse(draggable.source);
  });

  it('triggers `mirror:destroy` event on `drag:stop`', async () => {
    draggable = new Draggable(container, draggableOptions);

    const mirrorDestroyHandler = vi.fn();
    let dragEvent;

    draggable.on('mirror:destroy', mirrorDestroyHandler);
    draggable.on('drag:stop', (dragStopEvent) => (dragEvent = dragStopEvent));

    clickMouse(getByText(dom, 'First item'));
    waitForDragDelay();

    const mirrorElement = getByTestId(dom, 'mirror');

    releaseMouse(draggable.source);

    expect(mirrorDestroyHandler).toHaveBeenCalledWithEvent(MirrorDestroyEvent);
    expect(mirrorDestroyHandler).toHaveBeenCalledWithEventProperties({
      dragEvent,
      mirror: mirrorElement,
      source: dragEvent.source,
      sourceContainer: dragEvent.sourceContainer,
      sensorEvent: dragEvent.sensorEvent,
      originalEvent: dragEvent.originalEvent,
    });
  });

  it('destroys mirror on `mirror:destroy`', async () => {
    draggable = new Draggable(container, draggableOptions);

    clickMouse(getByText(dom, 'First item'));
    waitForDragDelay();

    expect(getByTestId(dom, 'mirror')).toBeInTheDocument();

    releaseMouse(draggable.source);

    expect(queryByTestId(dom, 'mirror')).not.toBeInTheDocument();
  });

  it('prevents mirror destruction when `mirror:destroy` gets canceled', async () => {
    draggable = new Draggable(container, draggableOptions);

    let mirrorElement;

    draggable.on('mirror:destroy', (mirrorEvent) => {
      mirrorEvent.preventDefault();
    });

    clickMouse(getByText(dom, 'First item'));
    waitForDragDelay();

    mirrorElement = getByTestId(dom, 'mirror');

    expect(mirrorElement).toBeInstanceOf(HTMLElement);

    releaseMouse(draggable.source);

    mirrorElement = getByTestId(dom, 'mirror');

    expect(mirrorElement).toBeInstanceOf(HTMLElement);
  });

  it('appends mirror to source container by default', () => {
    draggable = new Draggable(container, draggableOptions);

    clickMouse(getByText(dom, 'First item'));
    waitForDragDelay();

    const mirrorElement = screen.getByTestId('mirror');

    expect(mirrorElement.parentNode).toBe(draggable.sourceContainer);

    releaseMouse(draggable.source);
  });

  it('appends mirror by css selector', () => {
    draggable = new Draggable(container, {
      ...draggableOptions,
      mirror: { appendTo: 'body' },
    });

    clickMouse(getByText(dom, 'First item'));
    waitForDragDelay();

    const mirrorElement = screen.getByTestId('mirror');

    expect(mirrorElement.parentNode).toBe(document.body);

    releaseMouse(draggable.source);
  });

  it('appends mirror by function', () => {
    draggable = new Draggable(container, {
      ...draggableOptions,
      mirror: { appendTo: () => document.body },
    });

    clickMouse(getByText(dom, 'First item'));
    waitForDragDelay();

    const mirrorElement = screen.getByTestId('mirror');

    expect(mirrorElement.parentNode).toBe(document.body);

    releaseMouse(draggable.source);
  });

  it('appends mirror by element', () => {
    draggable = new Draggable(container, {
      ...draggableOptions,
      mirror: { appendTo: document.body },
    });

    clickMouse(getByText(dom, 'First item'));
    waitForDragDelay();

    const mirrorElement = screen.getByTestId('mirror');

    expect(mirrorElement.parentNode).toBe(document.body);

    releaseMouse(draggable.source);
  });

  describe('when `drag:stopped`', () => {
    it('mirror element was removed from document', async () => {
      draggable = new Draggable(container, draggableOptions);

      clickMouse(getByText(dom, 'First item'));
      waitForDragDelay();

      const mirrorElement = getByTestId(dom, 'mirror');

      draggable.on('drag:stopped', () => {
        expect(mirrorElement.parentNode).toBeNull();
      });

      releaseMouse(draggable.source);
    });
  });
});
