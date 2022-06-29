import {
  closest,
  distance as euclideanDistance,
  touchCoords,
} from 'shared/utils';
import Sensor from '../Sensor';
import {
  DragStartSensorEvent,
  DragMoveSensorEvent,
  DragStopSensorEvent,
} from '../SensorEvent';

const onTouchStart = Symbol('onTouchStart');
const onTouchEnd = Symbol('onTouchEnd');
const onTouchMove = Symbol('onTouchMove');
const startDrag = Symbol('startDrag');
const onDistanceChange = Symbol('onDistanceChange');

/**
 * Prevents scrolling when set to true
 * @var {Boolean} preventScrolling
 */
let preventScrolling = false;

// WebKit requires cancelable `touchmove` events to be added as early as possible
window.addEventListener(
  'touchmove',
  (event) => {
    if (!preventScrolling) {
      return;
    }

    // Prevent scrolling
    event.preventDefault();
  },
  { passive: false }
);

/**
 * This sensor picks up native browser touch events and dictates drag operations
 * @class TouchSensor
 * @module TouchSensor
 * @extends Sensor
 */
export default class TouchSensor extends Sensor {
  /*** Closest scrollable container so accidental scroll can cancel long touch */
  currentScrollableParent: HTMLElement = null;
  /*** TimeoutID for managing delay */
  tapTimeout: number = null;
  /*** touchMoved indicates if touch has moved during tapTimeout */
  touchMoved: boolean = false;
  /** Moment when touch event is triggered */
  onTouchStartAt: number = null;
  /*** Save pageX coordinates for delay drag */
  private pageX: number = null;
  /*** Save pageY coordinates for delay drag */
  private pageY: number = null;

  attach() {
    document.addEventListener('touchstart', this[onTouchStart]);
  }

  /**
   * Detaches sensors event listeners to the DOM
   */
  detach() {
    document.removeEventListener('touchstart', this[onTouchStart]);
  }

  /*** Touch start handler */
  private [onTouchStart] = (event) => {
    const container = closest(event.target, this.containers);

    if (!container) return;
    if (
      this.options.handle &&
      event.target &&
      !closest(event.target, this.options.handle)
    )
      return;

    const originalSource = closest(event.target, this.options.draggable);

    if (!originalSource) return;

    const { distance = 0 } = this.options;
    const { delay } = this;
    const { pageX, pageY } = touchCoords(event);

    Object.assign(this, { pageX, pageY });
    this.onTouchStartAt = Date.now();
    this.startEvent = event;
    this.currentContainer = container;
    this.originalSource = originalSource;

    document.addEventListener('touchend', this[onTouchEnd]);
    document.addEventListener('touchcancel', this[onTouchEnd]);
    document.addEventListener('touchmove', this[onDistanceChange]);
    container.addEventListener('contextmenu', onContextMenu);

    if (distance) {
      preventScrolling = true;
    }

    this.tapTimeout = window.setTimeout(() => {
      this[onDistanceChange]({
        touches: [{ pageX: this.pageX, pageY: this.pageY }],
      });
    }, delay.touch);
  };

  /*** Start the drag */
  private [startDrag] = () => {
    const startEvent = this.startEvent;
    const container = this.currentContainer;
    const touch = touchCoords(<TouchEvent>startEvent);
    const originalSource = this.originalSource;

    const dragStartEvent = new DragStartSensorEvent({
      clientX: touch.pageX,
      clientY: touch.pageY,
      target: startEvent.target,
      container,
      originalSource,
      originalEvent: startEvent,
    });

    this.trigger(this.currentContainer, dragStartEvent);

    this.dragging = !dragStartEvent.canceled();

    if (this.dragging) {
      document.addEventListener('touchmove', this[onTouchMove]);
    }
    preventScrolling = this.dragging;
  };

  /*** Touch move handler prior to drag start. */
  private [onDistanceChange] = (event: TouchEvent) => {
    const { distance } = this.options;
    const { startEvent, delay } = this;
    const start = touchCoords(<TouchEvent>startEvent);
    const current = touchCoords(event);
    const timeElapsed = Date.now() - this.onTouchStartAt;
    const distanceTravelled = euclideanDistance(
      start.pageX,
      start.pageY,
      current.pageX,
      current.pageY
    );

    Object.assign(this, current);

    clearTimeout(this.tapTimeout);

    if (timeElapsed < delay.touch) {
      // moved during delay
      document.removeEventListener('touchmove', this[onDistanceChange]);
    } else if (distanceTravelled >= distance) {
      document.removeEventListener('touchmove', this[onDistanceChange]);
      this[startDrag]();
    }
  };

  /*** Mouse move handler while dragging */
  private [onTouchMove] = (event: TouchEvent) => {
    if (!this.dragging) return;
    const { pageX, pageY } = touchCoords(event);
    const target = document.elementFromPoint(
      pageX - window.scrollX,
      pageY - window.scrollY
    );

    const dragMoveEvent = new DragMoveSensorEvent({
      clientX: pageX,
      clientY: pageY,
      target,
      container: this.currentContainer,
      originalEvent: event,
    });

    this.trigger(this.currentContainer, dragMoveEvent);
  };

  /*** Touch end handler */
  private [onTouchEnd](event: TouchEvent) {
    clearTimeout(this.tapTimeout);
    preventScrolling = false;

    document.removeEventListener('touchend', this[onTouchEnd]);
    document.removeEventListener('touchcancel', this[onTouchEnd]);
    document.removeEventListener('touchmove', this[onDistanceChange]);

    if (this.currentContainer)
      this.currentContainer.removeEventListener('contextmenu', onContextMenu);

    if (!this.dragging) return;

    document.removeEventListener('touchmove', this[onTouchMove]);

    const { pageX, pageY } = touchCoords(event);
    const target = document.elementFromPoint(
      pageX - window.scrollX,
      pageY - window.scrollY
    );

    event.preventDefault();

    const dragStopEvent = new DragStopSensorEvent({
      clientX: pageX,
      clientY: pageY,
      target,
      container: this.currentContainer,
      originalEvent: event,
    });

    this.trigger(this.currentContainer, dragStopEvent);

    this.currentContainer = null;
    this.dragging = false;
    this.startEvent = null;
  }
}

function onContextMenu(event) {
  event.preventDefault();
  event.stopPropagation();
}
