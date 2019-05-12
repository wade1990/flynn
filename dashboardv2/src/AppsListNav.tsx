import * as React from 'react';
import { Box } from 'grommet';

import useRouter from './useRouter';
import useAppsList from './useAppsList';
import { handleError } from './withErrorHandler';

import Loading from './Loading';
import NavLink from './NavLink';
import { parseURLParams, urlParamsToString } from './util/urlParams';

export interface Props {
	onNav(path: string): void;
}

export default function AppsListNav({ onNav }: Props) {
	const { location } = useRouter();
	const { apps, loading: isLoading, error: appsError } = useAppsList();
	React.useEffect(
		() => {
			if (appsError) {
				handleError(appsError);
			}
		},
		[appsError]
	);

	if (isLoading) {
		return <Loading />;
	}

	// some query params are persistent, make sure they're passed along if present
	const params = parseURLParams(location.search, 'rhf', 's');
	const search = urlParamsToString(params);

	const appRoutes = apps.map((app, index) => {
		const path = `/${app.getName()}`; // e.g. /apps/48a2d322-5cfe-4323-8823-4dad4528c090
		return {
			path,
			search,
			displayName: app.getDisplayName(), // e.g. controller
			selected: location.pathname === path
		};
	});

	const navHandler = (path: string) => {
		if (location.pathname === path) {
			return;
		}
		onNav(path);
	};

	return (
		<Box tag="ul" margin="none" pad="none" flex={true} overflow="auto">
			{appRoutes.map((r) => {
				return (
					<NavLink path={r.path} search={search} key={r.path} onNav={navHandler}>
						<Box
							tag="li"
							direction="row"
							justify="between"
							align="center"
							border="bottom"
							pad={{ horizontal: 'medium', vertical: 'small' }}
							basis="auto"
							flex={false}
							background={r.selected ? 'accent-1' : 'neutral-1'}
						>
							{r.displayName}
						</Box>
					</NavLink>
				);
			})}
		</Box>
	);
}
