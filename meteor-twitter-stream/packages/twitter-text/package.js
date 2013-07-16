// file: package.js
Npm.depends({
    'twitter-text': '1.6.1'
});

Package.on_use(function(api) {
    api.add_files('twitter-text.js', 'server');
});