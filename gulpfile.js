'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash'),
	defaultAssets = require('./config/assets/default'),
	prodAssets = require('./config/assets/production'),
	testAssets = require('./config/assets/test'),
	gulp = require('gulp'),
	// babel = require('gulp-babel'),
	gulpLoadPlugins = require('gulp-load-plugins'),
	runSequence = require('run-sequence'),
	plugins = gulpLoadPlugins({
		rename: {
			'gulp-angular-templatecache': 'templateCache'
		}
	}),
	path = require('path'),
	endOfLine = require('os')
	.EOL,
	protractor = require('gulp-protractor')
	.protractor,
	webdriver_update = require('gulp-protractor')
	.webdriver_update,
	webdriver_standalone = require('gulp-protractor')
	.webdriver_standalone,
	node = undefined,
	spawn = require('child_process')
	.spawn;

// Set NODE_ENV to 'test'
gulp.task('env:test', function (done) {
	process.env.NODE_ENV = 'test';
	done();
});

// Set NODE_ENV to 'development'
gulp.task('env:dev', function (done) {
	process.env.NODE_ENV = 'development';
	done();
});

// Set NODE_ENV to 'production'
gulp.task('env:prod', function (done) {
	process.env.NODE_ENV = 'production';
	done();
});

gulp.task('server', function (done) {
	if(node) node.kill();

	node = spawn('node', ['server.js'], { stdio: 'inherit' })
	node.on('close', function (code) {
		console.log(`Got code ${code}`);
		if(code === 8) {
			console.log('Error detected, waiting for changes...');
		}
	})
	done();
})

gulp.task('server-debug', function (done) {
	if(node) node.kill();

	node = spawn('node', ['--inspect=9229', '--inspect-brk', 'server.js'], { stdio: 'inherit' })
	node.on('close', function (code) {
		console.log(`Got code ${code}`);
		if(code === 8) {
			console.log('Error detected, waiting for changes...');
		}
	})
	done();
})

// Watch Files For Changes
gulp.task('watch', function (done) {
	// Start livereload
	plugins.livereload.listen();

	// Add watch rules
	gulp.watch(defaultAssets.server.views)
		.on('change', plugins.livereload.changed);
	gulp.watch(defaultAssets.server.allJS, gulp.series('eslint'))
		.on('change', plugins.livereload.changed);
	gulp.watch(defaultAssets.client.js, gulp.series('eslint'))
		.on('change', plugins.livereload.changed);
	gulp.watch(defaultAssets.client.css, gulp.series('csslint'))
		.on('change', plugins.livereload.changed);
	gulp.watch(defaultAssets.client.sass, gulp.series('sass', 'csslint'))
		.on('change', plugins.livereload.changed);
	gulp.watch(defaultAssets.client.less, gulp.series('less', 'csslint'))
		.on('change', plugins.livereload.changed);

	if(process.env.NODE_ENV === 'production') {
		gulp.watch(defaultAssets.server.gulpConfig, gulp.series('templatecache', 'eslint'));
		gulp.watch(defaultAssets.client.views, gulp.series('templatecache', 'eslint'))
			.on('change', plugins.livereload.changed);
	} else {
		gulp.watch(defaultAssets.server.gulpConfig, gulp.series('eslint'));
		gulp.watch(defaultAssets.client.views)
			.on('change', plugins.livereload.changed);

		gulp.watch(_.union(defaultAssets.server.views, defaultAssets.server.allJS, defaultAssets.server.config), gulp.series('server'))
	}
	done();
});

// CSS linting task
gulp.task('csslint', function (done) {
	return gulp.src(defaultAssets.client.css)
		.pipe(plugins.csslint('.csslintrc'))
		.pipe(plugins.csslint.reporter())
		.pipe(plugins.csslint.reporter(function (file) {
			if(!file.csslint.errorCount) {
				done();
			}
		}));
});

// JS linting task
gulp.task('jshint', function (done) {
	// var assets = _.union(
	//   defaultAssets.server.gulpConfig,
	//   defaultAssets.server.allJS,
	//   defaultAssets.client.js,
	//   testAssets.tests.server,
	//   testAssets.tests.client,
	//   testAssets.tests.e2e
	// );
	//
	// return gulp.src(assets)
	//   .pipe(plugins.jshint())
	//   .pipe(plugins.jshint.reporter('default'))
	//   .pipe(plugins.jshint.reporter('fail'));
	done()
});

// ESLint JS linting task
gulp.task('eslint', function () {
	var assets = _.union(
		defaultAssets.server.gulpConfig,
		defaultAssets.server.allJS,
		defaultAssets.client.js,
		testAssets.tests.server,
		testAssets.tests.client,
		testAssets.tests.e2e
	);

	return gulp.src(assets)
		.pipe(plugins.eslint())
		.pipe(plugins.eslint.format())
		.pipe(plugins.eslint.failOnError());
});

// JS minifying task
gulp.task('uglify', function () {
	var assets = _.union(
		defaultAssets.client.js,
		defaultAssets.client.templates
	);
	assets.push('node_modules/@babel/polyfill/dist/polyfill.js');
	return gulp.src(assets)
		.pipe(plugins.ngAnnotate())
		.pipe(plugins.babel({ presets: ['@babel/preset-env'] }))
		.pipe(plugins.uglify({
			mangle: false
		}))
		.pipe(plugins.concat('application.min.js'))
		.pipe(gulp.dest('public/dist'));
});

// CSS minifying task
gulp.task('cssmin', function () {
	return gulp.src(defaultAssets.client.css)
		.pipe(plugins.cssmin())
		.pipe(plugins.concat('application.min.css'))
		.pipe(gulp.dest('public/dist'));
});

// Sass task
gulp.task('sass', function () {
	return gulp.src(defaultAssets.client.sass)
		.pipe(plugins.sass())
		.pipe(plugins.autoprefixer())
		.pipe(plugins.rename(function (file) {
			file.dirname = file.dirname.replace(path.sep + 'scss', path.sep + 'css');
		}))
		.pipe(gulp.dest('./modules/'));
});

// Less task
gulp.task('less', function () {
	return gulp.src(defaultAssets.client.less)
		.pipe(plugins.less())
		.pipe(plugins.autoprefixer())
		.pipe(plugins.rename(function (file) {
			file.dirname = file.dirname.replace(path.sep + 'less', path.sep + 'css');
		}))
		.pipe(gulp.dest('./modules/'));
});

// Angular template cache task
gulp.task('templatecache', function () {
	return gulp.src(defaultAssets.client.views)
		.pipe(plugins.templateCache('templates.js', {
			root: 'modules/',
			module: 'core',
			templateHeader: '(function () {' + endOfLine + '	\'use strict\';' + endOfLine + endOfLine + '	angular' + endOfLine + '		.module(\'<%= module %>\'<%= standalone %>)' + endOfLine + '		.run(templates);' + endOfLine + endOfLine + '	templates.$inject = [\'$templateCache\'];' + endOfLine + endOfLine + '	function templates($templateCache) {' + endOfLine,
			templateBody: '		$templateCache.put(\'<%= url %>\', \'<%= contents %>\');',
			templateFooter: '	}' + endOfLine + '})();' + endOfLine
		}))
		.pipe(gulp.dest('build'));
});

// Mocha tests task
gulp.task('mocha', function (done) {
	// Open mongoose connections
	var mongoose = require('./config/lib/mongoose.js');
	var error;

	// Connect mongoose
	mongoose.connect(function () {
		mongoose.loadModels();
		// Run the tests
		gulp.src(testAssets.tests.server)
			.pipe(plugins.mocha({
				reporter: 'spec',
				timeout: 10000
			}))
			.on('error', function (err) {
				// If an error occurs, save it
				error = err;
			})
			.on('end', function () {
				// When the tests are done, disconnect mongoose and pass the error state back to gulp
				mongoose.disconnect(function () {
					done(error);
				});
			});
	});

});

// Karma test runner task
gulp.task('karma', function (done) {
	return gulp.src([])
		.pipe(plugins.karma({
			configFile: 'karma.conf.js',
			action: 'run',
			singleRun: true
		}));
});

// Drops the MongoDB database, used in e2e testing
gulp.task('dropdb', function (done) {
	// Use mongoose configuration
	var mongoose = require('./config/lib/mongoose.js');

	mongoose.connect(function (db) {
		db.connection.db.dropDatabase(function (err) {
			if(err) {
				console.log(err);
			} else {
				console.log('Successfully dropped db: ', db.connection.db.databaseName);
			}
			db.connection.db.close(done);
		});
	});
});

// Downloads the selenium webdriver
gulp.task('webdriver_update', webdriver_update);

// Start the standalone selenium server
// NOTE: This is not needed if you reference the
// seleniumServerJar in your protractor.conf.js
gulp.task('webdriver_standalone', webdriver_standalone);

// Protractor test runner task
gulp.task('protractor', gulp.series('webdriver_update', function () {
	gulp.src([])
		.pipe(protractor({
			configFile: 'protractor.conf.js'
		}))
		.on('end', function () {
			console.log('E2E Testing complete');
			// exit with success.
			process.exit(0);
		})
		.on('error', function (err) {
			console.log('E2E Tests failed');
			process.exit(1);
		});
}));

gulp.task('concatLib', function () {
	return gulp.src(prodAssets.client.lib.individualJs)
		.pipe(plugins.concat('lib.min.js'))
		.pipe(gulp.dest('public/dist'));
});

// Lint CSS and JavaScript files.
// runSequence('less', 'sass', ['csslint', 'eslint', 'jshint'], done);
gulp.task('lint', gulp.series(
	'sass',
	gulp.parallel('csslint', 'eslint', 'jshint')
));

// Lint project files and minify them into two production files.
// runSequence('env:dev', 'templatecache', 'lint', ['uglify', 'cssmin'], 'concatLib', done);
gulp.task('build', gulp.series(
	'env:dev',
	'templatecache',
	'lint',
	gulp.parallel('uglify', 'cssmin'),
	'concatLib'
));

// Run the project tests
// runSequence('env:test', 'lint', 'mocha', 'karma', 'server', 'protractor', done);
gulp.task('test', gulp.series(
	'env:test',
	'lint',
	'mocha',
	'karma',
	'server',
	'protractor'
));

// runSequence('env:test', 'lint', 'mocha', done);
gulp.task('test:server', gulp.series(
	'env:test',
	'lint',
	'mocha'
));

// runSequence('env:test', 'lint', 'karma', done);
gulp.task('test:client', gulp.series(
	'env:test',
	'lint',
	'karma'
));

// runSequence('env:test', 'lint', 'dropdb', 'server', 'protractor', done);
gulp.task('test:e2e', gulp.series(
	'env:test',
	'lint',
	'dropdb',
	'server',
	'protractor'
));

// Run the project in development mode
gulp.task('default', gulp.series(
	'env:dev',
	'lint',
	gulp.parallel('server', 'watch')
));

// Run the project in debug mode
// runSequence('env:dev', 'lint', ['server', 'watch'], done);
gulp.task('debug', gulp.series(
	'env:dev',
	'lint',
	gulp.parallel('server-debug', 'watch')
));

// Run the project in production mode
// runSequence('templatecache', 'build', 'env:prod', 'lint', ['server', 'watch'], done);
gulp.task('prod', gulp.series(
	'templatecache',
	'build',
	'env:prod',
	'lint',
	gulp.parallel('server', 'watch')
));
