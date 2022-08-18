/**
 * Returns the first touch event found in touches or changedTouches of a touch events.
 */
const touchCoords = (
  { touches, changedTouches }: TouchEvent = {} as TouchEvent
): Touch => touches?.[0] ?? changedTouches?.[0];

export default touchCoords;
