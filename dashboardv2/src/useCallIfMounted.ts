import * as React from 'react';

export default function useCallIfMounted() {
	const state = { mounted: true };
	React.useEffect(() => {
		return () => {
			state.mounted = false;
		};
	}, []); // eslint-disable-line react-hooks/exhaustive-deps
	return (fn: () => void) => {
		if (state.mounted) {
			return fn();
		}
	};
}
