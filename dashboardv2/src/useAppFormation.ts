import * as React from 'react';
import useClient from './useClient';
import { isNotFoundError } from './client';
import { Formation, ScaleRequestState } from './generated/controller_pb';

export default function useAppFormation(appName: string) {
	const client = useClient();
	const [formationLoading, setFormationLoading] = React.useState(true);
	const [formation, setFormation] = React.useState<Formation | null>(null);
	const [error, setError] = React.useState<Error | null>(null);
	React.useEffect(
		() => {
			const cancel = client.streamAppFormation(appName, (formation: Formation, error: Error | null) => {
				if (error && isNotFoundError(error)) {
					formation.setState(ScaleRequestState.SCALE_COMPLETE);
				} else if (error) {
					setError(error);
					return;
				}
				setFormation(formation);
				setFormationLoading(false);
				setError(null);
			});
			return cancel;
		},
		[appName, client]
	);
	return {
		loading: formationLoading,
		formation,
		error
	};
}
