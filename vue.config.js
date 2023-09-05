module.exports = {
    pwa: {
        workboxOptions: {
            exclude: ['_redirects'],
            skipWaiting: true,
            clientsClaim: true,
        }
    },
    configureWebpack: {
        resolve: {
          mainFields: ['module', 'browser', 'main']
        }
    }
};