import React, { useEffect } from 'react';
import MyLayout from './layouts';
import Storage from '@/utils/storage';

function App() {
	useEffect(() => {
		getLanguage();
		JSON.parse(localStorage.getItem('personalization'))?.tabLogo &&
			change_icon(
				JSON.parse(localStorage.getItem('personalization'))?.tabLogo
			);
	}, []);

	return <MyLayout />;
}

function getLanguage() {
	const language = navigator.language || navigator.userLanguage;
	if (Storage.getLocal('language')) {
		Storage.setLocal(language.substring(0, 2));
	}
}

function change_icon(iconUrl) {
	const changeFavicon = (link) => {
		let $favicon = document.querySelector('link[rel="icon"]');
		if ($favicon !== null) {
			$favicon.href = link;
		} else {
			$favicon = document.createElement('link');
			$favicon.rel = 'icon';
			$favicon.href = link;
			document.head.appendChild($favicon);
		}
	};

	// 动态修改网站图标
	changeFavicon(iconUrl);
}

export default App;
