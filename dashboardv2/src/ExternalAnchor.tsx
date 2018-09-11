import * as React from 'react';

import Anchor from 'grommet/components/Anchor';

export interface Props {
  a11yTitle?: string;
  align?: 'start' | 'center' | 'end';
  animateIcon?: boolean;
  disabled?: boolean;
  href?: string;
  icon?: React.ReactNode | JSX.Element;
  id?: string;
  label?: string;
  method?: 'push' | 'replace';
  onClick?: Function;
  path?: string;
  primary?: boolean;
  reverse?: boolean;
  tag?: string;
  target?: string;
}

class ExternalAnchor extends React.Component<Props> {
  constructor(props: Props) {
    super(props)
    this._clickHandler = this._clickHandler.bind(this)
  }

  public render() {
    return (
      <Anchor {...this.props} onClick={this._clickHandler} />
    );
  }

  private _clickHandler(e: React.MouseEvent) {
    const defaultOnClick = this.props.onClick || (() => {})

    defaultOnClick(e)

    if (e.isPropagationStopped()) {
      return
    }

    // don't open in new window if any modifier keys are pressed
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
      return
    }

    e.preventDefault()
    window.open(this.props.href)
  }
}

export default ExternalAnchor;
