import { SwapAnimationOptions, SortAnimationOptions } from 'Plugins';
import AbstractPlugin from 'shared/AbstractPlugin';
import { closest } from 'shared/utils';

import {
  Announcement,
  Focusable,
  Mirror,
  MirrorOptions,
  Scrollable,
  ScrollableOptions,
} from './Plugins';

import Emitter from './Emitter';
import { MouseSensor, Sensor, TouchSensor } from './Sensors';
import {
  DraggableInitializedEvent,
  DraggableDestroyEvent,
} from './DraggableEvent';

import {
  DragStartEvent,
  DragMoveEvent,
  DragOutContainerEvent,
  DragOutEvent,
  DragOverContainerEvent,
  DragOverEvent,
  DragStopEvent,
  DragPressureEvent,
  DragStoppedEvent,
} from './DragEvent';
import { SensorOptions } from './Sensors/Sensor';
import AbstractEvent from 'shared/AbstractEvent';

const onDragStart = Symbol('onDragStart');
const onDragMove = Symbol('onDragMove');
const onDragStop = Symbol('onDragStop');
const onDragPressure = Symbol('onDragPressure');
const dragStop = Symbol('dragStop');

/**
 * @const {Object} defaultAnnouncements
 * @const {Function} defaultAnnouncements['drag:start']
 * @const {Function} defaultAnnouncements['drag:stop']
 */
const defaultAnnouncements = {
  'drag:start': (event) =>
    `Picked up ${
      event.source.textContent.trim() || event.source.id || 'draggable element'
    }`,
  'drag:stop': (event) =>
    `Released ${
      event.source.textContent.trim() || event.source.id || 'draggable element'
    }`,
};

const defaultClasses = {
  'container:dragging': 'draggable-container--is-dragging',
  'source:dragging': 'draggable-source--is-dragging',
  'source:placed': 'draggable-source--placed',
  'container:placed': 'draggable-container--placed',
  'body:dragging': 'draggable--is-dragging',
  'draggable:over': 'draggable--over',
  'container:over': 'draggable-container--over',
  'source:original': 'draggable--original',
  mirror: 'draggable-mirror',
};

export const defaultOptions = {
  draggable: '.draggable-source',
  handle: null,
  delay: {},
  distance: 0,
  placedTimeout: 800,
  plugins: [],
  sensors: [],
  exclude: {
    plugins: [],
    sensors: [],
  },
};

export interface DraggableOptions {
  draggable?: string;
  distance?: number;
  handle?:
    | string
    | HTMLElement[]
    | HTMLElement
    | ((currentElement: HTMLElement) => HTMLElement);
  delay?: number | DelayOptions;
  plugins?: typeof AbstractPlugin[];
  sensors?: typeof Sensor[];
  classes?: { [key in keyof typeof defaultClasses]?: string | string[] };
  announcements?: Record<string, (event: AbstractEvent) => unknown>;
  collidables?:
    | string
    | NodeList
    | HTMLElement[]
    | (() => NodeList | HTMLElement[]);
  mirror?: MirrorOptions;
  scrollable?: ScrollableOptions;
  swapAnimation?: SwapAnimationOptions;
  sortAnimation?: SortAnimationOptions;
  placedTimeout?: number;
  exclude?: {
    plugins?: typeof AbstractPlugin[];
    sensors?: typeof Sensor[];
  };
}

/**
 * This is the core draggable library that does the heavy lifting
 * @class Draggable
 * @module Draggable
 */
export default class Draggable {
  containers: HTMLElement[];
  options: DraggableOptions;
  /*** Draggables event emitter */
  emitter: Emitter = new Emitter();
  /*** Current drag state */
  dragging: boolean = false;
  /*** Active plugins */
  plugins: AbstractPlugin[] = [];
  /*** Active sensors */
  sensors: Sensor[] = [];
  /*** Mirror */
  mirror: HTMLElement;
  /*** Original HTML Element */
  originalSource: HTMLElement;
  /*** Source container ref */
  sourceContainer: HTMLElement;
  /*** Source container ref */
  source: HTMLElement;
  /*** Last placed element ref */
  lastPlacedSource: HTMLElement;
  /*** Last placed element container ref */
  lastPlacedContainer: HTMLElement;
  /** Current over element container ref */
  currentOverContainer: HTMLElement;
  /** Current over element ref */
  currentOver: HTMLElement;
  /*** Placement timeout ID */
  placedTimeoutID: ReturnType<typeof setTimeout>;

  constructor(containers = [document.body], options: DraggableOptions = {}) {
    if (containers instanceof NodeList || containers instanceof Array)
      this.containers = [...containers];
    else if ((containers as any) instanceof HTMLElement)
      this.containers = [containers];
    else
      throw new Error(
        'Draggable containers are expected to be of type `NodeList`, `HTMLElement[]` or `HTMLElement`'
      );

    this.options = {
      ...defaultOptions,
      ...options,
      classes: {
        ...defaultClasses,
        ...(options.classes ?? {}),
      },
      announcements: {
        ...defaultAnnouncements,
        ...(options.announcements ?? {}),
      },
      exclude: {
        plugins: options.exclude?.plugins ?? [],
        sensors: options.exclude?.sensors ?? [],
      },
    };

    this[onDragStop] = this[onDragStop].bind(this);
    this[onDragPressure] = this[onDragPressure].bind(this);
    this[dragStop] = this[dragStop].bind(this);

    document.addEventListener('drag:start', this[onDragStart], true);
    document.addEventListener('drag:move', this[onDragMove], true);
    document.addEventListener('drag:stop', this[onDragStop], true);
    document.addEventListener('drag:pressure', this[onDragPressure], true);

    const defaultPlugins = Object.values(Draggable.Plugins).filter(
      (plugin) => !this.options.exclude.plugins.includes(plugin)
    );
    const defaultSensors = Object.values(Draggable.Sensors).filter(
      (sensor) => !this.options.exclude.sensors.includes(sensor)
    );

    this.addPlugin(...[...defaultPlugins, ...this.options.plugins]);
    this.addSensor(...[...defaultSensors, ...this.options.sensors]);

    const draggableInitializedEvent = new DraggableInitializedEvent({
      draggable: this,
    });

    this.on('mirror:created', ({ mirror }) => (this.mirror = mirror));
    this.on('mirror:destroy', () => (this.mirror = null));

    this.trigger(draggableInitializedEvent);
  }

  /**
   * Destroys Draggable instance. This removes all internal event listeners and
   * deactivates sensors and plugins
   */
  destroy() {
    document.removeEventListener('drag:start', this[onDragStart], true);
    document.removeEventListener('drag:move', this[onDragMove], true);
    document.removeEventListener('drag:stop', this[onDragStop], true);
    document.removeEventListener('drag:pressure', this[onDragPressure], true);

    const draggableDestroyEvent = new DraggableDestroyEvent({
      draggable: this,
    });

    this.trigger(draggableDestroyEvent);

    this.removePlugin(...this.plugins.map((plugin) => plugin.constructor));
    this.removeSensor(...this.sensors.map((sensor) => sensor.constructor));
  }

  /**
   * Adds plugin to this draggable instance. This will end up calling the attach method of the plugin
   */
  addPlugin(...plugins: typeof AbstractPlugin[]) {
    const activePlugins = plugins.map((plugin) => new plugin(this));

    activePlugins.forEach((plugin) => plugin.attach());
    this.plugins = [...this.plugins, ...activePlugins];

    return this;
  }

  /**
   * Removes plugins that are already attached to this draggable instance. This will end up calling
   * the detach method of the plugin
   */
  removePlugin(...plugins: typeof AbstractPlugin['constructor'][]) {
    const removedPlugins = this.plugins.filter((plugin) =>
      plugins.includes(plugin.constructor)
    );

    removedPlugins.forEach((plugin) => plugin.detach());
    this.plugins = this.plugins.filter(
      (plugin) => !plugins.includes(plugin.constructor)
    );

    return this;
  }

  /**
   * Adds sensors to this draggable instance. This will end up calling the attach method of the sensor
   */
  addSensor(...sensors: typeof Sensor[]) {
    const activeSensors = sensors.map(
      (sensor) => new sensor(this.containers, this.options as SensorOptions)
    );

    activeSensors.forEach((sensor) => sensor.attach());
    this.sensors = [...this.sensors, ...activeSensors];

    return this;
  }

  /**
   * Removes sensors that are already attached to this draggable instance. This will end up calling
   * the detach method of the sensor
   */
  removeSensor(...sensors: typeof Sensor['constructor'][]) {
    const removedSensors = this.sensors.filter((sensor) =>
      sensors.includes(sensor.constructor)
    );

    removedSensors.forEach((sensor) => sensor.detach());
    this.sensors = this.sensors.filter(
      (sensor) => !sensors.includes(sensor.constructor)
    );

    return this;
  }

  /**
   * Adds container to this draggable instance
   */
  addContainer(...containers: HTMLElement[]) {
    this.containers = [...this.containers, ...containers];
    this.sensors.forEach((sensor) => sensor.addContainer(...containers));
    return this;
  }

  /**
   * Removes container from this draggable instance
   */
  removeContainer(...containers) {
    this.containers = this.containers.filter(
      (container) => !containers.includes(container)
    );
    this.sensors.forEach((sensor) => sensor.removeContainer(...containers));
    return this;
  }

  /**
   * Adds listener for draggable events
   */
  on(type, ...callbacks) {
    this.emitter.on(type, ...callbacks);
    return this;
  }

  /**
   * Removes listener from draggable
   */
  off(type, callback) {
    this.emitter.off(type, callback);
    return this;
  }

  /**
   * Triggers draggable event
   */
  trigger(event) {
    this.emitter.trigger(event);
    return this;
  }

  /**
   * Returns class name for class identifier
   */
  getClassNameFor = (name: string) => this.getClassNamesFor(name)[0];

  /**
   * Returns class names for class identifier
   */
  getClassNamesFor = (name: string): string[] => {
    const classNames = this.options.classes[name];

    if (classNames instanceof Array) return classNames;
    else if (typeof classNames === 'string') return [<string>classNames];
    else return [];
  };

  isDragging = () => Boolean(this.dragging);

  /**
   * Returns all draggable elements
   */
  getDraggableElements = (): HTMLElement[] =>
    this.containers.reduce(
      (current, container) => [
        ...current,
        ...this.getDraggableElementsForContainer(container),
      ],
      []
    );

  /**
   * Returns draggable elements for a given container, excluding the mirror and
   */
  getDraggableElementsForContainer = (container: HTMLElement) => {
    const allDraggableElements = container.querySelectorAll(
      this.options.draggable
    );

    return [...allDraggableElements].filter((childElement) => {
      return (
        childElement !== this.originalSource && childElement !== this.mirror
      );
    });
  };

  /**
   * Cancel dragging immediately
   */
  cancel() {
    this[dragStop]();
  }

  private [onDragStart] = (event: Event) => {
    const sensorEvent = getSensorEvent(event);
    const { target, container, originalSource } = sensorEvent;

    if (!this.containers.includes(container)) return;

    if (
      this.options.handle &&
      target &&
      !closest(target, this.options.handle)
    ) {
      sensorEvent.cancel();
      return;
    }

    this.originalSource = originalSource;
    this.sourceContainer = container;

    if (this.lastPlacedSource && this.lastPlacedContainer) {
      clearTimeout(this.placedTimeoutID);
      this.lastPlacedSource.classList.remove(
        ...this.getClassNamesFor('source:placed')
      );
      this.lastPlacedContainer.classList.remove(
        ...this.getClassNamesFor('container:placed')
      );
    }

    this.source = <HTMLElement>this.originalSource.cloneNode(true);
    this.originalSource.parentNode.insertBefore(
      this.source,
      this.originalSource
    );
    this.originalSource.style.display = 'none';

    const dragStartEvent = new DragStartEvent({
      source: this.source,
      originalSource: this.originalSource,
      sourceContainer: container,
      sensorEvent,
    });

    this.trigger(dragStartEvent);

    this.dragging = !dragStartEvent.canceled();

    if (dragStartEvent.canceled()) {
      this.source.remove();
      this.originalSource.style.display = null;
      return;
    }

    this.originalSource.classList.add(
      ...this.getClassNamesFor('source:original')
    );
    this.source.classList.add(...this.getClassNamesFor('source:dragging'));
    this.sourceContainer.classList.add(
      ...this.getClassNamesFor('container:dragging')
    );
    document.body.classList.add(...this.getClassNamesFor('body:dragging'));
    applyUserSelect(document.body, 'none');

    requestAnimationFrame(() => {
      const oldSensorEvent = getSensorEvent(event);
      const newSensorEvent = oldSensorEvent.clone({ target: this.source });

      this[onDragMove]({
        ...event,
        detail: newSensorEvent,
      });
    });
  };

  private [onDragMove] = (event: Event) => {
    if (!this.dragging) return;

    const sensorEvent = getSensorEvent(event);
    const { container } = sensorEvent;
    let target = sensorEvent.target;

    const dragMoveEvent = new DragMoveEvent({
      source: this.source,
      originalSource: this.originalSource,
      sourceContainer: container,
      sensorEvent,
    });

    this.trigger(dragMoveEvent);

    if (dragMoveEvent.canceled()) sensorEvent.cancel();

    target = closest(target, this.options.draggable);
    const withinCorrectContainer = closest(sensorEvent.target, this.containers);
    const overContainer = sensorEvent.overContainer || withinCorrectContainer;
    const isLeavingContainer =
      this.currentOverContainer && overContainer !== this.currentOverContainer;
    const isLeavingDraggable = this.currentOver && target !== this.currentOver;
    const isOverContainer =
      overContainer && this.currentOverContainer !== overContainer;
    const isOverDraggable =
      withinCorrectContainer && target && this.currentOver !== target;

    if (isLeavingDraggable) {
      const dragOutEvent = new DragOutEvent({
        source: this.source,
        originalSource: this.originalSource,
        sourceContainer: container,
        sensorEvent,
        over: this.currentOver,
        overContainer: this.currentOverContainer,
      });

      this.currentOver.classList.remove(
        ...this.getClassNamesFor('draggable:over')
      );
      this.currentOver = null;

      this.trigger(dragOutEvent);
    }

    if (isLeavingContainer) {
      const dragOutContainerEvent = new DragOutContainerEvent({
        source: this.source,
        originalSource: this.originalSource,
        sourceContainer: container,
        sensorEvent,
        overContainer: this.currentOverContainer,
      });

      this.currentOverContainer.classList.remove(
        ...this.getClassNamesFor('container:over')
      );
      this.currentOverContainer = null;

      this.trigger(dragOutContainerEvent);
    }

    if (isOverContainer) {
      overContainer.classList.add(...this.getClassNamesFor('container:over'));

      const dragOverContainerEvent = new DragOverContainerEvent({
        source: this.source,
        originalSource: this.originalSource,
        sourceContainer: container,
        sensorEvent,
        overContainer,
      });

      this.currentOverContainer = overContainer;

      this.trigger(dragOverContainerEvent);
    }

    if (isOverDraggable) {
      target.classList.add(...this.getClassNamesFor('draggable:over'));

      const dragOverEvent = new DragOverEvent({
        source: this.source,
        originalSource: this.originalSource,
        sourceContainer: container,
        sensorEvent,
        overContainer,
        over: target,
      });

      this.currentOver = target;

      this.trigger(dragOverEvent);
    }
  };

  private [dragStop] = (event?: DragStopEvent) => {
    if (!this.dragging) return;

    this.dragging = false;

    const dragStopEvent = new DragStopEvent({
      source: this.source,
      originalSource: this.originalSource,
      sensorEvent: event ? event.sensorEvent : null,
      sourceContainer: this.sourceContainer,
    });

    this.trigger(dragStopEvent);

    if (!dragStopEvent.canceled())
      this.source.parentNode.insertBefore(this.originalSource, this.source);

    this.source.remove();
    this.originalSource.style.display = '';

    this.source.classList.remove(...this.getClassNamesFor('source:dragging'));
    this.originalSource.classList.remove(
      ...this.getClassNamesFor('source:original')
    );
    this.originalSource.classList.add(
      ...this.getClassNamesFor('source:placed')
    );
    this.sourceContainer.classList.add(
      ...this.getClassNamesFor('container:placed')
    );
    this.sourceContainer.classList.remove(
      ...this.getClassNamesFor('container:dragging')
    );
    document.body.classList.remove(...this.getClassNamesFor('body:dragging'));
    applyUserSelect(document.body, '');

    if (this.currentOver) {
      this.currentOver.classList.remove(
        ...this.getClassNamesFor('draggable:over')
      );
    }

    if (this.currentOverContainer) {
      this.currentOverContainer.classList.remove(
        ...this.getClassNamesFor('container:over')
      );
    }

    this.lastPlacedSource = this.originalSource;
    this.lastPlacedContainer = this.sourceContainer;

    this.placedTimeoutID = setTimeout(() => {
      if (this.lastPlacedSource) {
        this.lastPlacedSource.classList.remove(
          ...this.getClassNamesFor('source:placed')
        );
      }

      if (this.lastPlacedContainer) {
        this.lastPlacedContainer.classList.remove(
          ...this.getClassNamesFor('container:placed')
        );
      }

      this.lastPlacedSource = null;
      this.lastPlacedContainer = null;
    }, this.options.placedTimeout);

    const dragStoppedEvent = new DragStoppedEvent({
      source: this.source,
      originalSource: this.originalSource,
      sensorEvent: event ? event.sensorEvent : null,
      sourceContainer: this.sourceContainer,
    });

    this.trigger(dragStoppedEvent);

    this.source = null;
    this.originalSource = null;
    this.currentOverContainer = null;
    this.currentOver = null;
    this.sourceContainer = null;
  };

  private [onDragStop] = (event) => {
    this[dragStop](event);
  };

  private [onDragPressure] = (event: Event) => {
    if (!this.dragging) return;

    const sensorEvent = getSensorEvent(event);
    const source =
      this.source ||
      closest(sensorEvent.originalEvent.target, this.options.draggable);

    const dragPressureEvent = new DragPressureEvent({
      sensorEvent,
      source,
      pressure: sensorEvent.pressure,
    });

    this.trigger(dragPressureEvent);
  };

  /** Default plugins draggable uses */
  static Plugins: Record<string, typeof AbstractPlugin> = {
    Announcement,
    Focusable,
    Mirror,
    Scrollable,
  };

  /** Default sensors draggable uses */
  static Sensors: Record<string, typeof Sensor> = { MouseSensor, TouchSensor };
}

function getSensorEvent(event) {
  return event.detail;
}

function applyUserSelect(element, value) {
  element.style.webkitUserSelect = value;
  element.style.mozUserSelect = value;
  element.style.msUserSelect = value;
  element.style.oUserSelect = value;
  element.style.userSelect = value;
}