import {
  createSandbox,
  triggerEvent,
  waitForDragDelay,
  DRAG_DELAY,
  clickMouse,
  moveMouse,
  releaseMouse,
} from '../../../test-utils/helpers';
import MouseSensor from '.';
import { getByTestId, getByText } from '@testing-library/dom';

const sampleMarkup = `
  <ul data-testid="container">
    <li class="draggable">
      <div class="handle">First handle</div>
      First item
    </li>
    <li class="draggable">
      <div class="handle">Second handle</div>
      Second item
    </li>
    <li class="non-draggable">
      <div class="handle">Non draggable handle</div>
      Non draggable item
    </li>
  </ul>
`;

describe('MouseSensor', () => {
  let dom;
  let mouseSensor;

  const setup = (optionsParam = {}) => {
    dom = createSandbox(sampleMarkup);
    mouseSensor = new MouseSensor(getByTestId(dom, 'container'), {
      draggable: '.draggable',
      delay: 0,
      distance: 0,
      ...optionsParam,
    });
    mouseSensor.attach();
    vi.useFakeTimers();
  };

  const teardown = () => {
    mouseSensor.detach();
    dom.remove();
    vi.useRealTimers();
  };

  describe('common', () => {
    beforeEach(setup);

    afterEach(teardown);

    it('does not trigger `drag:start` event when clicking on non draggable element', () => {
      function dragFlow() {
        clickMouse(document.body);
        waitForDragDelay();
        clickMouse(getByText(dom, 'Non draggable item'));
        waitForDragDelay();
      }

      expect(dragFlow).not.toHaveTriggeredSensorEvent('drag:start');
    });

    it('prevents context menu while dragging', () => {
      let contextMenuEvent = triggerEvent(
        getByText(dom, 'First item'),
        'contextmenu'
      );

      expect(contextMenuEvent.defaultPrevented).toBe(false);

      clickMouse(getByText(dom, 'First item'));
      waitForDragDelay();
      contextMenuEvent = triggerEvent(
        getByText(dom, 'First item'),
        'contextmenu'
      );

      expect(contextMenuEvent.defaultPrevented).toBe(true);

      releaseMouse(getByText(dom, 'First item'));
    });

    it('prevents native drag when initiating drag flow', () => {
      let dragEvent = triggerEvent(getByText(dom, 'First item'), 'dragstart');

      expect(dragEvent.defaultPrevented).toBe(false);

      clickMouse(getByText(dom, 'First item'));
      dragEvent = triggerEvent(getByText(dom, 'First item'), 'dragstart');

      expect(dragEvent.defaultPrevented).toBe(true);

      releaseMouse(document.body);
    });

    it('does not prevent `dragstart` event when attempting to drag outside of draggable container', () => {
      clickMouse(document.body);
      moveMouse(document, { pageX: 1, pageY: 1 });
      const nativeDragEvent = triggerEvent(
        getByText(dom, 'First item'),
        'dragstart'
      );

      expect(nativeDragEvent.defaultPrevented).toBe(false);

      releaseMouse(document.body);
    });

    it('does not prevent `dragstart` event when attempting to drag non draggable element', () => {
      clickMouse(getByText(dom, 'Non draggable item'));
      moveMouse(document, { pageX: 1, pageY: 1 });
      const nativeDragEvent = triggerEvent(
        getByText(dom, 'Non draggable item'),
        'dragstart'
      );

      expect(nativeDragEvent.defaultPrevented).toBe(false);

      releaseMouse(document.body);
    });

    it('triggers `drag:stop` event when releasing mouse while dragging', () => {
      function dragFlow() {
        clickMouse(getByText(dom, 'First item'));
        waitForDragDelay();
        releaseMouse(document.body);
      }

      expect(dragFlow).toHaveTriggeredSensorEvent('drag:stop');
    });

    it('does not trigger `drag:start` event when right clicking or holding ctrl or meta key', () => {
      function dragFlowWithRightClick() {
        clickMouse(getByText(dom, 'First item'), { button: 2 });
        waitForDragDelay();
        releaseMouse(document.body);
      }

      function dragFlowWithCtrlKey() {
        clickMouse(getByText(dom, 'First item'), { ctrlKey: true });
        waitForDragDelay();
        releaseMouse(document.body);
      }

      function dragFlowWithMetaKey() {
        clickMouse(getByText(dom, 'First item'), { metaKey: true });
        waitForDragDelay();
        releaseMouse(document.body);
      }

      [
        dragFlowWithRightClick,
        dragFlowWithCtrlKey,
        dragFlowWithMetaKey,
      ].forEach((dragFlow) => {
        expect(dragFlow).not.toHaveTriggeredSensorEvent('drag:start');
      });
    });

    it('cancels `drag:start` event when canceling sensor event', () => {
      dom.addEventListener('drag:start', (event) => {
        event.detail.preventDefault();
      });

      function dragFlow() {
        clickMouse(getByText(dom, 'First item'));
        waitForDragDelay();
        releaseMouse(getByText(dom, 'First item'));
      }

      expect(dragFlow).toHaveCanceledSensorEvent('drag:start');
    });
  });

  describe('using handle', () => {
    let handleInDraggableElement;
    let handleInNonDraggableElement;

    beforeEach(() => {
      setup({ handle: '.handle' });
      handleInDraggableElement = dom.querySelector('.draggable .handle');
      handleInNonDraggableElement = dom.querySelector('.non-draggable .handle');
    });

    afterEach(teardown);

    it('does not prevent `dragstart` event when attempting to drag handle in non draggable element', () => {
      clickMouse(handleInNonDraggableElement);
      moveMouse(document, { pageX: 1, pageY: 1 });
      const nativeDragEvent = triggerEvent(
        handleInNonDraggableElement,
        'dragstart'
      );

      expect(nativeDragEvent.defaultPrevented).toBe(false);

      releaseMouse(document.body);
    });

    it('prevent `dragstart` event when attempting to drag handle in draggable element', () => {
      clickMouse(handleInDraggableElement);
      moveMouse(document, { pageX: 1, pageY: 1 });
      const nativeDragEvent = triggerEvent(
        handleInDraggableElement,
        'dragstart'
      );

      expect(nativeDragEvent.defaultPrevented).toBe(true);

      releaseMouse(document.body);
    });

    it('does not prevent `dragstart` event when attempting to drag outside of handle inside of draggable', () => {
      clickMouse(getByText(dom, 'First item'));
      moveMouse(document, { pageX: 1, pageY: 1 });
      const nativeDragEvent = triggerEvent(
        getByText(dom, 'First item'),
        'dragstart'
      );

      expect(nativeDragEvent.defaultPrevented).toBe(false);

      releaseMouse(document.body);
    });
  });

  describe('using distance', () => {
    beforeEach(() => {
      setup({ distance: 1 });
    });

    afterEach(teardown);

    it('triggers `drag:start` sensor event on mousemove after distance has been met', () => {
      function dragFlow() {
        clickMouse(getByText(dom, 'First item'));
        moveMouse(getByText(dom, 'First item'), { pageY: 1, pageX: 0 });
        releaseMouse(document.body);
      }

      expect(dragFlow).toHaveTriggeredSensorEvent('drag:start');
    });

    it('does not trigger `drag:start` event releasing mouse before distance has been met', () => {
      function dragFlow() {
        clickMouse(getByText(dom, 'First item'));
        moveMouse(getByText(dom, 'First item'), { pageY: 1, pageX: 0 });
        releaseMouse(document.body);
      }

      function hastyDragFlow() {
        clickMouse(getByText(dom, 'First item'));
        releaseMouse(document.body);
      }

      expect(hastyDragFlow).not.toHaveTriggeredSensorEvent('drag:start');

      expect(hastyDragFlow).not.toHaveTriggeredSensorEvent('drag:stop');

      expect(dragFlow).toHaveTriggeredSensorEvent('drag:start');

      expect(dragFlow).toHaveTriggeredSensorEvent('drag:stop');
    });

    it('triggers `drag:move` event while moving the mouse after distance has been met', () => {
      function dragFlow() {
        clickMouse(getByText(dom, 'First item'));
        moveMouse(getByText(dom, 'First item'), { pageY: 1, pageX: 0 });
        moveMouse(document.body);
        releaseMouse(document.body);
      }

      expect(dragFlow).toHaveTriggeredSensorEvent('drag:move');
    });
  });

  describe('using delay', () => {
    beforeEach(() => {
      setup({ delay: DRAG_DELAY });
    });

    afterEach(teardown);

    it('triggers `drag:start` sensor event after delay', () => {
      function dragFlow() {
        clickMouse(getByText(dom, 'First item'));
        waitForDragDelay();
        releaseMouse(document.body);
      }

      expect(dragFlow).toHaveTriggeredSensorEvent('drag:start');
    });

    it('does not trigger `drag:start` event releasing mouse before delay', () => {
      function dragFlow() {
        clickMouse(getByText(dom, 'First item'));
        waitForDragDelay();
        releaseMouse(document.body);
      }

      function hastyDragFlow() {
        clickMouse(getByText(dom, 'First item'));
        releaseMouse(document.body);
      }

      expect(hastyDragFlow).not.toHaveTriggeredSensorEvent('drag:start');

      expect(hastyDragFlow).not.toHaveTriggeredSensorEvent('drag:stop');

      expect(dragFlow).toHaveTriggeredSensorEvent('drag:start');

      expect(dragFlow).toHaveTriggeredSensorEvent('drag:stop');
    });

    it('triggers `drag:move` event while moving the mouse after delay', () => {
      function dragFlow() {
        clickMouse(getByText(dom, 'First item'));
        waitForDragDelay();
        moveMouse(document.body);
        releaseMouse(document.body);
      }

      expect(dragFlow).toHaveTriggeredSensorEvent('drag:move');
    });
  });

  describe('delay and distance', () => {
    beforeEach(() => {
      setup({ delay: DRAG_DELAY, distance: 1 });
    });

    afterEach(teardown);

    it('does not trigger `drag:start` before delay ends', () => {
      function dragFlow() {
        clickMouse(getByText(dom, 'First item'));
        moveMouse(getByText(dom, 'First item'), { pageY: 1, pageX: 0 });
        releaseMouse(document.body);
      }
      expect(dragFlow).not.toHaveTriggeredSensorEvent('drag:start');
    });

    it('does not trigger `drag:start` before distance is met', () => {
      function dragFlow() {
        clickMouse(getByText(dom, 'First item'));
        waitForDragDelay();
        releaseMouse(document.body);
      }
      expect(dragFlow).not.toHaveTriggeredSensorEvent('drag:start');
    });

    it('does not trigger `drag:start` sensor event when moved during delay', () => {
      function dragFlow() {
        clickMouse(getByText(dom, 'First item'));
        moveMouse(getByText(dom, 'First item'), { pageY: 1, pageX: 0 });
        const dateMock = waitForDragDelay({ restoreDateMock: false });
        moveMouse(getByText(dom, 'First item'), { pageY: 2, pageX: 0 });
        waitForDragDelay();
        releaseMouse(document.body);
        dateMock.mockRestore();
      }
      expect(dragFlow).not.toHaveTriggeredSensorEvent('drag:start', 1);
    });

    it('only triggers `drag:start` sensor event once when distance and delay are met at the same time', () => {
      function dragFlow() {
        clickMouse(getByText(dom, 'First item'));
        const next = Date.now() + DRAG_DELAY;
        const dateMock = vi.spyOn(Date, 'now').mockImplementation(() => {
          return next;
        });
        moveMouse(getByText(dom, 'First item'), { pageY: 1, pageX: 0 });
        vi.advanceTimersByTime(DRAG_DELAY);
        releaseMouse(document.body);
        dateMock.mockRestore();
      }
      expect(dragFlow).toHaveTriggeredSensorEvent('drag:start', 1);
    });

    it('only triggers `drag:start` sensor event once when distance is met after delay', () => {
      function dragFlow() {
        clickMouse(getByText(dom, 'First item'));
        const next = Date.now() + DRAG_DELAY + 1;
        const dateMock = vi.spyOn(Date, 'now').mockImplementation(() => {
          return next;
        });
        vi.advanceTimersByTime(DRAG_DELAY + 1);
        moveMouse(getByText(dom, 'First item'), { pageY: 1, pageX: 0 });
        releaseMouse(document.body);
        dateMock.mockRestore();
      }
      expect(dragFlow).toHaveTriggeredSensorEvent('drag:start', 1);
    });
  });
});
