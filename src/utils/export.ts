import axios from 'axios';
import cache from '@/utils/storage';

export const exportFile = (
	url: string,
	params: any,
	name: string,
	type: string
) => {
	axios
		.post(url, params, {
			responseType: 'blob',
			headers: {
				userToken: cache.getLocal('token'),
				mwToken: cache.getSession('mwToken')
			}
		})
		.then((res) => {
			const blob = new Blob([res.data]);
			const eLink = document.createElement('a');
			eLink.download = name + type;
			eLink.href = URL.createObjectURL(blob);
			eLink.click();
		});
};
