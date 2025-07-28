import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'ja', 'zh-CN', 'zh-TW', 'ko', 'fr'],
  defaultLocale: 'ja'
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|auth|.*\\..*).*)']
};