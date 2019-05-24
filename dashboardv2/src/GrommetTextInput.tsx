import * as React from 'react';
import { TextInput as OriginalTextInput } from 'grommet';

// TextInput wraps grommet's TextInput so we can listen for `select` events on
// the input element. This behaviour is not currently supported by grommet due
// to an unfortunate naming collision with their suggestions feature.
// See https://github.com/grommet/grommet/issues/3118
export const TextInput = React.forwardRef(
	({ onSelect = () => {}, onSuggestionSelect = () => {}, ...rest }: any, _ref: any) => {
		const ref = React.useMemo(
			() => {
				return { current: null as HTMLInputElement | null };
			},
			[] // eslint-disable-line react-hooks/exhaustive-deps
		);
		React.useEffect(
			() => {
				return () => {
					if (!ref.current) return;
					ref.current.removeEventListener('select', onSelect);
					ref.current = null;
				};
			},
			[] // eslint-disable-line react-hooks/exhaustive-deps
		);
		return (
			<OriginalTextInput
				onSelect={onSuggestionSelect}
				{...rest}
				ref={(input: any) => {
					if (_ref) {
						_ref(input);
					}
					if (input) {
						ref.current = input;
						input.addEventListener('select', onSelect);
					}
				}}
			/>
		);
	}
);
