import { cache } from 'hono/cache'
type Style = 'normal' | 'italic';
type Weight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;


export async function googleFont(
	text: string,
	font: string,
	weight: Weight = 400,
	style: Style = 'normal'
): Promise<{ data: ArrayBuffer; name: string; style: Style; weight: Weight }> {
	const fontFamilyFetchName = font.replace(/ /g, '+');
	const API = `https://fonts.googleapis.com/css2?family=${fontFamilyFetchName}:ital,wght@${
		style === 'italic' ? '1' : '0'
	},${weight}&text=${encodeURIComponent(text)}`;

	const css = await (
		await fetch(API, {
			headers: {
				'User-Agent':
					'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1',
			},
		})
	).text();
	// console.log(API, css);
	const resource = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/);
	// console.log('resource', resource);
	if (!resource) {
		throw new Error('Failed to fetch font');
	}

	const res = await fetch(resource[1]);
	const data = await res.arrayBuffer();

	return {
		data,
		name: font,
		style,
		weight: weight as Weight,
	};
}
