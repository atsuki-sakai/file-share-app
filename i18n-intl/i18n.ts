import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
 
const locales = ['en', 'ja'];
 
export default getRequestConfig(async ({requestLocale}) => {
  const locale = await requestLocale;
  
  if (!locale || !locales.includes(locale)) notFound();
 
  return {
    locale,
    messages: (await import(`./languages/${locale}.json`)).default
  };
});