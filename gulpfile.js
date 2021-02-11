const gulp = require('gulp');
const del = require('del');
const fs = require('fs');

const useref = require('gulp-useref');
const cache = require('gulp-cache');
const flatten = require('gulp-flatten')

const sass = require('gulp-sass');
const cssnano = require('cssnano');
const postcss = require('gulp-postcss');

const autoprefixer = require('autoprefixer');
const imagemin = require('gulp-imagemin');
const terser = require('gulp-terser');
const gulpIf = require('gulp-if');
const convertNewline = require('gulp-convert-newline');

const browserSync = require('browser-sync').create();
const realFavicon = require('gulp-real-favicon');


gulp.task('lineEndings', function () {
	return gulp.src('dist/index.html')
		.pipe(convertNewline())
		.pipe(gulp.dest("dist/"));
});

gulp.task('clean:dist', async function () {
	del.sync(['dist/**', '!dist']);
});



gulp.task('sass', function () {
	return gulp.src('app/scss/**/*.+(scss|sass)')
		.pipe(sass())
		.pipe(gulp.dest('app/css'))
		.pipe(browserSync.stream())
});

gulp.task('images', function () {
	return gulp.src(['app/img/**/*.+(png|jpg|gif|svg|ico)'])
		.pipe(cache(imagemin()))
		.pipe(flatten())
		.pipe(gulp.dest('dist/img'))
});

gulp.task('fonts', function () {
	return gulp.src('app/fonts/**/*')
		.pipe(gulp.dest('dist/fonts'))
})

gulp.task('useref', function () {
	var plugins = [
		autoprefixer(),
		cssnano()]
	return gulp.src('app/*.html')
		.pipe(gulpIf('*.html', useref()))
		.pipe(gulpIf('*.js', terser()))
		.pipe(gulpIf('*.css', postcss(plugins)))
		.pipe(gulp.dest('dist'))
});

gulp.task('copy', function (done) {
	gulp.src('app/CNAME')
		.pipe(gulp.dest('dist'));
	gulp.src('app/LICENSE')
		.pipe(gulp.dest('dist'));
	gulp.src('app/sitemap.xml')
		.pipe(gulp.dest('dist'));
	gulp.src('app/robots.txt')
		.pipe(gulp.dest('dist'));
	gulp.src('app/README.md')
		.pipe(gulp.dest('dist'));
	gulp.src('app/assets/**/*')
		.pipe(gulp.dest('dist/assets'));
	gulp.src('app/img/favicon/site.webmanifest')
		.pipe(flatten())
		.pipe(gulp.dest('dist/img'));
	gulp.src('app/img/favicon/browserconfig.xml')
		.pipe(flatten())
		.pipe(gulp.dest('dist/img'));
	
	done();
});

// Static Server + watching scss/html files
gulp.task('serve', gulp.series('sass', function(){

    browserSync.init({
        server: "./app"
    });

    gulp.watch("app/scss/**/*.+(scss|sass)", gulp.series('sass'));
	gulp.watch("app/*.html").on('change', browserSync.reload);
	gulp.watch("app/js/**/*.js").on('change', browserSync.reload);
}));


gulp.task('default', gulp.series('sass', 'serve', function (callback) {
	callback
}));

// File where the favicon markups are stored
var FAVICON_DATA_FILE = 'faviconData.json';

// Generate the icons. This task takes a few seconds to complete.
// You should run it at least once to create the icons. Then,
// you should run it whenever RealFaviconGenerator updates its
// package (see the check-for-favicon-update task below).
gulp.task('generate-favicon', function (done) {
	realFavicon.generateFavicon({
		masterPicture: 'app/img/logo.svg',
		dest: 'dist/img',
		iconsPath: 'img/',
		design: {
			ios: {
				pictureAspect: 'noChange',
				assets: {
					ios6AndPriorIcons: false,
					ios7AndLaterIcons: false,
					precomposedIcons: false,
					declareOnlyDefaultIcon: true
				}
			},
			desktopBrowser: {},
			windows: {
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
				pictureAspect: 'blackAndWhite',
				threshold: 94.0625,
				themeColor: '#5bbad5'
			}
		},
		settings: {
			compression: 4,
			scalingAlgorithm: 'Lanczos',
			errorOnImageTooSmall: false,
			readmeFile: false,
			htmlCodeFile: false,
			usePathAsIs: false
		},
		markupFile: FAVICON_DATA_FILE
	}, function () {
		done();
	});
});

// Inject the favicon markups in your HTML pages. You should run
// this task whenever you modify a page.
gulp.task('inject-favicon-markups', function () {
	return gulp.src(['dist/index.html'])
		.pipe(realFavicon.injectFaviconMarkups(JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).favicon.html_code))
		.pipe(gulp.dest('dist'));
});

// Check for updates on RealFaviconGenerator (think: Apple has just
// released a new Touch icon along with the latest version of iOS).
// Run this task from time to time. Ideally, make it part of your
// continuous integration system.
gulp.task('check-for-favicon-update', function (done) {
	var currentVersion = JSON.parse(fs.readFileSync(FAVICON_DATA_FILE)).version;
	realFavicon.checkForUpdates(currentVersion, function (err) {
		if (err) {
			throw err;
		}
	});
});

gulp.task('build', 
	gulp.series('clean:dist',
		gulp.parallel('images', 'sass', 'fonts'),
		'copy',
		'useref',
		gulp.parallel('inject-favicon-markups', 'lineEndings')
	)
);