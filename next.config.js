const withNextIntl = require('next-intl/plugin')(
  './i18n-intl/i18n.ts'
);



module.exports = withNextIntl((async () => {
  try{
    const  {initOpenNextCloudflareForDev} = await import('@opennextjs/cloudflare');
    initOpenNextCloudflareForDev();
    return {
      output: 'standalone',
      images: {
        domains: ['images.unsplash.com'],
      },
    };
  } catch (error) {
    console.error(error);
    return {
      output: 'standalone',
      images: {
        domains: ['images.unsplash.com'],
      },
    };
  }
}));