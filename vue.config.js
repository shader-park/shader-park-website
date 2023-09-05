module.exports = {
    publicPath: '/',
    pwa: {
      workboxOptions: {
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            // Use the NetworkFirst strategy for HTML files
            urlPattern: /index\.html/,
            handler: 'NetworkFirst',
            options: {
              networkTimeoutSeconds: 20,
              cacheName: 'html-cache',
            },
          },
          {
            // Use the CacheFirst strategy for other static assets
            urlPattern: /\.(?:js|css|png|jpg|jpeg|svg)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
              },
            },
          },
          {
            // Don't cache requests to Firebase or other real-time APIs
            urlPattern: /^https:\/\/(www\.)?firebaseio\.com/,
            handler: 'NetworkOnly',
          },
        ],
      },
    },
    configureWebpack: {
        resolve: {
          mainFields: ['module', 'browser', 'main']
        }
    }
};
