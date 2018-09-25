export type URLParams = { [key: string]: string[] };

function trimPrefix(str: string, prefix: string): string {
	if (str.startsWith(prefix)) {
		return str.slice(prefix.length);
	}
	return str;
}

export function parseURLParams(search: string): URLParams {
	let params: URLParams = {};
	const pairs = trimPrefix(search, '?').split('&');
	for (let i = 0; i < pairs.length; i++) {
		const [k, v] = pairs[i].split('=').map((str) => decodeURIComponent(str));
		if (k && v) {
			params[k] = (params[k] || []).concat(v);
		}
	}
	return params;
}

export function urlParamsToString(params: URLParams): string {
	let pairs: Array<string> = [];
	Object.keys(params).forEach((k) => {
		params[k].forEach((v) => {
			pairs.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
		});
	});
	if (pairs.length === 0) {
		return '';
	}
	return '?' + pairs.join('&');
}
