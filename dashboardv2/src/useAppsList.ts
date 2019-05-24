import * as React from 'react';
import useClient from './useClient';
import { App } from './generated/controller_pb';
import { ListAppsRequestModifier } from './client';

const emptyReqModifiersArray = [] as ListAppsRequestModifier[];

export default function useAppsList(reqModifiers: ListAppsRequestModifier[] = []) {
	const client = useClient();
	const [appsLoading, setAppsLoading] = React.useState(true);
	const [apps, setApps] = React.useState<App[]>([]);
	const [error, setError] = React.useState<Error | null>(null);
	if (reqModifiers.length === 0) {
		reqModifiers = emptyReqModifiersArray;
	}
	React.useEffect(
		() => {
			setAppsLoading(true);
			setApps([]);
			const cancel = client.streamApps((apps: App[], error: Error | null) => {
				setAppsLoading(false);
				if (error) {
					setError(error);
					return;
				}
				setApps(apps);
				setError(null);
			}, ...reqModifiers);
			return cancel;
		},
		[client, reqModifiers]
	);
	return {
		loading: appsLoading,
		apps,
		error
	};
}
