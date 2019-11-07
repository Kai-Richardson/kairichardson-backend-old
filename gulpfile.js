var gulp = require('gulp');
var del = require('del');
var runSequence = require('run-sequence');
var sass = require('gulp-sass');
var cssnano = require('gulp-cssnano');
var imagemin = require('gulp-imagemin');
var cache = require('gulp-cache');
var useref = require('gulp-useref')
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var browserSync = require('browser-sync').create();
var realFavicon = require ('gulp-real-favicon');
var fs = require('fs');
var convertNewline = require('gulp-convert-newline');


gulp.task('build', function (callback) {
	runSequence('clean:dist',
		'images',
		['sass', 'fonts', 'copy'],
		'useref',
		'inject-favicon-markups',
		'lineEndings',
		callback
	)
})

gulp.task('default', function (callback) {
	runSequence(['sass','browserSync', 'watch'],
		callback
	)
})

gulp.task('lineEndings', function() {
	return gulp.src('dist/index.html')
	.pipe(convertNewline())
	.pipe(gulp.dest("dist/"));
});

gulp.task('clean:dist', function() {
	return del.sync(['dist/**', '!dist']);
});

gulp.task('watch',['browserSync', 'sass'], function() {
	gulp.watch('app/scss/**/*.+(scss|sass)', ['sass'])
	//Let's check HTML and JS files as well.
	gulp.watch('app/*.html', browserSync.reload);
	gulp.watch('app/js/**/*.js', browserSync.reload);
});

gulp.task('sass', function() {
	return gulp.src('app/scss/**/*.+(scss|sass)')
	.pipe(sass())
	.pipe(gulp.dest('app/css'))
	.pipe(browserSync.reload({
		stream: true,
		browser: "firefox.exe"
	}))
});

gulp.task('images', function(){
	return gulp.src(['app/img/**/*.+(png|jpg|gif|svg)'])
	.pipe(cache(imagemin()))
	.pipe(gulp.dest('dist/img'))
});

gulp.task('fonts', function() {
	return gulp.src('app/fonts/**/*')
	.pipe(gulp.dest('dist/fonts'))
})

gulp.task('useref', function() {
	return gulp.src('app/*.html')
	.pipe(useref())
	.pipe(gulpIf('*.js', uglify()))
	.pipe(gulpIf('*.css', cssnano()))
	.pipe(gulp.dest('dist'))
});

gulp.task('copy', function () {
	gulp.src('app/CNAME')
			.pipe(gulp.dest('dist'));
	gulp.src('app/LICENSE')
			.pipe(gulp.dest('dist'));
	gulp.src('app/robots.txt')
			.pipe(gulp.dest('dist'));
	gulp.src('app/README.md')
			.pipe(gulp.dest('dist'));
	gulp.src('app/assets/**/*')
			.pipe(gulp.dest('dist/assets'));
});

gulp.task('browserSync', function() {
	browserSync.init({
		server: {
			baseDir: 'app'
		},
	})
});


// File where the favicon markups are stored
var FAVICON_DATA_FILE = 'faviconData.json';

// Generate the icons. This task takes a few seconds to complete.
// You should run it at least once to create the icons. Then,
// you should run it whenever RealFaviconGenerator updates its
// package (see the check-for-favicon-update task below).
gulp.task('generate-favicon', function(done) {
	realFavicon.generateFavicon({
		masterPicture: 'app/img/logo.svg',
		dest: 'dist/img',
		iconsPath: 'img/',
		design: {
			ios: {
				pictureAspect: 'noChange',
				assets: {
					ios6AndPriorIcons: false,
					ios7AndLaterIcons: true,
					precomposedIcons: false,
					declareOnlyDefaultIcon: true
				}
			},
			desktopBrowser: {},
			windows: {
				masterPicture: {
					type: 'inline',
					content: 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxOS4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjxzdmcgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCINCgkgdmlld0JveD0iMCAwIDQ4NC4wOCA0ODQuMDgiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDQ4NC4wOCA0ODQuMDgiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPGcgaWQ9IkxheWVyXzMiPg0KCTxnIGlkPSJYTUxJRF82XyI+DQoJCTxkZWZzPg0KCQkJPGNpcmNsZSBpZD0iWE1MSURfNV8iIGN4PSIyNDIuMDQiIGN5PSIyNDIuMDQiIHI9IjI0Mi4wNCIvPg0KCQk8L2RlZnM+DQoJCTxjbGlwUGF0aCBpZD0iWE1MSURfMTZfIj4NCgkJCTx1c2UgeGxpbms6aHJlZj0iI1hNTElEXzVfIiAgb3ZlcmZsb3c9InZpc2libGUiLz4NCgkJPC9jbGlwUGF0aD4NCgkJPHBhdGggaWQ9IlhNTElEXzJfIiBjbGlwLXBhdGg9InVybCgjWE1MSURfMTZfKSIgZmlsbD0iI0ZGNDEzNiIgZD0iTTEyLDBoNDYwLjA4YzYuNiwwLDEyLDUuNCwxMiwxMnY0NjAuMDhjMCw2LjYtNS40LDEyLTEyLDEySDEyDQoJCQljLTYuNiwwLTEyLTUuNC0xMi0xMlYxMkMwLDUuNCw1LjQsMCwxMiwweiIvPg0KCTwvZz4NCjwvZz4NCjxnIGlkPSJMYXllcl8xIj4NCgk8ZyBpZD0iWE1MSURfMV8iPg0KCQk8cGF0aCBpZD0iWE1MSURfMjVfIiBmaWxsPSIjRjFGRkVCIiBkPSJNMjE4Ljg2NzMsMjQ0LjIwNDNjLTIuMDg3OS0wLjAxMzctMi4wODc5LTAuMjM5OS0xLjAyMTMsMS4wODUyDQoJCQljNDEuNTY1NSw0OS44ODMzLDg1Ljc5OTUsMTAyLjk4NiwxMjcuNDI1NiwxNTIuODE4N2MyLjIxMTcsMi42NDc3LDMuOTgxOCw2LjM4NzgsNy45NzEyLDYuNDIzOA0KCQkJYzE3LjkyMDksMC4xNjIsMzUuODQ0MSwwLjA3NSw1Ni4wODk2LDAuMDcyMmMwLjM4MzUtMC4wMDAxLDAuNTk5MS0wLjQ0OTYsMC4zNjI4LTAuNzUxNw0KCQkJYy00LjE4NzgtNS4zNTU5LTYuNjUxMS04LjY3MDYtOS4zMDEyLTExLjgyODRjLTI1Ljg0MDUtMzAuNzktNTEuNzI4OS02MS41Mzk5LTc3LjU3NTItOTIuMzI0OQ0KCQkJYy05Ljk4NzUtMTEuODk1OS05LjkwOTYtMTEuNzg4NSw0LjU0MzQtMTYuNjA3MmM0MS4yMTQ3LTEzLjc0MTMsNjQuNTM1NC00Mi44ODUxLDY4LjQ5MzMtODUuNTEzMw0KCQkJYzMuODkzMS00MS45Mjk2LTExLjY5ODgtNzUuOTc3OS00OC4wMjQ2LTk5LjQxNDVjLTguMjcyOS01LjMzNzUtMTMuMzQ4MS00LjY1NjgtMTkuNDk0NCwzLjczNDgNCgkJCWMtNC45NDk3LDYuNzU3OS05Ljk4NzIsMTMuNDQxMy0xNS4zOTQ5LDE5Ljg4NzRjLTUuNDI2LDYuNDY4LTcuMTgzNyw5Ljk4NzgsMS4xNDg1LDEzLjM2MjkNCgkJCWMxNS40Mzk0LDYuMjU0LDI3Ljg3MDMsMTguNDgyNywzMi45NzkxLDM0LjMzOGMxMi4xMjIxLDM3LjYyMTUtMTIuNjQ2Miw3Mi44MDc5LTUzLjg5NDMsNzQuNTMzNQ0KCQkJQzI2OC4yNjUxLDI0My44Njc0LDI0NC43MDAyLDI0NC4yMDQzLDIxOC44NjczLDI0NC4yMDQzeiIvPg0KCQk8cGF0aCBpZD0iWE1MSURfMjRfIiBmaWxsPSIjRjFGRkVCIiBkPSJNMjk0Ljc5MjgsNzkuOTc3N2MtMTkuMjcyOSwwLTM1LjA3NjcsMC4yODIzLTUwLjg2MjMtMC4xMzA0DQoJCQljLTYuOTEzOS0wLjE4MDgtMTEuNDAwOSwyLjM4NjYtMTUuNjQ5MSw3LjY2NzdjLTM5LjU1ODcsNDkuMTc3Ny03OS4yNDQsOTguMjU0Ni0xMTkuMTYxLDE0Ny4xNDE1DQoJCQljLTQuNjQ1NSw1LjY4OTQtNS42NjU5LDkuMzYxOS0wLjUxMTEsMTUuNjQ5MWM0MC4yOTUzLDQ5LjE0NjcsODAuMTczOCw5OC42MzUxLDEyMC4xOTI5LDE0OC4wMDgyDQoJCQljMi40NzIxLDMuMDQ5OSw0LjU3MTYsNi44NDkyLDkuMTY1LDYuODcxOWMxNy44MzYyLDAuMDg3OSwzNS42NzI5LDAuMDM1OCw1NS43NzExLDAuMDM1OA0KCQkJYy00LjcxNTUtNi4xMDMyLTcuNTc5Ny05Ljk1NDQtMTAuNTkxNS0xMy42ODY0Yy0zNy42OTYtNDYuNzEwMi03NS4yNjU4LTkzLjUyNC0xMTMuMjg3OC0xMzkuOTY3NQ0KCQkJYy01LjU3MjYtNi44MDY4LTUuNjExNi0xMS4wODI1LDAuMDY0Mi0xNy43NDRjMTYuMDI0Ni0xOC44MDc2LDMxLjI5MjItMzguMjYwNCw0Ni44NDY4LTU3LjQ2ODINCgkJCUMyNDIuMDE1LDE0NS4xODEzLDI2Ny4yNTA5LDExMy45OTk4LDI5NC43OTI4LDc5Ljk3Nzd6Ii8+DQoJCTxnIGlkPSJYTUxJRF80XyI+DQoJCQk8cGF0aCBpZD0iWE1MSURfMzNfIiBmaWxsPSIjRjFGRkVCIiBkPSJNOTQuODczNyw3OC44NDMyaDMwLjU0MDdjOC44LDAsMTYsNy4yLDE2LDE2djMwOS43ODUyIi8+DQoJCTwvZz4NCgkJPGcgaWQ9IlhNTElEXzNfIj4NCgkJCTxwYXRoIGlkPSJYTUxJRF8zNF8iIGZpbGw9IiNGMUZGRUIiIGQ9Ik0xNDEuNDE0NSw0MDQuNjI4NGgtMzAuNTQwN2MtOC44LDAtMTYtNy4yLTE2LTE2Vjc4Ljg0MzIiLz4NCgkJPC9nPg0KCTwvZz4NCjwvZz4NCjwvc3ZnPg0K'
				},
				pictureAspect: 'noChange',
				backgroundColor: '#2b5797',
				onConflict: 'override',
				assets: {
					windows80Ie10Tile: false,
					windows10Ie11EdgeTiles: {
						small: false,
						medium: true,
						big: false,
						rectangle: false
					}
				}
			},
			androidChrome: {
				masterPicture: {
					type: 'inline',
					content: 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxOS4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjxzdmcgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCINCgkgdmlld0JveD0iMCAwIDQ4NC4wOCA0ODQuMDgiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDQ4NC4wOCA0ODQuMDgiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPGcgaWQ9IkxheWVyXzMiPg0KCTxnIGlkPSJYTUxJRF82XyI+DQoJCTxkZWZzPg0KCQkJPGNpcmNsZSBpZD0iWE1MSURfNV8iIGN4PSIyNDIuMDQiIGN5PSIyNDIuMDQiIHI9IjI0Mi4wNCIvPg0KCQk8L2RlZnM+DQoJCTxjbGlwUGF0aCBpZD0iWE1MSURfMTZfIj4NCgkJCTx1c2UgeGxpbms6aHJlZj0iI1hNTElEXzVfIiAgb3ZlcmZsb3c9InZpc2libGUiLz4NCgkJPC9jbGlwUGF0aD4NCgkJPHBhdGggaWQ9IlhNTElEXzJfIiBjbGlwLXBhdGg9InVybCgjWE1MSURfMTZfKSIgZmlsbD0iI0ZGNDEzNiIgZD0iTTEyLDBoNDYwLjA4YzYuNiwwLDEyLDUuNCwxMiwxMnY0NjAuMDhjMCw2LjYtNS40LDEyLTEyLDEySDEyDQoJCQljLTYuNiwwLTEyLTUuNC0xMi0xMlYxMkMwLDUuNCw1LjQsMCwxMiwweiIvPg0KCTwvZz4NCjwvZz4NCjxnIGlkPSJMYXllcl8xIj4NCgk8ZyBpZD0iWE1MSURfMV8iPg0KCQk8cGF0aCBpZD0iWE1MSURfMjVfIiBmaWxsPSIjRjFGRkVCIiBkPSJNMjE4Ljg2NzMsMjQ0LjIwNDNjLTIuMDg3OS0wLjAxMzctMi4wODc5LTAuMjM5OS0xLjAyMTMsMS4wODUyDQoJCQljNDEuNTY1NSw0OS44ODMzLDg1Ljc5OTUsMTAyLjk4NiwxMjcuNDI1NiwxNTIuODE4N2MyLjIxMTcsMi42NDc3LDMuOTgxOCw2LjM4NzgsNy45NzEyLDYuNDIzOA0KCQkJYzE3LjkyMDksMC4xNjIsMzUuODQ0MSwwLjA3NSw1Ni4wODk2LDAuMDcyMmMwLjM4MzUtMC4wMDAxLDAuNTk5MS0wLjQ0OTYsMC4zNjI4LTAuNzUxNw0KCQkJYy00LjE4NzgtNS4zNTU5LTYuNjUxMS04LjY3MDYtOS4zMDEyLTExLjgyODRjLTI1Ljg0MDUtMzAuNzktNTEuNzI4OS02MS41Mzk5LTc3LjU3NTItOTIuMzI0OQ0KCQkJYy05Ljk4NzUtMTEuODk1OS05LjkwOTYtMTEuNzg4NSw0LjU0MzQtMTYuNjA3MmM0MS4yMTQ3LTEzLjc0MTMsNjQuNTM1NC00Mi44ODUxLDY4LjQ5MzMtODUuNTEzMw0KCQkJYzMuODkzMS00MS45Mjk2LTExLjY5ODgtNzUuOTc3OS00OC4wMjQ2LTk5LjQxNDVjLTguMjcyOS01LjMzNzUtMTMuMzQ4MS00LjY1NjgtMTkuNDk0NCwzLjczNDgNCgkJCWMtNC45NDk3LDYuNzU3OS05Ljk4NzIsMTMuNDQxMy0xNS4zOTQ5LDE5Ljg4NzRjLTUuNDI2LDYuNDY4LTcuMTgzNyw5Ljk4NzgsMS4xNDg1LDEzLjM2MjkNCgkJCWMxNS40Mzk0LDYuMjU0LDI3Ljg3MDMsMTguNDgyNywzMi45NzkxLDM0LjMzOGMxMi4xMjIxLDM3LjYyMTUtMTIuNjQ2Miw3Mi44MDc5LTUzLjg5NDMsNzQuNTMzNQ0KCQkJQzI2OC4yNjUxLDI0My44Njc0LDI0NC43MDAyLDI0NC4yMDQzLDIxOC44NjczLDI0NC4yMDQzeiIvPg0KCQk8cGF0aCBpZD0iWE1MSURfMjRfIiBmaWxsPSIjRjFGRkVCIiBkPSJNMjk0Ljc5MjgsNzkuOTc3N2MtMTkuMjcyOSwwLTM1LjA3NjcsMC4yODIzLTUwLjg2MjMtMC4xMzA0DQoJCQljLTYuOTEzOS0wLjE4MDgtMTEuNDAwOSwyLjM4NjYtMTUuNjQ5MSw3LjY2NzdjLTM5LjU1ODcsNDkuMTc3Ny03OS4yNDQsOTguMjU0Ni0xMTkuMTYxLDE0Ny4xNDE1DQoJCQljLTQuNjQ1NSw1LjY4OTQtNS42NjU5LDkuMzYxOS0wLjUxMTEsMTUuNjQ5MWM0MC4yOTUzLDQ5LjE0NjcsODAuMTczOCw5OC42MzUxLDEyMC4xOTI5LDE0OC4wMDgyDQoJCQljMi40NzIxLDMuMDQ5OSw0LjU3MTYsNi44NDkyLDkuMTY1LDYuODcxOWMxNy44MzYyLDAuMDg3OSwzNS42NzI5LDAuMDM1OCw1NS43NzExLDAuMDM1OA0KCQkJYy00LjcxNTUtNi4xMDMyLTcuNTc5Ny05Ljk1NDQtMTAuNTkxNS0xMy42ODY0Yy0zNy42OTYtNDYuNzEwMi03NS4yNjU4LTkzLjUyNC0xMTMuMjg3OC0xMzkuOTY3NQ0KCQkJYy01LjU3MjYtNi44MDY4LTUuNjExNi0xMS4wODI1LDAuMDY0Mi0xNy43NDRjMTYuMDI0Ni0xOC44MDc2LDMxLjI5MjItMzguMjYwNCw0Ni44NDY4LTU3LjQ2ODINCgkJCUMyNDIuMDE1LDE0NS4xODEzLDI2Ny4yNTA5LDExMy45OTk4LDI5NC43OTI4LDc5Ljk3Nzd6Ii8+DQoJCTxnIGlkPSJYTUxJRF80XyI+DQoJCQk8cGF0aCBpZD0iWE1MSURfMzNfIiBmaWxsPSIjRjFGRkVCIiBkPSJNOTQuODczNyw3OC44NDMyaDMwLjU0MDdjOC44LDAsMTYsNy4yLDE2LDE2djMwOS43ODUyIi8+DQoJCTwvZz4NCgkJPGcgaWQ9IlhNTElEXzNfIj4NCgkJCTxwYXRoIGlkPSJYTUxJRF8zNF8iIGZpbGw9IiNGMUZGRUIiIGQ9Ik0xNDEuNDE0NSw0MDQuNjI4NGgtMzAuNTQwN2MtOC44LDAtMTYtNy4yLTE2LTE2Vjc4Ljg0MzIiLz4NCgkJPC9nPg0KCTwvZz4NCjwvZz4NCjwvc3ZnPg0K'
				},
				pictureAspect: 'noChange',
				themeColor: '#ffffff',
				manifest: {
					display: 'standalone',
					orientation: 'notSet',
					onConflict: 'override',
					declared: true
				},
				assets: {
					legacyIcon: false,
					lowResolutionIcons: false
				}
			},
			safariPinnedTab: {
				masterPicture: {
					type: 'inline',
					content: 'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxOS4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjxzdmcgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCINCgkgdmlld0JveD0iMCAwIDQ4NC4wOCA0ODQuMDgiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDQ4NC4wOCA0ODQuMDgiIHhtbDpzcGFjZT0icHJlc2VydmUiPg0KPGcgaWQ9IkxheWVyXzMiPg0KCTxnIGlkPSJYTUxJRF82XyI+DQoJCTxkZWZzPg0KCQkJPGNpcmNsZSBpZD0iWE1MSURfNV8iIGN4PSIyNDIuMDQiIGN5PSIyNDIuMDQiIHI9IjI0Mi4wNCIvPg0KCQk8L2RlZnM+DQoJCTxjbGlwUGF0aCBpZD0iWE1MSURfMTZfIj4NCgkJCTx1c2UgeGxpbms6aHJlZj0iI1hNTElEXzVfIiAgb3ZlcmZsb3c9InZpc2libGUiLz4NCgkJPC9jbGlwUGF0aD4NCgkJPHBhdGggaWQ9IlhNTElEXzJfIiBjbGlwLXBhdGg9InVybCgjWE1MSURfMTZfKSIgZmlsbD0iI0ZGNDEzNiIgZD0iTTEyLDBoNDYwLjA4YzYuNiwwLDEyLDUuNCwxMiwxMnY0NjAuMDhjMCw2LjYtNS40LDEyLTEyLDEySDEyDQoJCQljLTYuNiwwLTEyLTUuNC0xMi0xMlYxMkMwLDUuNCw1LjQsMCwxMiwweiIvPg0KCTwvZz4NCjwvZz4NCjxnIGlkPSJMYXllcl8xIj4NCgk8ZyBpZD0iWE1MSURfMV8iPg0KCQk8cGF0aCBpZD0iWE1MSURfMjVfIiBmaWxsPSIjRjFGRkVCIiBkPSJNMjE4Ljg2NzMsMjQ0LjIwNDNjLTIuMDg3OS0wLjAxMzctMi4wODc5LTAuMjM5OS0xLjAyMTMsMS4wODUyDQoJCQljNDEuNTY1NSw0OS44ODMzLDg1Ljc5OTUsMTAyLjk4NiwxMjcuNDI1NiwxNTIuODE4N2MyLjIxMTcsMi42NDc3LDMuOTgxOCw2LjM4NzgsNy45NzEyLDYuNDIzOA0KCQkJYzE3LjkyMDksMC4xNjIsMzUuODQ0MSwwLjA3NSw1Ni4wODk2LDAuMDcyMmMwLjM4MzUtMC4wMDAxLDAuNTk5MS0wLjQ0OTYsMC4zNjI4LTAuNzUxNw0KCQkJYy00LjE4NzgtNS4zNTU5LTYuNjUxMS04LjY3MDYtOS4zMDEyLTExLjgyODRjLTI1Ljg0MDUtMzAuNzktNTEuNzI4OS02MS41Mzk5LTc3LjU3NTItOTIuMzI0OQ0KCQkJYy05Ljk4NzUtMTEuODk1OS05LjkwOTYtMTEuNzg4NSw0LjU0MzQtMTYuNjA3MmM0MS4yMTQ3LTEzLjc0MTMsNjQuNTM1NC00Mi44ODUxLDY4LjQ5MzMtODUuNTEzMw0KCQkJYzMuODkzMS00MS45Mjk2LTExLjY5ODgtNzUuOTc3OS00OC4wMjQ2LTk5LjQxNDVjLTguMjcyOS01LjMzNzUtMTMuMzQ4MS00LjY1NjgtMTkuNDk0NCwzLjczNDgNCgkJCWMtNC45NDk3LDYuNzU3OS05Ljk4NzIsMTMuNDQxMy0xNS4zOTQ5LDE5Ljg4NzRjLTUuNDI2LDYuNDY4LTcuMTgzNyw5Ljk4NzgsMS4xNDg1LDEzLjM2MjkNCgkJCWMxNS40Mzk0LDYuMjU0LDI3Ljg3MDMsMTguNDgyNywzMi45NzkxLDM0LjMzOGMxMi4xMjIxLDM3LjYyMTUtMTIuNjQ2Miw3Mi44MDc5LTUzLjg5NDMsNzQuNTMzNQ0KCQkJQzI2OC4yNjUxLDI0My44Njc0LDI0NC43MDAyLDI0NC4yMDQzLDIxOC44NjczLDI0NC4yMDQzeiIvPg0KCQk8cGF0aCBpZD0iWE1MSURfMjRfIiBmaWxsPSIjRjFGRkVCIiBkPSJNMjk0Ljc5MjgsNzkuOTc3N2MtMTkuMjcyOSwwLTM1LjA3NjcsMC4yODIzLTUwLjg2MjMtMC4xMzA0DQoJCQljLTYuOTEzOS0wLjE4MDgtMTEuNDAwOSwyLjM4NjYtMTUuNjQ5MSw3LjY2NzdjLTM5LjU1ODcsNDkuMTc3Ny03OS4yNDQsOTguMjU0Ni0xMTkuMTYxLDE0Ny4xNDE1DQoJCQljLTQuNjQ1NSw1LjY4OTQtNS42NjU5LDkuMzYxOS0wLjUxMTEsMTUuNjQ5MWM0MC4yOTUzLDQ5LjE0NjcsODAuMTczOCw5OC42MzUxLDEyMC4xOTI5LDE0OC4wMDgyDQoJCQljMi40NzIxLDMuMDQ5OSw0LjU3MTYsNi44NDkyLDkuMTY1LDYuODcxOWMxNy44MzYyLDAuMDg3OSwzNS42NzI5LDAuMDM1OCw1NS43NzExLDAuMDM1OA0KCQkJYy00LjcxNTUtNi4xMDMyLTcuNTc5Ny05Ljk1NDQtMTAuNTkxNS0xMy42ODY0Yy0zNy42OTYtNDYuNzEwMi03NS4yNjU4LTkzLjUyNC0xMTMuMjg3OC0xMzkuOTY3NQ0KCQkJYy01LjU3MjYtNi44MDY4LTUuNjExNi0xMS4wODI1LDAuMDY0Mi0xNy43NDRjMTYuMDI0Ni0xOC44MDc2LDMxLjI5MjItMzguMjYwNCw0Ni44NDY4LTU3LjQ2ODINCgkJCUMyNDIuMDE1LDE0NS4xODEzLDI2Ny4yNTA5LDExMy45OTk4LDI5NC43OTI4LDc5Ljk3Nzd6Ii8+DQoJCTxnIGlkPSJYTUxJRF80XyI+DQoJCQk8cGF0aCBpZD0iWE1MSURfMzNfIiBmaWxsPSIjRjFGRkVCIiBkPSJNOTQuODczNyw3OC44NDMyaDMwLjU0MDdjOC44LDAsMTYsNy4yLDE2LDE2djMwOS43ODUyIi8+DQoJCTwvZz4NCgkJPGcgaWQ9IlhNTElEXzNfIj4NCgkJCTxwYXRoIGlkPSJYTUxJRF8zNF8iIGZpbGw9IiNGMUZGRUIiIGQ9Ik0xNDEuNDE0NSw0MDQuNjI4NGgtMzAuNTQwN2MtOC44LDAtMTYtNy4yLTE2LTE2Vjc4Ljg0MzIiLz4NCgkJPC9nPg0KCTwvZz4NCjwvZz4NCjwvc3ZnPg0K'
				},
				pictureAspect: 'silhouette',
				themeColor: '#ff4136'
			}
		},
		settings: {
			scalingAlgorithm: 'Mitchell',
			errorOnImageTooSmall: false
		},
		markupFile: FAVICON_DATA_FILE
	}, function() {
		done();
	});
});

// Inject the favicon markups in your HTML pages. You should run
// this task whenever you modify a page.
gulp.task('inject-favicon-markups', function() {
	return gulp.src([ 'dist/index.html' ])
		.pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
		.pipe(gulp.dest('dist'));
});

// Check for updates on RealFaviconGenerator (think: Apple has just
// released a new Touch icon along with the latest version of iOS).
// Run this task from time to time. Ideally, make it part of your
// continuous integration system.
gulp.task('check-for-favicon-update', function(done) {
	var currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version;
	realFavicon.checkForUpdates(currentVersion, function(err) {
		if (err) {
			throw err;
		}
	});
});