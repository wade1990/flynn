import * as React from 'react';
import * as jspb from 'google-protobuf';
import { isEqual } from 'lodash';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import Notification from 'grommet/components/Notification';
import CheckBox from 'grommet/components/CheckBox';
import Button from 'grommet/components/Button';

import withClient, { ClientProps } from './withClient';
import withAppName, { AppNameProps } from './withAppName';
import dataStore from './dataStore';
import { Release } from './generated/controller_pb';
import Loading from './Loading';
import { renderEnvDiff } from './EnvEditor';

import './ReleaseHistory.scss';

function isCodeRelease(release: Release, prevRelease: Release | null): boolean {
	const artifacts = release.getArtifactsList();
	if (prevRelease) {
		const prevArtifacts = prevRelease.getArtifactsList();
		if (isEqual(prevArtifacts, artifacts)) {
			return false;
		}
	} else if (artifacts.length === 0) {
		return false;
	}
	return true;
}

function mapCodeReleases<T>(releases: Release[], fn: (releases: [Release, Release | null], index: number) => T): T[] {
	return releases.reduce<T[]>(
		(res: T[], release: Release, index: number): T[] => {
			const prev = releases[index + 1] || null;
			if (!isCodeRelease(release, prev)) {
				return res;
			}
			return res.concat(fn([release, prev], index));
		},
		[] as Array<T>
	);
}

function mapEnvReleases<T>(releases: Release[], fn: (releases: [Release, Release | null], index: number) => T): T[] {
	return releases.reduce<T[]>(
		(res: T[], release: Release, index: number): T[] => {
			const prev = releases[index + 1] || null;
			if (isCodeRelease(release, prev)) {
				return res;
			}
			return res.concat(fn([release, prev], index));
		},
		[] as Array<T>
	);
}

function mapReleases<T>(releases: Release[], fn: (releases: [Release, Release | null], index: number) => T): T[] {
	return releases.reduce<T[]>(
		(res: T[], release: Release, index: number): T[] => {
			const prev = releases[index + 1] || null;
			return res.concat(fn([release, prev], index));
		},
		[] as Array<T>
	);
}

export interface Props extends ClientProps, RouteComponentProps<{}> {
	releases: Release[];
	currentReleaseName: string;
}

interface State {
	selectedReleaseName: string;
	releasesListFilter: 'code' | 'env' | 'all';
}

export class ReleaseHistory extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			selectedReleaseName: props.currentReleaseName,
			releasesListFilter: 'code'
		};
		this._submitHandler = this._submitHandler.bind(this);
	}

	public render() {
		const { releases, currentReleaseName } = this.props;
		const { selectedReleaseName, releasesListFilter } = this.state;

		const getListItemClassName = (r: Release): string => {
			if (r.getName() === selectedReleaseName) {
				return 'selected';
			}
			return '';
		};

		let mapFn = mapReleases;
		switch (releasesListFilter) {
			case 'code':
				mapFn = mapCodeReleases;
				break;
			case 'env':
				mapFn = mapEnvReleases;
				break;
		}

		return (
			<form onSubmit={this._submitHandler}>
				<ul className="releases-list">
					<CheckBox
						toggle
						checked={['code', 'all'].indexOf(releasesListFilter) !== -1}
						label="Code"
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
							let f;
							if (releasesListFilter === 'all') {
								f = 'env';
							} else if (releasesListFilter === 'env') {
								f = 'all';
							} else {
								f = e.target.checked ? 'code' : 'env';
							}
							this.setState({
								releasesListFilter: f as 'code' | 'env' | 'all'
							});
						}}
					/>

					<CheckBox
						toggle
						checked={['env', 'all'].indexOf(releasesListFilter) !== -1}
						label="Env"
						onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
							let f;
							if (releasesListFilter === 'all') {
								f = 'code';
							} else if (releasesListFilter === 'code') {
								f = 'all';
							} else {
								f = e.target.checked ? 'env' : 'code';
							}
							this.setState({
								releasesListFilter: f as 'code' | 'env' | 'all'
							});
						}}
					/>

					<br />
					<br />

					{mapFn(releases, ([r, p]) => {
						return (
							<li className={getListItemClassName(r)} key={r.getName()}>
								<label>
									<CheckBox
										checked={selectedReleaseName === r.getName()}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
											if (e.target.checked) {
												this.setState({
													selectedReleaseName: r.getName()
												});
											} else {
												this.setState({
													selectedReleaseName: currentReleaseName
												});
											}
										}}
									/>
									{this._renderRelease(r, p)}
								</label>
							</li>
						);
					})}
				</ul>

				{currentReleaseName === selectedReleaseName ? (
					// disabled button
					<Button primary label="Deploy Release" />
				) : (
					<Button type="submit" primary label="Deploy Release" />
				)}
			</form>
		);
	}

	private _renderRelease(release: Release, prev: Release | null) {
		const labels = release.getLabelsMap();
		const gitCommit = labels.get('git.commit');
		return (
			<div>
				Release{' '}
				{
					release
						.getName()
						.split('/')
						.slice(-1)[0]
				}
				<br />
				{gitCommit ? <>git.commit {gitCommit}</> : null}
				{renderEnvDiff(prev ? prev.getEnvMap() : new jspb.Map([]), release.getEnvMap())}
			</div>
		);
	}

	private _submitHandler(e: React.SyntheticEvent) {
		e.preventDefault();
	}
}

export interface WrappedProps extends ClientProps, AppNameProps, RouteComponentProps<{}> {
	currentReleaseName: string;
}

interface WrappedState {
	releases: Release[];
	releasesLoading: boolean;
	releasesError: Error | null;
}

class WrappedReleaseHistory extends React.Component<WrappedProps, WrappedState> {
	private _releasesUnsub: () => void;
	constructor(props: WrappedProps) {
		super(props);
		this.state = {
			releases: [],
			releasesLoading: true,
			releasesError: null
		};
		this._releasesUnsub = () => {};
	}

	public componentDidMount() {
		this._fetchReleases();
	}

	public componentWillUnmount() {
		this._releasesUnsub();
	}

	private _fetchReleases() {
		const { client, appName } = this.props;
		this.setState({
			releasesLoading: true
		});
		client
			.listReleases(appName)
			.then((releases) => {
				const watcher = dataStore.watch(...releases.map((r) => r.getName()));
				watcher.arrayWatcher((releases) => {
					this.setState({
						releases: releases as Release[]
					});
				});
				this._releasesUnsub = watcher.unsubscribe;

				this.setState({
					releasesLoading: false,
					releases
				});
			})
			.catch((error) => {
				this.setState({
					releasesLoading: false,
					releasesError: error
				});
			});
	}

	public render() {
		const { appName, client, ...props } = this.props;
		const { releasesLoading, releasesError, releases } = this.state;
		if (releasesLoading) {
			return <Loading />;
		}
		if (releasesError) {
			return <Notification status="warning" message={releasesError.message} />;
		}
		return <ReleaseHistory {...props as Props} releases={releases} />;
	}
}

export default withRouter(withClient(withAppName(WrappedReleaseHistory)));
