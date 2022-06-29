import { closest } from 'shared/utils';
import Sensor, { SensorOptions } from '../Sensor';
import {
  DragStartSensorEvent,
  DragMoveSensorEvent,
  DragStopSensorEvent,
} from '../SensorEvent';

const onMouseDown = Symbol('onMouseDown');
const onMouseUp = Symbol('onMouseUp');
const onDragStart = Symbol('onDragStart');
const onDragOver = Symbol('onDragOver');
const onDragEnd = Symbol('onDragEnd');
const onDrop = Symbol('onDrop');
const reset = Symbol('reset');

/**
 * This sensor picks up native browser drag events and dictates drag operations
 * @class DragSensor
 * @module DragSensor
 * @extends Sensor
 */
export default class DragSensor extends Sensor {
  /*** Mouse down timer which will end up setting the draggable attribute, unless canceled */
  mouseDownTimeout: ReturnType<typeof setTimeout> = null;
  /*** Draggable element needs to be remembered to unset the draggable attribute after drag operation has completed */
  draggableElement: HTMLElement = null;
  /*** Native draggable element could be links or images, their draggable state will be disabled during drag operation */
  nativeDraggableElement: HTMLElement = null;

  declare options: SensorOptions & {
    type: string;
  };

  /**
   * Attaches sensors event listeners to the DOM
   */
  attach() {
    document.addEventListener('mousedown', this[onMouseDown], true);
  }

  /**
   * Detaches sensors event listeners to the DOM
   */
  detach() {
    document.removeEventListener('mousedown', this[onMouseDown], true);
  }

  /**
   * Drag start handler
   * @param {Event} event - Drag start event
   */
  private [onDragStart] = (event) => {
    // Need for firefox. "text" key is needed for IE
    event.dataTransfer.setData('text', '');
    event.dataTransfer.effectAllowed = this.options.type;

    const target = document.elementFromPoint(event.clientX, event.clientY);
    const originalSource = this.draggableElement;

    if (!originalSource) {
      return;
    }

    const dragStartEvent = new DragStartSensorEvent({
      clientX: event.clientX,
      clientY: event.clientY,
      target,
      originalSource,
      container: this.currentContainer,
      originalEvent: event,
    });

    // Workaround
    setTimeout(() => {
      this.trigger(this.currentContainer, dragStartEvent);

      if (dragStartEvent.canceled()) {
        this.dragging = false;
      } else {
        this.dragging = true;
      }
    }, 0);
  };

  /**
   * Drag over handler
   * @param {Event} event - Drag over event
   */
  private [onDragOver] = (event) => {
    if (!this.dragging) return;

    const target = document.elementFromPoint(event.clientX, event.clientY);
    const container = this.currentContainer;

    const dragMoveEvent = new DragMoveSensorEvent({
      clientX: event.clientX,
      clientY: event.clientY,
      target,
      container,
      originalEvent: event,
    });

    this.trigger(container, dragMoveEvent);

    if (!dragMoveEvent.canceled()) {
      event.preventDefault();
      event.dataTransfer.dropEffect = this.options.type;
    }
  };

  /**
   * Drag end handler
   * @param {Event} event - Drag end event
   */
  private [onDragEnd] = (event) => {
    if (!this.dragging) return;

    document.removeEventListener('mouseup', this[onMouseUp], true);

    const target = document.elementFromPoint(event.clientX, event.clientY);
    const container = this.currentContainer;

    const dragStopEvent = new DragStopSensorEvent({
      clientX: event.clientX,
      clientY: event.clientY,
      target,
      container,
      originalEvent: event,
    });

    this.trigger(container, dragStopEvent);

    this.dragging = false;
    this.startEvent = null;

    this[reset]();
  };

  /**
   * Drop handler
   * @param {Event} event - Drop event
   */
  private [onDrop] = (event) => {
    event.preventDefault();
  };

  /**
   * Mouse down handler
   * @param {Event} event - Mouse down event
   */
  private [onMouseDown] = (event) => {
    // Firefox bug for inputs within draggables https://bugzilla.mozilla.org/show_bug.cgi?id=739071
    if (event.target && (event.target.form || event.target.contenteditable))
      return;

    const target = event.target;
    this.currentContainer = <HTMLElement>closest(target, this.containers);

    if (!this.currentContainer) return;
    if (this.options.handle && target && !closest(target, this.options.handle))
      return;

    const originalSource = closest(target, this.options.draggable);

    if (!originalSource) return;

    const nativeDraggableElement = closest(
      event.target,
      (element) => element.draggable
    );

    if (nativeDraggableElement) {
      nativeDraggableElement.draggable = false;
      this.nativeDraggableElement = nativeDraggableElement;
    }

    document.addEventListener('mouseup', this[onMouseUp], true);
    document.addEventListener('dragstart', this[onDragStart], false);
    document.addEventListener('dragover', this[onDragOver], false);
    document.addEventListener('dragend', this[onDragEnd], false);
    document.addEventListener('drop', this[onDrop], false);

    this.startEvent = event;

    this.mouseDownTimeout = setTimeout(() => {
      originalSource.draggable = true;
      this.draggableElement = originalSource;
    }, this.delay.drag);
  };

  /**
   * Mouse up handler
   * @private
   * @param {Event} event - Mouse up event
   */
  [onMouseUp] = () => {
    this[reset]();
  };

  /**
   * Mouse up handler
   * @param {Event} event - Mouse up event
   */
  [reset]() {
    clearTimeout(this.mouseDownTimeout);

    document.removeEventListener('mouseup', this[onMouseUp], true);
    document.removeEventListener('dragstart', this[onDragStart], false);
    document.removeEventListener('dragover', this[onDragOver], false);
    document.removeEventListener('dragend', this[onDragEnd], false);
    document.removeEventListener('drop', this[onDrop], false);

    if (this.nativeDraggableElement) {
      this.nativeDraggableElement.draggable = true;
      this.nativeDraggableElement = null;
    }

    if (this.draggableElement) {
      this.draggableElement.draggable = false;
      this.draggableElement = null;
    }
  }
}
