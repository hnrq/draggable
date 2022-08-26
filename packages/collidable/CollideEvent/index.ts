import { DragEvent } from '../../../Draggable';

export type CollidableEventMap = {
  'collide:in': CollideInEvent;
  'collide:out': CollideOutEvent;
};

export type CollideEventData = {
  dragEvent: DragEvent;
};

export class CollideEvent<
  T extends CollideEventData = CollideEventData
> extends CustomEvent<T> {
  constructor(
    eventInitDict?: CustomEventInit<T>,
    type: string = CollideEvent.type
  ) {
    super(type, eventInitDict);
  }

  get dragEvent(): DragEvent {
    return this.detail.dragEvent;
  }

  static type = 'collidable';
}

export type CollideInEventDetail = CollideEventData & {
  collidingElement: HTMLElement;
};

export class CollideInEvent extends CollideEvent<CollideInEventDetail> {
  constructor(detail: CollideInEventDetail) {
    super({ detail }, CollideInEvent.type);
  }

  get collidingElement() {
    return this.detail.collidingElement;
  }

  static type = 'collide:in';
}

export type CollideOutEventDetail = CollideEventData & {
  collidingElement: HTMLElement;
};

export class CollideOutEvent extends CollideEvent<CollideOutEventDetail> {
  constructor(detail: CollideOutEventDetail) {
    super({ detail }, CollideOutEvent.type);
  }

  get collidingElement() {
    return this.detail.collidingElement;
  }

  static type = 'collide:out';
}
