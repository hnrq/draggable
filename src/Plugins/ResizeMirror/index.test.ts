import {
  waitFor,
  getByText,
  getAllByTestId,
  getByTestId,
  queryByTestId,
} from '@testing-library/dom';

import {
  createSandbox,
  waitForRequestAnimationFrame,
  clickMouse,
  moveMouse,
  releaseMouse,
  DRAG_DELAY,
  waitForDragDelay,
} from '../../test-utils/helpers';
import Draggable, { Scrollable } from '../../Draggable';
import ResizeMirror from '.';
import { Mock } from 'vitest';

const sampleMarkup = `
  <ul data-testid="container">
    <li>Smaller item</li>
  </ul>
  <ul data-testid="container">
    <li>Larger item</li>
  </ul>
  <ul data-testid="container">
    <!-- Empty -->
  </ul>
`;

describe('ResizeMirror', () => {
  const smallerDraggableDimensions = {
    width: 100,
    height: 30,
  };

  const largerDraggableDimensions = {
    width: smallerDraggableDimensions.width * 2,
    height: smallerDraggableDimensions.height * 2,
  };

  let dom;
  let containers;
  let draggable: Draggable;

  beforeEach(() => {
    dom = createSandbox(sampleMarkup);
    containers = getAllByTestId(dom, 'container');

    mockDimensions(getByText(dom, 'Smaller item'), smallerDraggableDimensions);
    mockDimensions(getByText(dom, 'Larger item'), largerDraggableDimensions);

    draggable = new Draggable(containers, {
      draggable: 'li',
      delay: DRAG_DELAY,
      plugins: [ResizeMirror],
      exclude: {
        plugins: [Scrollable],
      },
    });

    draggable;

    vi.useFakeTimers();
    vi.spyOn(global, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => {
    draggable.destroy();
    vi.useRealTimers();
    (global.requestAnimationFrame as Mock).mockRestore();
  });

  it('resizes mirror based on over element', () => {
    const dragItem = getByText(dom, 'Smaller item');
    clickMouse(dragItem);
    waitForDragDelay();

    const mirror = getByTestId(dom, 'mirror');

    expect(mirror.style.width).toBe(`${smallerDraggableDimensions.width}px`);
    expect(mirror.style.height).toBe(`${smallerDraggableDimensions.height}px`);

    moveMouse(getByText(dom, 'Larger item'));

    expect(mirror.style.width).toBe(`${largerDraggableDimensions.width}px`);
    expect(mirror.style.height).toBe(`${largerDraggableDimensions.height}px`);

    moveMouse(dragItem);

    expect(mirror.style.width).toBe(`${smallerDraggableDimensions.width}px`);
    expect(mirror.style.height).toBe(`${smallerDraggableDimensions.height}px`);

    releaseMouse(getByText(dom, 'Larger item'));
  });

  it('appends mirror in over container', async () => {
    clickMouse(getByText(dom, 'Smaller item'));
    waitForDragDelay();

    const mirror = getByTestId(dom, 'mirror');

    moveMouse(getByText(dom, 'Larger item'));
    waitForRequestAnimationFrame();

    await waitFor(() => {
      expect(mirror.parentElement).toBe(containers[1]);
    });
  });

  it('appends mirror only for different parent containers', async () => {
    const dragItem = getByText(dom, 'Smaller item');
    clickMouse(dragItem);
    waitForDragDelay();
    const mockedAppendChild = vi.spyOn(Node.prototype, 'appendChild');

    const mirror = getByTestId(dom, 'mirror');

    expect(mirror.parentNode).toBe(draggable.sourceContainer);
    expect(mockedAppendChild).not.toHaveBeenCalled();

    releaseMouse(getByText(dom, 'Larger item'));
  });

  it('prevents appending mirror when mirror was removed', async () => {
    const dragItem = getByText(dom, 'Smaller item');
    clickMouse(dragItem);
    waitForDragDelay();
    moveMouse(dragItem);
    releaseMouse(dragItem);

    await waitFor(() => {
      const mirror = queryByTestId(dom, 'mirror');
      expect(mirror).not.toBeInTheDocument();
    });
  });
});

const mockDimensions = (
  element: HTMLElement,
  { width = 0, height = 0 }: Partial<DOMRect>
) => {
  element.style.width = `${width}px`;
  element.style.height = `${height}px`;
  element.getBoundingClientRect = () =>
    ({
      width,
      height,
      top: 0,
      left: 0,
      right: width,
      bottom: height,
    } as DOMRect);
};
