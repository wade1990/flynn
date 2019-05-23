import * as React from 'react';
import Notification from './Notification';

export interface ErrorHandler {
	(error: Error): void;
	key: Symbol;
}

export interface CancelableError extends Error {
	cancel: () => void;
	key: Symbol;
}

const callbacks = new Set<() => void>();

const errors = new Map<Symbol, CancelableError[]>();

export interface ErrorHandlerProps {
	handleError: ErrorHandler;
}

export function registerCallback(h: () => void): () => void {
	callbacks.add(h);
	return () => {
		callbacks.delete(h);
	};
}

function handleError(error: Error, key: Symbol = Symbol('useErrorHandler key(undefined)')) {
	const cancelableError = Object.assign(new Error(error.message), error, {
		cancel: () => {
			const arr = errors.get(key);
			if (!arr) return;
			const index = arr.indexOf(cancelableError);
			if (index === -1) return;
			errors.set(key, arr.slice(0, index).concat(arr.slice(index + 1)));
			for (let fn of callbacks) {
				fn();
			}
		},
		key: key
	});
	errors.set(key, (errors.get(key) || []).concat(cancelableError));
	for (let fn of callbacks) {
		fn();
	}
}

export function useErrors(): CancelableError[] {
	const [errorsArr, setErrors] = React.useState<CancelableError[]>([]);
	React.useEffect(() => {
		return registerCallback(() => {
			const arr = [] as CancelableError[];
			for (let v of errors.values()) {
				arr.push(...v);
			}
			setErrors(arr);
		});
	}, []);
	return errorsArr;
}

export function DisplayErrors() {
	const errors = useErrors();
	return (
		<>
			{errors.map((error: CancelableError, index: number) => (
				<Notification
					key={error.key.toString() + index}
					message={error.message}
					status="warning"
					onClose={() => error.cancel()}
					margin="small"
				/>
			))}
		</>
	);
}

export enum ErrorHandlerOption {
	PERSIST_AFTER_UNMOUNT
}

let debugIndex = 0;
export default function useErrorHandler(..._opts: ErrorHandlerOption[]): ErrorHandler {
	const [opts] = React.useState(new Set(_opts));
	const [key] = React.useState(() => Symbol(`useErrorHandler key(${debugIndex++})`));
	React.useEffect(
		() => {
			if (opts.has(ErrorHandlerOption.PERSIST_AFTER_UNMOUNT)) return;
			// cancel all errors for component on unmount
			return () => {
				errors.delete(key);
				for (let fn of callbacks) {
					fn();
				}
			};
		},
		[key, opts]
	);
	return React.useCallback(
		Object.assign(
			(error: Error) => {
				handleError(error, key);
			},
			{ key }
		),
		[key]
	);
}
