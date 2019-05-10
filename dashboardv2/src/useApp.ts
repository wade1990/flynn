import * as React from 'react';
import useClient from './useClient';
import { App } from './generated/controller_pb';

export default function useApp(appName: string) {
	const client = useClient();
	const [appLoading, setAppLoading] = React.useState(true);
	const [app, setApp] = React.useState<App | null>(null);
	const [error, setError] = React.useState<Error | null>(null);
	React.useEffect(
		() => {
			const cancel = client.streamApp(appName, (app: App, error: Error | null) => {
				setAppLoading(false);
				if (error) {
					setError(error);
					return;
				}
				setApp(app);
				setError(null);
			});
			return cancel;
		},
		[appName, client]
	);
	return {
		loading: appLoading,
		app,
		error
	};
}
