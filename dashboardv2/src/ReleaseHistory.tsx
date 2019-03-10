import * as React from 'react';
import { isEqual } from 'lodash';
import { withRouter, RouteComponentProps } from 'react-router-dom';

import CheckBox from 'grommet/components/CheckBox';
import Button from 'grommet/components/Button';
import { CheckmarkIcon } from 'grommet';

import withClient, { ClientProps } from './withClient';
import withErrorHandler, { ErrorHandlerProps } from './withErrorHandler';
import { Release, Deployment } from './generated/controller_pb';
import Loading from './Loading';
import CreateDeployment from './CreateDeployment';
import { renderRelease } from './Release';
import { parseURLParams, urlParamsToString } from './util/urlParams';

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

function isEnvRelease(release: Release, prevRelease: Release | null): boolean {
	return !isCodeRelease(release, prevRelease);
}

type ReleasesFilterFunc = (release: Release, prevRelease: Release | null) => boolean;

function mapReleases<T>(
	releases: Release[],
	fn: (releases: [Release, Release | null], index: number) => T,
	...filters: ReleasesFilterFunc[]
): T[] {
	return releases.reduce<T[]>(
		(res: T[], release: Release, index: number): T[] => {
			const prev = releases[index + 1] || null;
			if (!filters.find((fn) => fn(release, prev))) {
				return res;
			}
			return res.concat(fn([release, prev], index));
		},
		[] as Array<T>
	);
}

export interface Props extends RouteComponentProps<{}> {
	releases: Release[];
	currentReleaseName: string;
	selectedReleaseName: string;
	onSubmit: (releaseName: string) => void;
}

interface State {
	selectedReleaseName: string;
}

export class ReleaseHistory extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = {
			selectedReleaseName: props.selectedReleaseName || props.currentReleaseName
		};
		this._submitHandler = this._submitHandler.bind(this);
	}

	public componentDidUpdate(prevProps: Props, prevState: State) {
		const { currentReleaseName } = this.props;
		const { selectedReleaseName } = this.state;
		if (selectedReleaseName === prevProps.currentReleaseName && currentReleaseName !== prevState.selectedReleaseName) {
			this.setState({
				selectedReleaseName: currentReleaseName
			});
		}
	}

	public render() {
		const { releases, currentReleaseName, location, history } = this.props;
		const { selectedReleaseName } = this.state;

		const urlParams = parseURLParams(location.search);
		const releasesListFilters = urlParams['rhf'] || ['code'];

		const getListItemClassName = (r: Release): string => {
			if (r.getName() === selectedReleaseName) {
				return 'selected';
			}
			return '';
		};

		let mapFilters: ReleasesFilterFunc[] = [];
		releasesListFilters.forEach((v) => {
			switch (v) {
				case 'code':
					mapFilters.push(isCodeRelease);
					break;
				case 'env':
					mapFilters.push(isEnvRelease);
					break;
			}
		});

		const rhfToggleChangeHanlder = (filterName: string, e: React.ChangeEvent<HTMLInputElement>) => {
			const rhf = new Set(urlParams.rhf || releasesListFilters);
			if (e.target.checked) {
				rhf.add(filterName);
			} else {
				rhf.delete(filterName);
				if (filterName === 'code' && (urlParams.rhf || []).indexOf(filterName) === -1) {
					// turning off 'code' will turn on 'env'
					rhf.add('env');
				}
			}
			if (rhf.has('code') && rhf.size === 1) {
				rhf.delete('code');
			}
			history.replace(
				location.pathname +
					urlParamsToString(
						Object.assign({}, urlParams, {
							rhf: [...rhf]
						})
					)
			);
		};

		return (
			<form onSubmit={this._submitHandler}>
				<ul className="releases-list">
					<CheckBox
						toggle
						checked={releasesListFilters.indexOf('code') > -1}
						label="Code"
						onChange={rhfToggleChangeHanlder.bind(this, 'code')}
					/>

					<CheckBox
						toggle
						checked={releasesListFilters.indexOf('env') > -1}
						label="Env"
						onChange={rhfToggleChangeHanlder.bind(this, 'env')}
					/>

					<br />
					<br />

					{mapReleases(
						releases,
						([r, p]) => {
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
										{renderRelease(r, p)}
									</label>
								</li>
							);
						},
						...mapFilters
					)}
				</ul>

				{currentReleaseName === selectedReleaseName ? (
					// disabled button
					<Button primary icon={<CheckmarkIcon />} label="Deploy Release" />
				) : (
					<Button type="submit" primary icon={<CheckmarkIcon />} label="Deploy Release" />
				)}
			</form>
		);
	}

	private _submitHandler(e: React.SyntheticEvent) {
		e.preventDefault();
		const { selectedReleaseName } = this.state;
		if (selectedReleaseName == '') {
			return;
		}
		this.props.onSubmit(selectedReleaseName);
	}
}

export interface WrappedProps extends ClientProps, ErrorHandlerProps, RouteComponentProps<{}> {
	appName: string;
	currentReleaseName: string;
}

interface WrappedState {
	releases: Release[];
	releasesLoading: boolean;
	isDeploying: boolean;
	releaseName: string;
}

class WrappedReleaseHistory extends React.Component<WrappedProps, WrappedState> {
	private __streamReleasesCancel: () => void;
	constructor(props: WrappedProps) {
		super(props);
		this.state = {
			releases: [],
			releasesLoading: true,
			isDeploying: false,
			releaseName: ''
		};
		this.__streamReleasesCancel = () => {};
		this._handleSubmit = this._handleSubmit.bind(this);
		this._handleDeployCancel = this._handleDeployCancel.bind(this);
		this._handleDeploymentCreate = this._handleDeploymentCreate.bind(this);
	}

	public componentDidMount() {
		this._fetchReleases();
	}

	public componentWillUnmount() {
		this.__streamReleasesCancel();
	}

	private _fetchReleases() {
		const { client, appName, handleError } = this.props;
		this.setState({
			releasesLoading: true
		});
		this.__streamReleasesCancel();
		this.__streamReleasesCancel = client.listReleasesStream(appName, (releases: Release[], error: Error | null) => {
			if (error) {
				return handleError(error);
			}

			this.setState({
				releasesLoading: false,
				releases
			});
		});
	}

	public render() {
		const { appName, client, handleError, ...props } = this.props;
		const { releasesLoading, releases, isDeploying, releaseName } = this.state;
		if (releasesLoading) {
			return <Loading />;
		}
		if (isDeploying) {
			return (
				<CreateDeployment
					appName={appName}
					releaseName={releaseName}
					onCancel={this._handleDeployCancel}
					onCreate={this._handleDeploymentCreate}
				/>
			);
		}
		return (
			<ReleaseHistory
				{...props as Props}
				selectedReleaseName={releaseName}
				releases={releases}
				onSubmit={this._handleSubmit}
			/>
		);
	}

	private _handleSubmit(releaseName: string) {
		this.setState({
			isDeploying: true,
			releaseName
		});
	}

	private _handleDeployCancel() {
		this.setState({
			isDeploying: false
		});
	}

	private _handleDeploymentCreate(deployment: Deployment) {
		this.setState({
			isDeploying: false,
			releaseName: ''
		});
	}
}

export default withErrorHandler(withRouter(withClient(WrappedReleaseHistory)));
