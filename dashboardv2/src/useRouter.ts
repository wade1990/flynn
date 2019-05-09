import { useContext } from 'react';
import { __RouterContext, RouteComponentProps } from 'react-router-dom';

export default function useRouter<TParams = {}>() {
	return useContext(__RouterContext) as RouteComponentProps<TParams>;
}
