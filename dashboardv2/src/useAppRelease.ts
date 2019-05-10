import * as React from 'react';
import useClient from './useClient';
import { Release } from './generated/controller_pb';

export default function useAppRelease(appName: string) {
	const client = useClient();
	const [isLoading, setIsLoading] = React.useState(true);
	const [release, setRelease] = React.useState<Release | null>(null);
	const [error, setError] = React.useState<Error | null>(null);
	React.useEffect(
		() => {
			const cancel = client.streamAppRelease(appName, (release: Release, error: Error | null) => {
				setIsLoading(false);
				if (error) {
					setError(error);
					return;
				}
				setRelease(release);
				setError(null);
			});
			return cancel;
		},
		[appName, client]
	);
	return {
		loading: isLoading,
		release,
		error
	};
}
