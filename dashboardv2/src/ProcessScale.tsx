import * as React from 'react';
import { debounce } from 'lodash';
import styled from 'styled-components';
import { LinkUp as LinkUpIcon, LinkDown as LinkDownIcon } from 'grommet-icons';
import { Text, Box, BoxProps, Button } from 'grommet';

export const valueCSS = (size: string) => `
	font-size: ${size === 'small' ? '2em' : '4em'};
	min-width: 1.2em;
	text-align: center;
	line-height: 1em;
`;

interface ValueInputProps {
	fontSize: string;
}

const ValueInput = styled.input`
	width: calc(0.7em + ${(props) => (props.value ? (props.value + '').length / 2 : 0)}em);
	border: none;
	&:focus {
		outline-width: 0;
	}
	font-weight: normal;
	${(props: ValueInputProps) => valueCSS(props.fontSize)};
`;

export const ValueText = styled(Text)`
	${(props) => valueCSS(props.size as string)};
`;

export const LabelText = styled(Text)`
	font-size: ${(props) => (props.size === 'small' ? '1em' : '1.5em')};
	line-height: 1.5em;
	margin: 0 0.5em;
`;

export interface Props extends BoxProps {
	value: number;
	label: string;
	size?: 'small' | 'large';
	editable?: boolean;
	onChange?: (value: number) => void;
}

/*
 * <ProcessScale /> renders the amount a process is scaled to and allows
 * editing that amount when `editable=true`.
 *
 * Example:
 *	<ProcessScale value={3} label="web" />
 *
 * Example:
 *	<ProcessScale size="small" value={3} label="web" />
 *
 * Example:
 *	<ProcessScale value={3} label="web" editable onChange={(newValue) => { do something with newValue }} />
 */
export default function ProcessScale({
	value: initialValue,
	label,
	size = 'large',
	editable = false,
	onChange = () => {},
	...boxProps
}: Props) {
	const [value, setValue] = React.useState(initialValue);

	// Handle rapid changes as single change
	const onChangeDebounced = React.useMemo(
		() => {
			return debounce(onChange, 100);
		},
		[onChange]
	);

	// Send changes upstream via onChange() prop when value changes
	React.useEffect(
		() => {
			if (value !== initialValue) {
				onChangeDebounced.cancel();
				onChangeDebounced(value);
			}
		},
		[onChangeDebounced, value, initialValue]
	);

	// Handle incoming changes to props.value
	React.useEffect(
		() => {
			onChangeDebounced.cancel();
			setValue(initialValue);
		},
		[initialValue, onChangeDebounced]
	);

	const [valueEditable, setValueEditable] = React.useState(false);
	const valueInput = React.useRef(null) as React.RefObject<HTMLInputElement>;

	// Focus input when valueEditable enabled
	React.useLayoutEffect(
		() => {
			if (valueEditable && valueInput.current) {
				valueInput.current.focus();
			}
		},
		[valueEditable, valueInput]
	);

	const handleIncrement = (prevValue: number) => {
		return prevValue + 1;
	};

	const handleDecrement = (prevValue: number) => {
		return Math.max(prevValue - 1, 0);
	};

	return (
		<Box align="center" border="all" round {...boxProps}>
			<Box
				direction="row"
				align="center"
				justify="center"
				border={boxProps.direction === 'row' ? 'right' : 'bottom'}
				fill="horizontal"
			>
				{valueEditable ? (
					<ValueInput
						ref={valueInput}
						fontSize={size}
						onBlur={() => setValueEditable(false)}
						onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
							setValue(Math.max(parseInt(e.target.value, 10) || 0, 0))
						}
						value={value}
					/>
				) : (
					<ValueText size={size} onClick={() => (editable ? setValueEditable(true) : void 0)}>
						{value}
					</ValueText>
				)}
				{editable ? (
					<Box>
						<Button icon={<LinkUpIcon />} onClick={() => setValue(handleIncrement)} />
						<Button icon={<LinkDownIcon />} onClick={() => setValue(handleDecrement)} />
					</Box>
				) : null}
			</Box>
			<LabelText>{label}</LabelText>
		</Box>
	);
}
