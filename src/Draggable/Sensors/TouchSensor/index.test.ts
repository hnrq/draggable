import {
  createSandbox,
  triggerEvent,
  waitForDragDelay,
  DRAG_DELAY,
  touchStart,
  touchMove,
  touchRelease,
} from '../../../test-utils/helpers';

import TouchSensor from '.';
import { getByTestId, getByText } from '@testing-library/dom';

const sampleMarkup = `
  <ul data-testid="container">
    <li class="draggable">First item</li>
    <li class="draggable">Second item</li>
    <li class="non-draggable">Non draggable item</li>
  </ul>
`;

describe('TouchSensor', () => {
  let dom;
  let touchSensor;

  const setup = (optionsParam = {}) => {
    const options = {
      draggable: '.draggable',
      delay: 0,
      distance: 0,
      ...optionsParam,
    };

    dom = createSandbox(sampleMarkup);
    touchSensor = new TouchSensor(getByTestId(dom, 'container'), options);
    touchSensor.attach();
    vi.useFakeTimers();
  };

  const teardown = () => {
    touchSensor.detach();
    dom.remove();
    vi.useRealTimers();
  };

  describe('common', () => {
    beforeEach(setup);

    afterEach(teardown);

    it('cancels `drag:start` event when canceling sensor event', () => {
      dom.addEventListener('drag:start', (event) => {
        event.detail.preventDefault();
      });

      function dragFlow() {
        touchStart(getByText(dom, 'First item'));
        waitForDragDelay();
        touchRelease(getByText(dom, 'First item'));
      }

      expect(dragFlow).toHaveCanceledSensorEvent('drag:start');
    });

    it('prevents `drag:start` when trying to drag a none draggable element', () => {
      function dragFlow() {
        touchStart(document.body);
        waitForDragDelay();
        touchStart(getByText(dom, 'Non draggable item'));
        waitForDragDelay();
      }

      expect(dragFlow).not.toHaveTriggeredSensorEvent('drag:start');
    });

    it('prevents context menu while dragging', async () => {
      touchStart(getByText(dom, 'First item'));
      let contextMenuEvent = triggerEvent(
        getByText(dom, 'First item'),
        'contextmenu'
      );
      waitForDragDelay();

      await expect(contextMenuEvent.defaultPrevented).toBe(true);

      touchRelease(getByText(dom, 'First item'));
      contextMenuEvent = triggerEvent(
        getByText(dom, 'First item'),
        'contextmenu'
      );

      expect(contextMenuEvent.defaultPrevented).toBe(false);
    });

    it('prevents scroll on touchmove while dragging', () => {
      let touchMoveEvent = touchMove(getByText(dom, 'First item'));

      expect(touchMoveEvent.defaultPrevented).toBe(false);

      touchStart(getByText(dom, 'First item'));
      waitForDragDelay();
      touchMoveEvent = touchMove(getByText(dom, 'First item'));

      expect(touchMoveEvent.defaultPrevented).toBe(true);

      touchRelease(getByText(dom, 'First item'));
    });

    it('prevents clicking on touchend after dragging', () => {
      let touchEndEvent = touchRelease(getByText(dom, 'First item'));

      expect(touchEndEvent.defaultPrevented).toBe(false);

      touchStart(getByText(dom, 'First item'));
      waitForDragDelay();
      touchEndEvent = touchRelease(getByText(dom, 'First item'));

      expect(touchEndEvent.defaultPrevented).toBe(true);
    });
  });

  describe('using distance', () => {
    beforeEach(() => {
      setup({ distance: 1 });
    });

    afterEach(teardown);

    it('does not trigger `drag:start` before distance has been travelled', () => {
      function dragFlow() {
        touchStart(getByText(dom, 'First item'));
        touchRelease(getByText(dom, 'First item'));
      }

      expect(dragFlow).not.toHaveTriggeredSensorEvent('drag:start');
    });

    it('triggers `drag:start` sensor event after distance requirement has been met', () => {
      function dragFlow() {
        touchStart(getByText(dom, 'First item'));
        touchMove(getByText(dom, 'First item'), {
          touches: [{ pageX: 1, pageY: 0 }],
        });
      }

      expect(dragFlow).toHaveTriggeredSensorEvent('drag:start');
    });

    it('triggers `drag:move` event while moving the finger after delay', () => {
      function dragFlow() {
        touchStart(getByText(dom, 'First item'));
        touchMove(getByText(dom, 'First item'), {
          touches: [{ pageX: 1, pageY: 0 }],
        });
        touchMove(getByText(dom, 'First item'));
        touchRelease(getByText(dom, 'First item'));
      }

      expect(dragFlow).toHaveTriggeredSensorEvent('drag:move');
    });

    it('triggers `drag:stop` event when releasing the finger after dragging has started', () => {
      function dragFlow() {
        touchStart(getByText(dom, 'First item'));
        touchMove(getByText(dom, 'First item'), {
          touches: [{ pageX: 1, pageY: 0 }],
        });
        touchRelease(getByText(dom, 'First item'));
      }

      expect(dragFlow).toHaveTriggeredSensorEvent('drag:stop');
    });

    it('does not triggers `drag:stop` event when releasing the finger before dragging has started', () => {
      function dragFlow() {
        touchStart(getByText(dom, 'First item'));
        touchRelease(getByText(dom, 'First item'));
      }

      expect(dragFlow).not.toHaveTriggeredSensorEvent('drag:stop');
    });
  });

  describe('using delay', () => {
    beforeEach(() => {
      setup({ delay: DRAG_DELAY });
    });

    afterEach(teardown);

    it('does not trigger `drag:start` before delay ends', () => {
      function dragFlow() {
        touchStart(getByText(dom, 'First item'));
        touchRelease(getByText(dom, 'First item'));
      }

      expect(dragFlow).not.toHaveTriggeredSensorEvent('drag:start');
    });

    it('triggers `drag:start` sensor event on touchstart after delay', () => {
      function dragFlow() {
        touchStart(getByText(dom, 'First item'));
        waitForDragDelay();
      }

      expect(dragFlow).toHaveTriggeredSensorEvent('drag:start');
    });

    it('triggers `drag:move` event while moving the finger after delay', () => {
      function dragFlow() {
        touchStart(getByText(dom, 'First item'));
        waitForDragDelay();
        touchMove(getByText(dom, 'First item'));
        touchRelease(getByText(dom, 'First item'));
      }

      expect(dragFlow).toHaveTriggeredSensorEvent('drag:move');
    });

    it('triggers `drag:stop` event when releasing the finger after dragging has started', () => {
      function dragFlow() {
        touchStart(getByText(dom, 'First item'));
        waitForDragDelay();
        touchMove(getByText(dom, 'First item'));
        touchRelease(getByText(dom, 'First item'));
      }

      expect(dragFlow).toHaveTriggeredSensorEvent('drag:stop');
    });

    it('does not triggers `drag:stop` event when releasing the finger before dragging has started', () => {
      function dragFlow() {
        touchStart(getByText(dom, 'First item'));
        touchMove(getByText(dom, 'First item'));
        touchRelease(getByText(dom, 'First item'));
      }

      expect(dragFlow).not.toHaveTriggeredSensorEvent('drag:stop');
    });
  });

  describe('delay and distance', () => {
    beforeEach(() => {
      setup({ delay: DRAG_DELAY, distance: 1 });
    });

    afterEach(teardown);

    it('does not trigger `drag:start` before delay ends', () => {
      function dragFlow() {
        touchStart(getByText(dom, 'First item'));
        touchMove(getByText(dom, 'First item'), {
          touches: [{ pageX: 1, pageY: 0 }],
        });
        touchRelease(getByText(dom, 'First item'));
      }

      expect(dragFlow).not.toHaveTriggeredSensorEvent('drag:start');
    });

    it('does not trigger `drag:start` before distance requirement is met', () => {
      function dragFlow() {
        touchStart(getByText(dom, 'First item'));
        waitForDragDelay();
        touchRelease(getByText(dom, 'First item'));
      }

      expect(dragFlow).not.toHaveTriggeredSensorEvent('drag:start');
    });

    it('does not trigger `drag:start` sensor event when moved during delay', () => {
      function dragFlow() {
        touchStart(getByText(dom, 'First item'));
        touchMove(getByText(dom, 'First item'), {
          touches: [{ pageX: 1, pageY: 0 }],
        });
        const dateMock = waitForDragDelay({ restoreDateMock: false });
        touchMove(getByText(dom, 'First item'), {
          touches: [{ pageX: 2, pageY: 0 }],
        });
        touchRelease(getByText(dom, 'First item'));
        dateMock.mockRestore();
      }

      expect(dragFlow).not.toHaveTriggeredSensorEvent('drag:start');
    });

    it('only triggers `drag:start` sensor event once when delay ends at the same time distance is met', () => {
      function dragFlow() {
        touchStart(getByText(dom, 'First item'));
        const next = Date.now() + DRAG_DELAY;
        const dateMock = vi.spyOn(Date, 'now').mockImplementation(() => {
          return next;
        });
        touchMove(getByText(dom, 'First item'), {
          touches: [{ pageX: 1, pageY: 0 }],
        });
        vi.advanceTimersByTime(DRAG_DELAY);
        touchRelease(getByText(dom, 'First item'));
        dateMock.mockRestore();
      }

      expect(dragFlow).toHaveTriggeredSensorEvent('drag:start', 1);
    });

    it('only triggers `drag:start` sensor event once when distance is met after delay', () => {
      function dragFlow() {
        touchStart(getByText(dom, 'First item'));
        // do not use waitForDragDelay as it will reset the mock before touchMove
        const next = Date.now() + DRAG_DELAY + 1;
        const dateMock = vi.spyOn(Date, 'now').mockImplementation(() => {
          return next;
        });
        vi.advanceTimersByTime(DRAG_DELAY + 1);
        touchMove(getByText(dom, 'First item'), {
          touches: [{ pageX: 1, pageY: 1 }],
        });
        dateMock.mockRestore();
        touchRelease(getByText(dom, 'First item'));
      }

      expect(dragFlow).toHaveTriggeredSensorEvent('drag:start', 1);
    });
  });
});
