import * as React from 'react';
import { debounce } from 'lodash';

export interface Props {
	children: React.ReactNode;
	timeoutMs?: number;
}

export default function Debounced({ children, timeoutMs = 0 }: Props) {
	const [shouldRender, setShouldRender] = React.useState(false);
	React.useEffect(
		() => {
			const { cancel } = debounce(() => setShouldRender(true), timeoutMs);
			return cancel;
		},
		[timeoutMs]
	);

	if (shouldRender) {
		return <>children</>;
	}
	return null;
}
