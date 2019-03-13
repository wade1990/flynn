import * as React from 'react';
import * as jspb from 'google-protobuf';

import { Release } from './generated/controller_pb';
import ExternalAnchor from './ExternalAnchor';
import { renderKeyValueDiff } from './KeyValueEditor';

import './Release.scss';

export function renderRelease(release: Release, prev: Release | null) {
	const labels = release.getLabelsMap();

	const gitCommit =
		labels.get('git.commit') ||
		(() => {
			const rev = labels.get('rev');
			if (labels.get('git') === 'true' && rev) {
				return rev;
			}
			return null;
		})();

	let githubURL = null as string | null;
	if (labels.get('github') === 'true') {
		githubURL = `https://github.com/${labels.get('github_user')}/${labels.get('github_repo')}/tree/${gitCommit}`;
	}

	const releaseID = release
		.getName()
		.split('/')
		.slice(-1)[0];
	return (
		<div>
			{releaseID ? (
				<>
					Release {releaseID}
					<br />
				</>
			) : null}
			{gitCommit ? (
				<>
					git.commit {githubURL ? <ExternalAnchor href={githubURL}>{gitCommit}</ExternalAnchor> : gitCommit}
					<br />
				</>
			) : null}
			{renderKeyValueDiff(prev ? prev.getEnvMap() : new jspb.Map([]), release.getEnvMap())}
		</div>
	);
}
