const gulp = require('gulp');
const babelify = require('babelify');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const shell = require('shelljs');

gulp.task('styles', () =>
	gulp
		.src('./scss/**/*.scss')
		.pipe(
			sass({
				outputStyle: 'compressed',
			}).on('error', sass.logError)
		)
		.pipe(gulp.dest('./css'))
		.pipe(browserSync.stream())
);

gulp.task('scripts:main', () => {
	browserify(['js/main.js', 'js/dbhelper.js', 'js/app.js', './sw.js'])
		.transform(
			babelify.configure({
				presets: ['env'],
			})
		)
		.bundle()
		.pipe(source('main_bundle.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init())
		.pipe(uglify())
		.pipe(sourcemaps.write('maps'))
		.pipe(gulp.dest('./bundle_js'));
});

gulp.task('scripts:restaurant', () => {
	browserify([
		'js/restaurant_info.js',
		'js/dbhelper.js',
		'js/app.js',
		'./sw.js',
	])
		.transform(
			babelify.configure({
				presets: ['env'],
			})
		)
		.bundle()
		.pipe(source('restaurant_bundle.js'))
		.pipe(buffer())
		.pipe(sourcemaps.init())
		.pipe(uglify())
		.pipe(sourcemaps.write('maps'))
		.pipe(gulp.dest('dist/js'))
		.pipe(gulp.dest('./bundle_js'));
});

gulp.task('eslint', () =>
	gulp
		.src(['js/**'])
		.pipe(eslint())
		.pipe(eslint.format())
);

gulp.task('watch', () => {
	gulp.watch(
		['./sw.js', './js/**/*.js'],
		['scripts:main', 'scripts:restaurant']
	);
});

gulp.task('serve', ['styles'], () => {
	browserSync.init({
		server: './',
		browser: 'google chrome',
	});

	gulp.watch('./sass/**/*.scss', ['styles']);
	gulp.watch('./**/**.html').on('change', browserSync.reload);
	gulp.watch('./bundle_js/**/*.js').on('change', browserSync.reload);
});

gulp.task('copy-files', () => {
	gulp
		.src(['./index.html', './restaurant.html', 'manifest.json'])
		.pipe(gulp.dest('./dist'));
});

gulp.task('grunt-image', () => {
	shell.exec('grunt');
});

gulp.task('dist', [
	'copy-files',
	'grunt-image',
	'styles',
	'scripts:main',
	'scripts:restaurant',
]);

gulp.task('default', [
	'grunt-image',
	'scripts:main',
	'scripts:restaurant',
	'watch',
	'serve',
]);
