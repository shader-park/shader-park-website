module.exports = {
    pwa: {
        workboxOptions: {
            exclude: ['_redirects'],
        }
    },
    configureWebpack: {
        resolve: {
          mainFields: ['module', 'browser', 'main']
        }
    }
};