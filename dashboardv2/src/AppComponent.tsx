import * as React from 'react';
import { Github as GithubIcon } from 'grommet-icons';
import { Box, Heading, Accordion, AccordionPanel } from 'grommet';

import useApp from './useApp';
import useRouter from './useRouter';

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
	React.useEffect(
		() => {
			if (appError) {
				handleError(appError);
			}
		},
		[appError]
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

	if (!app) {
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
							<FormationEditor appName={app.getName()} />
						</React.Suspense>
					</Box>
				</AccordionPanel>

				<AccordionPanel label="Release History">
					<Box pad="medium">
						<React.Suspense fallback={<Loading />}>
							<ReleaseHistory appName={app.getName()} />
						</React.Suspense>
					</Box>
				</AccordionPanel>

				<AccordionPanel label="Environment">
					<Box pad="medium">
						<React.Suspense fallback={<Loading />}>
							<EnvEditor appName={app.getName()} />
						</React.Suspense>
					</Box>
				</AccordionPanel>

				<AccordionPanel label="Metadata">
					<Box pad="medium">
						<React.Suspense fallback={<Loading />}>
							<MetadataEditor appName={app.getName()} />
						</React.Suspense>
					</Box>
				</AccordionPanel>
			</Accordion>
		</>
	);
}
