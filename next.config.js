const withNextIntl = require('next-intl/plugin')(
  './i18n-intl/i18n.ts'
);



module.exports = withNextIntl((async () => {
  if (process.env.NODE_ENV === 'development') {
    try {
      const { initOpenNextCloudflareForDev } = await import('@opennextjs/cloudflare');
      initOpenNextCloudflareForDev();
    } catch (error) {
      console.error(error);
    }
  }
  
  return {
    output: 'standalone',
    images: {
      domains: ['images.unsplash.com'],
    },
  };
})());