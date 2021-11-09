import { resProps } from '@/types/comment';
export interface personalizationProps {
	backgroundImage: string | null;
	backgroundPath: string | null;
	copyrightNotice: string | null;
	homeLogo: string | null;
	homeLogoPath: string | null;
	id?: string | null;
	phone: string | null;
	loginLogo: string | null;
	loginLogoPath: string | null;
	status: string;
	slogan: string | null;
    title: string | null
	[propsName: string]: any;
}