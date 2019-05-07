import * as React from 'react';
import { Omit } from 'grommet/utils';

export interface ErrorHandler {
	(error: Error): void;
}

const handlers = new Set<ErrorHandler>();

export interface ErrorHandlerProps {
	handleError: ErrorHandler;
}

export function registerErrorHandler(h: ErrorHandler): () => void {
	handlers.add(h);
	return () => {
		handlers.delete(h);
	};
}

export function handleError(error: Error) {
	for (let h of handlers) {
		h(error);
	}
}

export default function withErrorHandler<P extends ErrorHandlerProps>(Component: React.ComponentType<P>) {
	return function ErrorHandlerComponent(props: Omit<P, keyof ErrorHandlerProps>) {
		return <Component {...props as P} handleError={handleError} />;
	};
}
