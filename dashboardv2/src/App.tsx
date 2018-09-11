import * as React from 'react';

import App from 'grommet/components/App';
import Split from 'grommet/components/Split';
import Sidebar from 'grommet/components/Sidebar';
import Box from 'grommet/components/Box';
import Header from 'grommet/components/Header';
import Footer from 'grommet/components/Footer';
import Title from 'grommet/components/Title';
import Paragraph from 'grommet/components/Paragraph';

import ExternalAnchor from './ExternalAnchor';

class Dashboard extends React.Component {
  public render() {
    return (
      <App centered={false}>
        <Split flex="right">
          <Sidebar colorIndex="neutral-1">
            <Header pad="medium" justify="between">
              <Title>
                Flynn Dashboard
              </Title>
            </Header>
            <Box flex="grow" justify="start">
            </Box>
            <Footer appCentered={true} direction="column" pad="small" colorIndex="grey-1">
              <Paragraph size="small">
                Flynn is designed, built, and managed by Prime Directive, Inc.<br />
                &copy; 2013-{(new Date()).getFullYear()} Prime Directive, Inc. Flynn® is a trademark of Prime Directive, Inc.
              </Paragraph>
              <Paragraph size="small">
                <ExternalAnchor href="https://flynn.io/legal/privacy">
                  Privacy Policy
                </ExternalAnchor>
                &nbsp;|&nbsp;
                <ExternalAnchor href="https://flynn.io/docs/trademark-guidelines">
                  Trademark Guidelines
                </ExternalAnchor>
              </Paragraph>
            </Footer>
          </Sidebar>

          <Box pad="medium">
          </Box>
        </Split>
      </App>
    );
  }
}

export default Dashboard;
