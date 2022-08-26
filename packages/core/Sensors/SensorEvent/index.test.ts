import {
  SensorEvent,
  DragStartSensorEvent,
  DragMoveSensorEvent,
  DragStopSensorEvent,
  DragPressureSensorEvent,
} from '.';

describe('SensorEvent', () => {
  describe('#constructor', () => {
    it('initializes with type `sensor`', () => {
      const event = new SensorEvent();
      expect(event.type).toBe('sensor');
    });

    it('initializes with originalEvent', () => {
      const originalEvent = new Event('event');

      const event = new SensorEvent({
        detail: {
          clientX: 200,
          clientY: 200,
          pressure: 200,
          originalEvent,
          target: document.createElement('div'),
          container: document.createElement('div'),
          originalSource: document.createElement('div'),
        },
      });

      expect(event.originalEvent).toBe(originalEvent);
    });
    it('initializes with clientX', () => {
      const clientX = 400;
      const event = new SensorEvent({
        detail: {
          clientX,
          clientY: 200,
          pressure: 200,
          originalEvent: new Event('event'),
          target: document.createElement('div'),
          container: document.createElement('div'),
          originalSource: document.createElement('div'),
        },
      });

      expect(event.clientX).toBe(clientX);
    });
    it('initializes with clientY', () => {
      const clientY = 400;
      const event = new SensorEvent({
        detail: {
          clientY,
          clientX: 200,
          pressure: 200,
          originalEvent: new Event('event'),
          target: document.createElement('div'),
          container: document.createElement('div'),
          originalSource: document.createElement('div'),
        },
      });

      expect(event.clientY).toBe(clientY);
    });

    it('initializes with target', () => {
      const target = document.createElement('h1');

      const event = new SensorEvent({
        detail: {
          target,
          clientX: 200,
          clientY: 200,
          pressure: 200,
          originalEvent: new Event('event'),
          container: document.createElement('div'),
          originalSource: document.createElement('div'),
        },
      });

      expect(event.target).toBe(target);
    });
    it('initializes with container', () => {
      const container = document.createElement('h1');

      const event = new SensorEvent({
        detail: {
          container,
          clientX: 200,
          clientY: 200,
          pressure: 200,
          originalEvent: new Event('event'),
          target: document.createElement('div'),
          originalSource: document.createElement('div'),
        },
      });

      expect(event.container).toBe(container);
    });
  });

  it('creates a clone of SensorEvent', () => {
    const clientX = 300;
    const clientY = 400;
    const event = new SensorEvent();
    const clone = event.clone({ clientX, clientY });

    expect(clone.clientX).toBe(clientX);
    expect(clone.clientY).toBe(clientY);
  });
});

describe('DragStartSensorEvent', () => {
  describe('#constructor', () => {
    it('initializes with type `drag:start`', () => {
      const event = new DragStartSensorEvent({
        clientX: 200,
        clientY: 200,
        pressure: 200,
        originalEvent: new Event('event'),
        target: document.createElement('div'),
        container: document.createElement('div'),
        originalSource: document.createElement('div'),
      });
      expect(event.type).toBe('drag:start');
    });
  });

  it('creates a clone of DragStartSensorEvent', () => {
    const clientX = 300;
    const clientY = 400;
    const event = new DragStartSensorEvent({
      clientX: 200,
      clientY: 200,
      pressure: 200,
      originalEvent: new Event('event'),
      target: document.createElement('div'),
      container: document.createElement('div'),
      originalSource: document.createElement('div'),
    });
    const clone = event.clone({ clientX, clientY });

    expect(clone.clientX).toBe(clientX);
    expect(clone.clientY).toBe(clientY);
  });
});

describe('DragMoveSensorEvent', () => {
  describe('#constructor', () => {
    it('initializes with type `drag:move`', () => {
      const event = new DragMoveSensorEvent({
        clientX: 200,
        clientY: 200,
        pressure: 200,
        originalEvent: new Event('event'),
        target: document.createElement('div'),
        container: document.createElement('div'),
        originalSource: document.createElement('div'),
      });
      expect(event.type).toBe('drag:move');
    });
  });

  it('creates a clone of DragMoveSensorEvent', () => {
    const clientX = 300;
    const clientY = 400;
    const event = new DragMoveSensorEvent({
      clientX: 200,
      clientY: 200,
      pressure: 200,
      originalEvent: new Event('event'),
      target: document.createElement('div'),
      container: document.createElement('div'),
      originalSource: document.createElement('div'),
    });
    const clone = event.clone({ clientX, clientY });

    expect(clone.clientX).toBe(clientX);
    expect(clone.clientY).toBe(clientY);
  });
});

describe('DragStopSensorEvent', () => {
  describe('#constructor', () => {
    it('initializes with type `drag:stop`', () => {
      const event = new DragStopSensorEvent({
        clientX: 200,
        clientY: 200,
        pressure: 200,
        originalEvent: new Event('event'),
        target: document.createElement('div'),
        container: document.createElement('div'),
        originalSource: document.createElement('div'),
      });
      expect(event.type).toBe('drag:stop');
    });
  });

  it('creates a clone of DragStopSensorEvent', () => {
    const clientX = 300;
    const clientY = 400;
    const event = new DragStopSensorEvent({
      clientX: 200,
      clientY: 200,
      pressure: 200,
      originalEvent: new Event('event'),
      target: document.createElement('div'),
      container: document.createElement('div'),
      originalSource: document.createElement('div'),
    });
    const clone = event.clone({ clientX, clientY });

    expect(clone.clientX).toBe(clientX);
    expect(clone.clientY).toBe(clientY);
  });
});

describe('DragPressureSensorEvent', () => {
  describe('#constructor', () => {
    it('initializes with type `drag:pressure`', () => {
      const event = new DragPressureSensorEvent({
        clientX: 200,
        clientY: 200,
        pressure: 200,
        originalEvent: new Event('event'),
        target: document.createElement('div'),
        container: document.createElement('div'),
        originalSource: document.createElement('div'),
      });
      expect(event.type).toBe('drag:pressure');
    });
  });

  it('creates a clone of DragPressureSensorEvent', () => {
    const clientX = 300;
    const clientY = 400;
    const event = new DragPressureSensorEvent({
      clientX: 200,
      clientY: 200,
      pressure: 200,
      originalEvent: new Event('event'),
      target: document.createElement('div'),
      container: document.createElement('div'),
      originalSource: document.createElement('div'),
    });
    const clone = event.clone({ clientX, clientY });

    expect(clone.clientX).toBe(clientX);
    expect(clone.clientY).toBe(clientY);
  });
});
