import * as React from 'react';
import * as jspb from 'google-protobuf';

import { Release } from './generated/controller_pb';
import protoMapDiff, { DiffOption } from './util/protoMapDiff';

import './Release.scss';

export type StringMap = jspb.Map<string, string>;

export function renderEnvDiff(prevEnv: StringMap, env: StringMap) {
	const diff = protoMapDiff(prevEnv, env, DiffOption.INCLUDE_UNCHANGED).sort((a, b) => {
		return a.key.localeCompare(b.key);
	});

	return (
		<pre>
			{diff.map((item) => {
				let value;
				let prefix = ' ';
				switch (item.op) {
					case 'keep':
						value = env.get(item.key);
						break;
					case 'remove':
						prefix = '-';
						value = prevEnv.get(item.key);
						break;
					case 'add':
						prefix = '+';
						value = env.get(item.key);
						break;
				}
				return (
					<span key={item.op + item.key} className={'env-diff-' + item.op}>
						{prefix} {item.key} = {value}
						<br />
					</span>
				);
			})}
		</pre>
	);
}

export function renderRelease(release: Release, prev: Release | null) {
	const labels = release.getLabelsMap();
	const gitCommit = labels.get('git.commit');
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
			{gitCommit ? <>git.commit {gitCommit}</> : null}
			{renderEnvDiff(prev ? prev.getEnvMap() : new jspb.Map([]), release.getEnvMap())}
		</div>
	);
}
