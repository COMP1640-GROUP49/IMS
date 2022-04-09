import http from 'http';
import https from 'https';
import { IFileData } from 'lib/interfaces';
import supabase from './supabase';

interface Options {
	department_name: string;
	topic_id: string;
}

export const getFileSizeFromUrl = async (url: string, options?: Options) => {
	const fileName = url.split('/').pop()?.split('?token')[0] as string;
	let fileSize: number;
	if (options) {
		const { data } = await supabase.storage
			.from('departments')
			.list(`${options.department_name}/topics/${options.topic_id}`);

		if (data && (data as []).length > 0) {
			const filterData = (data as []).filter((file: IFileData) => file.name.includes(fileName));
			fileSize = (filterData[0] as IFileData).metadata.size;
		}
	}

	return new Promise((res, rej) => {
		const req = url.startsWith('https://') ? https.get(url) : http.get(url);
		req.once('response', (r) => {
			req.destroy();
			const c = parseInt(r.headers['content-length'] as string);
			if (!isNaN(c)) {
				res(c);
			} else {
				if (fileSize) {
					res(fileSize);
				} else {
					rej("Couldn't get file size");
				}
			}
		});
		req.once('error', (e) => rej(e));
	});
};
