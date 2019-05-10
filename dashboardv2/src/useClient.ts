import { useContext } from 'react';
import { ClientContext } from './withClient';

export default function useClient() {
	return useContext(ClientContext);
}
