import * as React from 'react';
import Client from './client';
import { ControllerClient } from './generated/controller_pb_service';

export const ClientContext = React.createContext(Client);

export interface ClientProps {
	client: ControllerClient;
}

export default function withClient<P extends ClientProps>(Component: React.ComponentType<P>) {
	return function ClientComponent(props: Pick<P, Exclude<keyof P, keyof ClientProps>>) {
		return <ClientContext.Consumer>{(client) => <Component {...props} client={client} />}</ClientContext.Consumer>;
	};
}
