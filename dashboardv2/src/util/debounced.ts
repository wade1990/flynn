export interface Func {
	(): void;
	cancel: () => void;
}

export default function debounced(fn: () => void, timeoutMs = 200): Func {
	let _timeout = setTimeout(() => {}, 0);
	return Object.assign(
		() => {
			clearTimeout(_timeout);
			_timeout = setTimeout(fn, timeoutMs);
		},
		{
			cancel: () => {
				clearTimeout(_timeout);
			}
		}
	);
}
