import * as React from 'react';
import { Github as GithubIcon } from 'grommet-icons';
import { Box, Heading, Accordion, AccordionPanel } from 'grommet';

import { isNotFoundError } from './client';
import useApp from './useApp';
import useRouter from './useRouter';
import { NavProtectionContext, buildNavProtectionContext } from './useNavProtection';

import { handleError } from './withErrorHandler';
import Loading from './Loading';
import ExternalAnchor from './ExternalAnchor';
const FormationEditor = React.lazy(() => import('./FormationEditor'));
const ReleaseHistory = React.lazy(() => import('./ReleaseHistory'));
const EnvEditor = React.lazy(() => import('./EnvEditor'));
const MetadataEditor = React.lazy(() => import('./MetadataEditor'));

export interface Props {
	name: string;
}

/*
 * <AppComponent> is a container displaying information and executing
 * operations on an App given it's name.
 *
 * Notibly it provides
 *	- viewing/editing process scale
 *	- viewing/deploying release and scale history
 *	- viewing/editing environment variables
 *	- viewing/editing app metadata
 *
 * Example:
 *
 *	<AppComponent name="apps/70f9e916-5612-4634-b6f1-2df75c1dd5de" />
 *
 */
export default function AppComponent({ name }: Props) {
	// Stream app
	const { app, loading: appLoading, error: appError } = useApp(name);
	const isAppDeleted = React.useMemo(
		() => {
			// if the app exists and we're getting a not found error, then it has been
			// deleted
			return app && appError && isNotFoundError(appError);
		},
		[appError] // eslint-disable-line react-hooks/exhaustive-deps
	);
	React.useEffect(
		() => {
			if (appError) {
				if (app && isNotFoundError(appError)) {
					handleError(new Error(`"${app.getDisplayName()}" has been deleted!`));
					history.push('/' + location.search);
				} else {
					handleError(appError);
				}
			}
		},
		[appError] // eslint-disable-line react-hooks/exhaustive-deps
	);
	React.useDebugValue(`App(${app ? name : 'null'})${appLoading ? ' (Loading)' : ''}`);

	const githubURL = React.useMemo<string | null>(
		() => {
			if (!app) {
				return null;
			}
			return app.getLabelsMap().get('github.url') || null;
		},
		[app]
	);

	const formationEditorNavProtectionContext = React.useMemo(() => buildNavProtectionContext('s=0'), []);
	const releaseHistoryNavProtectionContext = React.useMemo(() => buildNavProtectionContext('s=1'), []);
	const envEditorNavProtectionContext = React.useMemo(() => buildNavProtectionContext('s=2'), []);
	const metadataEditorNavProtectionContext = React.useMemo(() => buildNavProtectionContext('s=3'), []);

	const { history, location, urlParams } = useRouter();
	const activePanelIndices = urlParams.getAll('s').map((i: string) => parseInt(i, 10));
	const handlePanelSectionChange = (activePanelIndices: number[]) => {
		const nextUrlParams = new URLSearchParams(urlParams);
		nextUrlParams.delete('s');
		activePanelIndices.sort().forEach((i: number) => nextUrlParams.append('s', `${i}`));
		nextUrlParams.sort();
		history.replace(location.pathname + '?' + nextUrlParams.toString());
	};

	if (appLoading) {
		return <Loading />;
	}

	if (!app || isAppDeleted) {
		return null;
	}

	return (
		<>
			<Heading>
				<>
					{app.getDisplayName()}
					{githubURL ? (
						<>
							&nbsp;
							<ExternalAnchor href={githubURL}>
								<GithubIcon />
							</ExternalAnchor>
						</>
					) : null}
				</>
			</Heading>
			<Accordion multiple animate={false} onActive={handlePanelSectionChange} activeIndex={activePanelIndices}>
				<AccordionPanel label="Scale">
					<Box pad="medium">
						<React.Suspense fallback={<Loading />}>
							<NavProtectionContext.Provider value={formationEditorNavProtectionContext}>
								<FormationEditor appName={app.getName()} />
							</NavProtectionContext.Provider>
						</React.Suspense>
					</Box>
				</AccordionPanel>

				<AccordionPanel label="Release History">
					<Box pad="medium">
						<React.Suspense fallback={<Loading />}>
							<NavProtectionContext.Provider value={releaseHistoryNavProtectionContext}>
								<ReleaseHistory appName={app.getName()} />
							</NavProtectionContext.Provider>
						</React.Suspense>
					</Box>
				</AccordionPanel>

				<AccordionPanel label="Environment">
					<Box pad="medium">
						<React.Suspense fallback={<Loading />}>
							<NavProtectionContext.Provider value={envEditorNavProtectionContext}>
								<EnvEditor appName={app.getName()} />
							</NavProtectionContext.Provider>
						</React.Suspense>
					</Box>
				</AccordionPanel>

				<AccordionPanel label="Metadata">
					<Box pad="medium">
						<React.Suspense fallback={<Loading />}>
							<NavProtectionContext.Provider value={metadataEditorNavProtectionContext}>
								<MetadataEditor appName={app.getName()} />
							</NavProtectionContext.Provider>
						</React.Suspense>
					</Box>
				</AccordionPanel>
			</Accordion>
		</>
	);
}
