({
    appDir: "./",
    baseUrl: "./",
    dir: "../release",
    paths: {
		jquery: 'libs/jquery/jquery-1.10.2',
		underscore: 'libs/underscore/underscore-min',
		backbone: 'libs/backbone/backbone-min',
		text: 'libs/require/text',
		storage: 'libs/backbone/backbone.localStorage',           
    },
    optimize: "uglify",
    modules: [
        {
            name: "app",
            exclude: [
                // If you prefer not to include certain libs exclude them here
            ]
        }
    ]
})