export const createSandbox = (content) => {
  const sandbox = document.createElement('div');
  sandbox.innerHTML = content;
  document.body.appendChild(sandbox);

  return sandbox;
};

export const withElementFromPoint = (elementFromPoint, callback) => {
  const originalElementFromPoint = document.elementFromPoint;
  document.elementFromPoint = () => elementFromPoint;
  callback();
  document.elementFromPoint = originalElementFromPoint;
};

export const REQUEST_ANIMATION_FRAME_TIMEOUT = 15;

export const waitForRequestAnimationFrame = (
  requestAnimationFrameTimeout = REQUEST_ANIMATION_FRAME_TIMEOUT
) => {
  vi.advanceTimersByTime(requestAnimationFrameTimeout + 1);
};
