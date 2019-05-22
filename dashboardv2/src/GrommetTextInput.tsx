import * as React from 'react';
import { TextInput as OriginalTextInput } from 'grommet';

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
					_ref(input);
					if (input) {
						ref.current = input;
						input.addEventListener('select', onSelect);
					}
				}}
			/>
		);
	}
);
