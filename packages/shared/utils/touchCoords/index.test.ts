import touchCoords from '.';

describe('touchCoords', () => {
  it('returns the first element from touches if available', () => {
    const target = document.createElement('div');
    const touchEvent = { identifier: 0, target } as unknown as Touch;

    const result = touchCoords(
      new TouchEvent('touchmove', {
        touches: [touchEvent],
        changedTouches: [{ identifier: 1, target } as unknown as Touch],
      })
    );

    expect(result).toEqual(touchEvent);
  });
  it('returns the first element from changedTouches if touches is not available', () => {
    const target = document.createElement('div');
    const touchEvent = { identifier: 0, target } as unknown as Touch;

    const result = touchCoords(
      new TouchEvent('touchmove', {
        touches: undefined,
        changedTouches: [touchEvent],
      })
    );

    expect(result).toEqual(touchEvent);
  });
});
