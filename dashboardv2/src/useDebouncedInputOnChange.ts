import * as React from 'react';
import { debounce } from 'lodash';

export default function useDebouncedInputOnChange(
	value: string,
	onChange: (value: string) => void,
	timeout = 300
): [string, (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void] {
	const [_value, setValue] = React.useState(value);
	const _onChange = React.useMemo(() => debounce(onChange, timeout), [onChange, timeout]);

	// handle new value being passed in
	React.useEffect(
		() => {
			_onChange.cancel();
			setValue(value);
		},
		[value] // eslint-disable-line react-hooks/exhaustive-deps
	);

	// make sure it doesn't fire after component unmounted
	React.useEffect(
		() => {
			return _onChange.cancel();
		},
		[] // eslint-disable-line react-hooks/exhaustive-deps
	);

	return [
		_value,
		(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			_onChange.cancel();
			const nextValue = e.target.value;
			setValue(nextValue);
			_onChange(nextValue);
		}
	];
}
