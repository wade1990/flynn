// import styles
import 'grommet/scss/aruba/index.scss';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Dashboard from './Dashboard';
import './index.css';
import { unregister } from './registerServiceWorker';

ReactDOM.render(<Dashboard />, document.getElementById('root') as HTMLElement);
unregister();
