import * as React from 'react';
import Button from 'grommet/components/Button';
import { CheckmarkIcon } from 'grommet';

import { Release, Deployment } from './generated/controller_pb';
import withErrorHandler, { ErrorHandlerProps } from './withErrorHandler';
import withClient, { ClientProps } from './withClient';
import dataStore from './dataStore';
import Loading from './Loading';
import { renderRelease } from './Release';

interface Props extends ErrorHandlerProps, ClientProps {
	appName: string;
	releaseName?: string;
	buildNewRelease?: (currentRelease: Release) => Release;
	onCancel: () => void;
	onCreate: (deployment: Deployment) => void;
}

interface State {
	isLoading: boolean;
	isCreating: boolean;
	currentRelease: Release | null;
	nextRelease: Release | null;
	newRelease: Release | null;
}

class CreateDeployment extends React.Component<Props, State> {
	private _isMounted: boolean;

	constructor(props: Props) {
		super(props);

		this.state = {
			isLoading: true,
			isCreating: false,
			currentRelease: null,
			nextRelease: null,
			newRelease: null
		};

		this._handleNextReleaseSubmit = this._handleNextReleaseSubmit.bind(this);
		this._handleCancelBtnClick = this._handleCancelBtnClick.bind(this);
	}

	public componentDidMount() {
		this._isMounted = true;
		this._getData();
	}

	public componentWillUnmount() {
		this._isMounted = false;
	}

	public render() {
		const { isLoading, currentRelease, nextRelease, newRelease } = this.state;
		if (isLoading) return <Loading />;
		if (nextRelease) {
			return this._renderNextRelease(currentRelease, nextRelease);
		}
		if (newRelease) {
			return this._renderNextRelease(currentRelease, newRelease);
		}
		throw new Error('<CreateDeployment> Invalid state!');
	}

	private _renderNextRelease(currentRelease: Release | null, nextRelease: Release) {
		const { isCreating } = this.state;
		return (
			<form onSubmit={this._handleNextReleaseSubmit}>
				<h3>Review Changes</h3>
				{renderRelease(nextRelease, currentRelease)}
				{isCreating ? (
					// Disabled button
					<Button type="button" primary icon={<CheckmarkIcon />} label="Deploying..." />
				) : (
					<Button type="submit" primary icon={<CheckmarkIcon />} label="Deploy" />
				)}
				&nbsp;
				<Button type="button" label="Cancel" onClick={this._handleCancelBtnClick} />
			</form>
		);
	}

	private _getData() {
		if (!this._isMounted) return;
		const { appName, releaseName, buildNewRelease, client, handleError } = this.props;
		this.setState({
			isLoading: true
		});
		if (releaseName) {
			Promise.all([client.getAppRelease(appName), client.getRelease(releaseName)])
				.then(([currentRelease, nextRelease]: [Release, Release]) => {
					if (!this._isMounted) return;
					this.setState({
						isLoading: false,
						currentRelease,
						nextRelease
					});
				})
				.catch((error: Error) => {
					if (!this._isMounted) return;
					this.setState({
						isLoading: false
					});
					handleError(error);
				});
		} else if (buildNewRelease) {
			client
				.getAppRelease(appName)
				.then((currentRelease: Release) => {
					if (!this._isMounted) return;
					const newRelease = buildNewRelease(currentRelease);
					this.setState({
						isLoading: false,
						currentRelease,
						newRelease
					});
				})
				.catch((error: Error) => {
					if (!this._isMounted) return;
					this.setState({
						isLoading: false
					});
					handleError(error);
				});
		} else {
			throw new Error('<CreateDeployment> requires either `releaseName` or `buildNewRelease` props.');
		}
	}

	private _handleNextReleaseSubmit(e: React.SyntheticEvent) {
		e.preventDefault();
		if (!this._isMounted) return;
		const { handleError, onCreate } = this.props;
		const { nextRelease, newRelease } = this.state;
		this.setState({
			isCreating: true
		});
		let p = Promise.resolve(null) as Promise<any>;
		if (newRelease) {
			p = this._createRelease().then((release: Release) => {
				return this._createDeployment(release);
			});
		} else if (nextRelease) {
			p = this._createDeployment(nextRelease);
		}
		p.then((deployment) => {
			onCreate(deployment);
		}).catch((error: Error) => {
			if (!this._isMounted) return;
			this.setState({
				isCreating: false
			});
			handleError(error);
		});
	}

	private _handleCancelBtnClick(e: React.SyntheticEvent) {
		e.preventDefault();
		const { onCancel } = this.props;
		onCancel();
	}

	private _createRelease() {
		const { client, appName, buildNewRelease } = this.props;
		if (!buildNewRelease) throw new Error('Unexpected lack of buildNewRelease prop!');
		return client.getAppRelease(appName).then((release) => {
			const newRelease = buildNewRelease(release);
			return client.createRelease(appName, newRelease);
		});
	}

	private _createDeployment(release: Release) {
		const { client, appName } = this.props;
		const { currentRelease } = this.state;
		return client.createDeployment(appName, release.getName()).then((deployment: Deployment) => {
			if (currentRelease) {
				const prevReleaseName = currentRelease.getName();
				dataStore.del(prevReleaseName);
				return client
					.getApp(appName)
					.then((app) => {
						dataStore.add(app);
					})
					.then(() => {
						return deployment;
					});
			}
			return deployment;
		});
	}
}

export default withErrorHandler(withClient(CreateDeployment));
