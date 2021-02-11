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
const inject = require('gulp-inject');

const browserSync = require('browser-sync').create();
const favicons = require('gulp-favicons');

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


// Generates and minimizes favicon images
gulp.task('prepare:favicons', function () {
	return gulp.src('app/img/logo.png')
	.pipe(
		favicons({
		  appName: 'Kai Richardso\'s Portfolio',
		  appShortName: 'KR',
		  appDescription: 'My portfolio website!',
		  developerName: 'Kai Richardson',
		  developerURL: 'http://kairichardson.com',
		  background: '#020307',
		  url: 'http://kairichardson.com',
		  logging: false,
		  html: 'favicon.html',
		  pipeHTML: true,
		  replace: true,
		  icons: {
			  appleStartup: false,
			  coast: false,
			  windows: false,
			  yandex: false,
		  }
		})
	  )
	  .pipe(imagemin())
	  .pipe(gulp.dest('./dist'));
});

// Injects our generated favicon.html into our index.html
gulp.task('inject:favicons', function () {
	var target = './app/index.html';
	var source = './dist/favicon.html';

	return gulp.src(target)
	.pipe(inject(gulp.src(source), {
		starttag: '<!-- inject:favicons -->',
		transform: function (filePath, file) {
		  // return file contents as string
		  return file.contents.toString('utf8')
		}
	  }))
    .pipe(gulp.dest('./app'));
});

// Deletes the old generated favicon.html
gulp.task('clean:favicons', function () {
	var source = './dist/favicon.html';
	return del(source)
});

gulp.task('build', 
	gulp.series('clean:dist',
		gulp.parallel('images', 'sass', 'fonts','prepare:favicons'),
		'inject:favicons',
		'clean:favicons',
		'copy',
		'useref',
	)
);