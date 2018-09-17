import * as React from 'react';
import { default as client, Client } from './client';

export const ClientContext = React.createContext(client);

export interface ClientProps {
	client: Client;
}

export default function withClient<P extends ClientProps>(Component: React.ComponentType<P>) {
	return function ClientComponent(props: Pick<P, Exclude<keyof P, keyof ClientProps>>) {
		return <ClientContext.Consumer>{(client) => <Component {...props} client={client} />}</ClientContext.Consumer>;
	};
}
