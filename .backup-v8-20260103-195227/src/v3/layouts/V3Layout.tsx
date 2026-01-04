import React from 'react';
import { Outlet } from 'react-router-dom';
import V3Header from '../components/V3Header';
import V3Footer from '../components/V3Footer';
import { I18nextProvider } from 'react-i18next';
import i18nV3 from '../i18n';

const V3Layout = () => {
	return (
		<I18nextProvider i18n={i18nV3}>
			<div className="min-h-screen flex flex-col">
				<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />
				<V3Header />
				<main className="flex-1 pt-16">
					<Outlet />
				</main>
				<V3Footer />
			</div>
		</I18nextProvider>
	);
};

export default V3Layout; 