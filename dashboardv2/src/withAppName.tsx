import * as React from 'react';

export const AppNameContext = React.createContext('');

export interface AppNameProps {
	appName: string;
}

export default function withAppName<P extends AppNameProps>(Component: React.ComponentType<P>) {
	return function AppNameComponent(props: Pick<P, Exclude<keyof P, keyof AppNameProps>>) {
		return <AppNameContext.Consumer>{(name) => <Component {...props} appName={name} />}</AppNameContext.Consumer>;
	};
}
