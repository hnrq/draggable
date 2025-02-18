export const translateMirror = (
	mirror: HTMLElement,
	mirrorCoords: DOMRect,
	containerRect: DOMRect
) => {
	if (mirrorCoords.top < containerRect.top || mirrorCoords.left < containerRect.left) return;

	requestAnimationFrame(() => {
		mirror.style.transform = `translate3d(${mirrorCoords.left}px, ${mirrorCoords.top}px, 0)`;
	});
};

export const offsetWithinThreshold = (
	initialCoord: number,
	currentCoord: number,
	threshold: { min: number; max: number }
) => {
	const updatedCoord = initialCoord - currentCoord;
	let offset = updatedCoord;

	if (updatedCoord < threshold.min) offset = threshold.min;
	else if (updatedCoord > threshold.max) offset = threshold.max;

	return offset;
};

export const flipSign = (number: number) => {
	if (Math.sign(number) === 1) return -Math.abs(number);
	else if (Math.sign(number) === -1) return Math.abs(number);
	else return 0;
};
