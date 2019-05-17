import { useContext, useMemo } from 'react';
import { __RouterContext, RouteComponentProps } from 'react-router-dom';

export default function useRouter<TParams = {}>() {
	const props = useContext(__RouterContext) as RouteComponentProps<TParams>;
	const urlParams = useMemo(
		() => {
			return new URLSearchParams(props.location.search);
		},
		[props.location.search]
	);
	return {
		urlParams,
		...props
	};
}
