import { DragEvent } from 'Draggable';

export type SnappableEventMap = {
  'snap:in': SnapInEvent;
  'snap:out': SnapOutEvent;
};

export type SnapEventDetail = {
  dragEvent: DragEvent;
  snappingElement: HTMLElement;
};

export class SnapEvent<
  T extends SnapEventDetail = SnapEventDetail
> extends CustomEvent<T> {
  constructor(
    eventInitDict?: CustomEventInit<T>,
    type: string = SnapEvent.type
  ) {
    super(type, eventInitDict);
  }

  get dragEvent() {
    return this.detail.dragEvent;
  }

  get snappingElement() {
    return this.detail.snappingElement;
  }

  clone = (detail: Partial<SnapEventDetail>) =>
    new SnapEvent({ detail: { ...this.detail, ...detail } }, SnapEvent.type);

  static type = 'snap';
}

export class SnapInEvent extends SnapEvent {
  constructor(detail: SnapEventDetail) {
    super({ detail, cancelable: SnapInEvent.cancelable }, SnapInEvent.type);
  }

  clone = (detail: Partial<SnapEventDetail>) =>
    new SnapInEvent({ ...this.detail, ...detail });

  static type = 'snap:in';
  static cancelable = true;
}

export class SnapOutEvent extends SnapEvent {
  constructor(detail: SnapEventDetail) {
    super({ detail, cancelable: SnapOutEvent.cancelable }, SnapOutEvent.type);
  }

  clone = (detail: Partial<SnapEventDetail>) =>
    new SnapOutEvent({ ...this.detail, ...detail });

  static type = 'snap:out';
  static cancelable = true;
}
