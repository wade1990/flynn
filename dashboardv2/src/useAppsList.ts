import * as React from 'react';
import useClient from './useClient';
import { App } from './generated/controller_pb';

export default function useAppsList() {
	const client = useClient();
	const [appLoading, setAppLoading] = React.useState(true);
	const [apps, setApps] = React.useState<App[]>([]);
	const [error, setError] = React.useState<Error | null>(null);
	React.useEffect(
		() => {
			const cancel = client.streamApps((apps: App[], error: Error | null) => {
				setAppLoading(false);
				if (error) {
					setError(error);
					return;
				}
				setApps(apps);
				setError(null);
			});
			return cancel;
		},
		[client]
	);
	return {
		loading: appLoading,
		apps,
		error
	};
}
