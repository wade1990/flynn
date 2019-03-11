import { parseURLParams, urlParamsToString } from './urlParams';

it('parses empty search string', () => {
	const params = parseURLParams('');
	expect(params).toEqual({});
});

it('parses URL params from search string', () => {
	const search = '?foo=1&bar=2&baz=3&foo=4&bar=5';
	const params = parseURLParams(search);
	expect(params).toEqual({
		foo: ['1', '4'],
		bar: ['2', '5'],
		baz: ['3']
	});

	const search2 = search.slice(1); // without leading ?
	const params2 = parseURLParams(search2);
	expect(params2).toEqual({
		foo: ['1', '4'],
		bar: ['2', '5'],
		baz: ['3']
	});
});

it('parses whitelist of URL params from search string', () => {
	const search = '?foo=1&bar=2&baz=3&foo=4&bar=5';
	const params = parseURLParams(search, 'foo', 'baz');
	expect(params).toEqual({
		foo: ['1', '4'],
		baz: ['3']
	});

	const search2 = search.slice(1); // without leading ?
	const params2 = parseURLParams(search2, 'bar');
	expect(params2).toEqual({
		bar: ['2', '5']
	});
});

it('stringifies URL params', () => {
	const params = {
		foo: ['1', '4'],
		bar: ['2', '5'],
		baz: ['3']
	};
	const search = urlParamsToString(params);
	expect(search[0]).toEqual('?');
	expect(
		search
			.slice(1)
			.split('&')
			.sort()
			.join('&')
	).toEqual('bar=2&bar=5&baz=3&foo=1&foo=4');
});

it('stringifies empty URL params', () => {
	const params = {
		foo: []
	};
	const search = urlParamsToString(params);
	expect(search).toEqual('');
});
