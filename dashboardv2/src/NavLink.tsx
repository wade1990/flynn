import * as React from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Anchor, AnchorProps } from 'grommet';
import { Omit } from 'grommet/utils';

export interface Props extends Omit<AnchorProps, 'onClick'>, RouteComponentProps<{}> {
	path: string;
	search?: string;
	onClick?: (e: React.MouseEvent) => void;
	onNav?: (path: string) => void;
}

class NavAnchor extends React.Component<Props> {
	constructor(props: Props) {
		super(props);
		this._onClick = this._onClick.bind(this);
	}

	public render() {
		const {
			path,
			search,
			history,

			// filter out remaining Props
			onNav,

			// filter out remaining RouteComponentProps
			match,
			location,
			staticContext,

			...anchorProps
		} = this.props;
		const href = history.createHref({ pathname: path, search });
		return <Anchor {...anchorProps} href={href} onClick={this._onClick} />;
	}

	private _onClick(e: React.MouseEvent) {
		if (this.props.onClick) {
			this.props.onClick(e);
		}
		if (e.defaultPrevented) {
			// allow this.props.onClick to cancel this action via e.preventDefault()
			return;
		}
		if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
			// don't do anything if any modifier key is pressed
			// it's likely the user is trying to open the link in a new tab or window
			return;
		}
		const { path, search, history } = this.props;
		e.preventDefault();
		// TODO(jvatic): Handle both path and search containing query params
		history.push(path + search);
		if (this.props.onNav) {
			this.props.onNav(path);
		}
	}
}

export default withRouter(NavAnchor);
