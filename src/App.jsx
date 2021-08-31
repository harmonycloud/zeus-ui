import React, { useEffect } from 'react';
import Layout from './layouts/index';
import Storage from '@/utils/storage';

function App() {
	useEffect(() => {
		getLanguage();
		return () => {};
	}, []);

	return <Layout />;
}

function getLanguage() {
	const language = navigator.language || navigator.userLanguage;
	if (Storage.getLocal('language')) {
		Storage.setLocal(language.substring(0, 2));
	}
}

export default App;
