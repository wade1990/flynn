import { grpc } from 'grpc-web-client';

import Config from './config'
import { ControllerClient } from './generated/controller_pb_service';

let transport = grpc.DefaultTransportFactory;

const client = new ControllerClient(Config.CONTROLLER_HOST, {
  transport
});
export default client
