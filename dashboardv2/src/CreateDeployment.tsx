import * as React from 'react';
import Button from 'grommet/components/Button';
import { CheckmarkIcon, Columns, Box, Value } from 'grommet';

import { Release, Formation, Deployment, CreateScaleRequest } from './generated/controller_pb';
import withErrorHandler, { ErrorHandlerProps } from './withErrorHandler';
import withClient, { ClientProps } from './withClient';
import Loading from './Loading';
import { renderRelease } from './Release';
import protoMapReplace from './util/protoMapReplace';

interface Props extends ErrorHandlerProps, ClientProps {
	appName: string;
	releaseName?: string;
	newRelease?: Release;
	newFormation?: Formation;
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
	private __streamAppReleaseCancel: () => void;

	constructor(props: Props) {
		super(props);

		const { newRelease } = props;

		this.state = {
			isLoading: true,
			isCreating: false,
			currentRelease: null,
			nextRelease: null,
			newRelease: newRelease || null
		};

		this.__streamAppReleaseCancel = () => {};
		this._handleNextReleaseSubmit = this._handleNextReleaseSubmit.bind(this);
		this._handleCancelBtnClick = this._handleCancelBtnClick.bind(this);
	}

	public componentDidMount() {
		this._isMounted = true;
		this._getData();
	}

	public componentDidUpdate(prevProps: Props) {
		const { newRelease } = this.props;
		if (prevProps.newRelease !== newRelease) {
			this.setState({
				newRelease: newRelease || null
			});
		}
	}

	public componentWillUnmount() {
		this._isMounted = false;
		this.__streamAppReleaseCancel();
	}

	public render() {
		const { isLoading, currentRelease, nextRelease, newRelease } = this.state;
		const { newFormation } = this.props;
		if (isLoading) return <Loading />;
		if (nextRelease) {
			return this._renderNextRelease(currentRelease, nextRelease, newFormation);
		}
		if (newRelease) {
			return this._renderNextRelease(currentRelease, newRelease, newFormation);
		}
		throw new Error('<CreateDeployment> Invalid state!');
	}

	private _renderNextRelease(currentRelease: Release | null, nextRelease: Release, newFormation?: Formation) {
		const { isCreating } = this.state;
		return (
			<form onSubmit={this._handleNextReleaseSubmit}>
				<h3>Review Changes</h3>
				{renderRelease(nextRelease, currentRelease)}
				{newFormation ? renderFormation(newFormation) : null}
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
		const { appName, releaseName, client, handleError } = this.props;
		this.setState({
			isLoading: true
		});

		this.__streamAppReleaseCancel();
		const p = releaseName ? client.getRelease(releaseName) : Promise.resolve(new Release());
		p.then((nextRelease: Release) => {
			this.__streamAppReleaseCancel = client.streamAppRelease(
				appName,
				(currentRelease: Release, error: Error | null) => {
					console.log({ currentRelease, error });
					const { newRelease } = this.state;
					const nextState = {
						isLoading: false,
						currentRelease
					} as State;
					if (releaseName) {
						nextState.nextRelease = nextRelease;
					} else if (newRelease) {
						nextState.newRelease = newRelease;
					} else {
						throw new Error('<CreateDeployment> requires either `releaseName` or `newRelease` props.');
					}
					this.setState(nextState);
				}
			);
		}).catch((error: Error) => {
			this.setState({
				isLoading: false
			});
			handleError(error);
		});
	}

	private _handleNextReleaseSubmit(e: React.SyntheticEvent) {
		e.preventDefault();
		if (!this._isMounted) return;
		const { handleError, onCreate, newFormation } = this.props;
		const { nextRelease, newRelease } = this.state;
		this.setState({
			isCreating: true
		});
		let p = Promise.resolve(null) as Promise<any>;
		if (newRelease) {
			p = this._createRelease(newRelease).then((release: Release) => {
				return this._createDeployment(release, newFormation);
			});
		} else if (nextRelease) {
			p = this._createDeployment(nextRelease, newFormation);
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

	private _createRelease(newRelease: Release) {
		const { client, appName } = this.props;
		return client.createRelease(appName, newRelease);
	}

	private _createDeployment(release: Release, formation?: Formation) {
		const { client, appName } = this.props;
		const { currentRelease } = this.state;
		let scaleRequest = null as CreateScaleRequest | null;
		if (formation) {
			scaleRequest = new CreateScaleRequest();
			protoMapReplace(scaleRequest.getProcessesMap(), formation.getProcessesMap());
			protoMapReplace(scaleRequest.getTagsMap(), formation.getTagsMap());
		}
		const createDeployment = scaleRequest
			? () => {
					return client.createDeploymentWithScale(appName, release.getName(), scaleRequest as CreateScaleRequest);
			  }
			: () => {
					return client.createDeployment(appName, release.getName());
			  };
		return createDeployment().then((deployment: Deployment) => {
			if (currentRelease) {
				return client.getApp(appName).then(() => {
					return deployment;
				});
			}
			return deployment;
		});
	}
}

function renderFormation(f: Formation): React.ReactNode {
	return (
		<Columns>
			{f
				.getProcessesMap()
				.toArray()
				.map(([k, v]: [string, number]) => {
					return (
						<Box key={k} align="center" separator="right">
							<Value value={v} label={k} size="small" />
						</Box>
					);
				})}
		</Columns>
	);
}

export default withErrorHandler(withClient(CreateDeployment));
