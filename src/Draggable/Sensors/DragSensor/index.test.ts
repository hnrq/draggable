import {
  createSandbox,
  dragStart,
  dragOver,
  dragStop,
  clickMouse,
  releaseMouse,
  DRAG_DELAY,
  waitForDragDelay,
} from '../../../test-utils/helpers';

import DragSensor from '.';
import { getByTestId, getByText } from '@testing-library/dom';

const sampleMarkup = `
  <ul data-testid="draggable-container">
    <li class="draggable">First item</li>
    <li class="draggable">Second item</li>
    <li class="non-draggable">Non draggable item</li>
  </ul>
`;

describe('DragSensor', () => {
  let dom;
  let dragSensor;

  const setup = (optionsParam = {}) => {
    const options = {
      draggable: '.draggable',
      delay: 0,
      distance: 0,
      ...optionsParam,
    };

    dom = createSandbox(sampleMarkup);
    dragSensor = new DragSensor(
      getByTestId(dom, 'draggable-container'),
      options
    );
    dragSensor.attach();
    vi.useFakeTimers();
  };

  const teardown = () => {
    dragSensor.detach();
    vi.useRealTimers();
  };

  describe('common', () => {
    beforeEach(setup);
    afterEach(teardown);

    it('adds draggable attribute on mouse down', () => {
      expect(getByText(dom, 'First item').draggable).toBe(false);

      clickMouse(getByText(dom, 'First item'));
      waitForDragDelay();

      expect(getByText(dom, 'First item').draggable).toBe(true);

      releaseMouse(getByText(dom, 'First item'));
      expect(getByText(dom, 'First item').draggable).toBe(false);
    });

    it('triggers `drag:start` sensor event on dragstart', () => {
      function dragFlow() {
        clickMouse(getByText(dom, 'First item'));
        waitForDragDelay();
        dragStart(getByText(dom, 'First item'));
        waitForDragDelay();
        dragStop(getByText(dom, 'First item'));
        releaseMouse(document.body);
      }

      expect(dragFlow).toHaveTriggeredSensorEvent('drag:start');
    });

    it('cancels `drag:start` event when canceling sensor event', () => {
      dom.addEventListener('drag:start', (event) => {
        event.detail.preventDefault();
      });

      function dragFlow() {
        clickMouse(getByText(dom, 'First item'));
        waitForDragDelay();
        dragStart(getByText(dom, 'First item'));
        waitForDragDelay();
        dragStop(getByText(dom, 'First item'));
        releaseMouse(document.body);
      }

      expect(dragFlow).toHaveCanceledSensorEvent('drag:start');
    });

    it('does not trigger `drag:start` event releasing mouse before timeout', () => {
      function dragFlow() {
        clickMouse(getByText(dom, 'First item'));
        waitForDragDelay();
        dragStart(getByText(dom, 'First item'));
        waitForDragDelay();
        dragStop(getByText(dom, 'First item'));
        releaseMouse(document.body);
      }

      function hastyDragFlow() {
        clickMouse(getByText(dom, 'First item'));
        dragStart(getByText(dom, 'First item'));
        releaseMouse(document.body);
      }

      expect(hastyDragFlow).not.toHaveTriggeredSensorEvent('drag:start');

      expect(hastyDragFlow).not.toHaveTriggeredSensorEvent('drag:stop');

      expect(dragFlow).toHaveTriggeredSensorEvent('drag:start');

      expect(dragFlow).toHaveTriggeredSensorEvent('drag:stop');
    });

    it('triggers `drag:move` event while moving the mouse', () => {
      function dragFlow() {
        clickMouse(getByText(dom, 'First item'));
        waitForDragDelay();
        dragStart(getByText(dom, 'First item'));
        waitForDragDelay();
        dragOver(document.body);
        dragStop(getByText(dom, 'First item'));
        releaseMouse(document.body);
      }

      expect(dragFlow).toHaveTriggeredSensorEvent('drag:move');
    });

    it('triggers `drag:stop` event when releasing mouse', () => {
      function dragFlow() {
        clickMouse(getByText(dom, 'First item'));
        waitForDragDelay();
        dragStart(getByText(dom, 'First item'));
        waitForDragDelay();
        dragOver(document.body);
        dragStop(getByText(dom, 'First item'));
        releaseMouse(document.body);
      }

      expect(dragFlow).toHaveTriggeredSensorEvent('drag:stop');
    });

    it('does not trigger `drag:start` event when clicking on none draggable element', () => {
      function dragFlow() {
        clickMouse(document.body);
        waitForDragDelay();
        dragStart(document.body);
        waitForDragDelay();
        dragStop(getByText(dom, 'First item'));
        releaseMouse(document.body);

        clickMouse(getByText(dom, 'Non draggable item'));
        waitForDragDelay();
        dragStart(getByText(dom, 'Non draggable item'));
        waitForDragDelay();
        dragStop(getByText(dom, 'First item'));
        releaseMouse(document.body);
      }

      expect(dragFlow).not.toHaveTriggeredSensorEvent('drag:start');
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
        dragStart(getByText(dom, 'First item'));
        waitForDragDelay();
        dragStop(getByText(dom, 'First item'));
        releaseMouse(document.body);
      }

      expect(dragFlow).toHaveTriggeredSensorEvent('drag:start');
    });

    it('does not trigger `drag:start` event releasing mouse before delay', () => {
      function dragFlow() {
        clickMouse(getByText(dom, 'First item'));
        waitForDragDelay();
        dragStart(getByText(dom, 'First item'));
        waitForDragDelay();
        dragStop(getByText(dom, 'First item'));
        releaseMouse(document.body);
      }

      function hastyDragFlow() {
        clickMouse(getByText(dom, 'First item'));
        dragStart(getByText(dom, 'First item'));
        dragStop(getByText(dom, 'First item'));
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
        dragStart(getByText(dom, 'First item'));
        waitForDragDelay();
        dragOver(document.body);
        dragStop(getByText(dom, 'First item'));
        releaseMouse(document.body);
      }

      expect(dragFlow).toHaveTriggeredSensorEvent('drag:move');
    });
  });
});
