import http from 'http';
import https from 'https';

export const getFileSizeFromUrl = (url: string) => {
	return new Promise((res, rej) => {
		const req = url.startsWith('https://') ? https.get(url) : http.get(url);
		req.once('response', (r) => {
			req.abort();
			const c = parseInt(r.headers['content-length'] as string);
			if (!isNaN(c)) res(c);
			else rej("Couldn't get file size");
		});
		req.once('error', (e) => rej(e));
	});
};
