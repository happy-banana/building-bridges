var gulp = require('gulp'),
		gutil = require('gulp-util'),
		browserify = require('browserify'),
		buffer = require('gulp-buffer'),
		concat = require('gulp-concat'),
		jshint = require('gulp-jshint'),
		less = require('gulp-less'),
		minifyCSS = require('gulp-minify-css'),
		source = require('vinyl-source-stream'),
		sourcemaps = require('gulp-sourcemaps'),
		stylish = require('jshint-stylish'),
		uglify = require('gulp-uglify');

var production = false;

gulp.task('presentation-lint', function(){
	return gulp.src('./presentation/js/src/**/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter(stylish));
});

gulp.task('presentation-js', ['presentation-lint'], function(){

	var bundler = browserify({
		entries: ['./presentation/js/src/script.js'],
		debug: !production
	});

	bundler.require(__dirname + '/shared/js/Constants.js', { expose: 'Constants'});
	bundler.require(__dirname + '/shared/js/classes/slides/ContentBase.js', { expose: 'shared/ContentBase'});
	bundler.require(__dirname + '/shared/js/classes/SlideBridge.js', { expose: 'shared/SlideBridge'});
	bundler.require(__dirname + '/shared/js/classes/Presentation.js', { expose: 'shared/Presentation'});
	bundler.require(__dirname + '/shared/js/classes/MobileServerBridge.js', { expose: 'shared/MobileServerBridge'});

	bundler.require(__dirname + '/presentation/js/src/classes/slides/video-slide/index.js', { expose: 'slides/VideoSlide'});
	bundler.require(__dirname + '/presentation/js/src/classes/slides/live-code/index.js', { expose: 'slides/LiveCode'});

  bundler.require(__dirname + '/presentation/js/src/classes/slides/shake-your-phones/index.js', { expose: 'slides/ShakeYourPhonesSlide'});
  bundler.require(__dirname + '/presentation/js/src/classes/slides/megapudding/index.js', { expose: 'slides/MegaPuddingSlide'});
	return bundler.bundle()
		.on('error', function(err) {
			gutil.log(err.message);
			gutil.beep();
			this.emit('end');
		})
		.pipe(source('script.min.js'))
		.pipe(buffer())
		.pipe(production ? gutil.noop() : sourcemaps.init({loadMaps: true}))
    .pipe(production ? uglify() : gutil.noop())
    .pipe(production ? gutil.noop() : sourcemaps.write('./', {}))
    .pipe(gulp.dest('./presentation/js'));
});

gulp.task('presentation-styles', function(){
	return gulp.src('./presentation/css/src/style.less')
		.pipe(sourcemaps.init())
		.pipe(less())
		.pipe(sourcemaps.write('./'))
		.on('error', function(err) {
			gutil.log(err.message);
			gutil.beep();
			this.emit('end');
		})
		.pipe(production ? minifyCSS() : gutil.noop())
		.pipe(gulp.dest('./presentation/css'));
});

gulp.task('presentation-vendors-js', function(){
		var bundler = browserify({
		entries: ['./presentation/js/src/vendors.js'],
		debug: !production
	});
	return bundler.bundle()
		.on('error', function(err) {
			gutil.log(err.message);
			gutil.beep();
			this.emit('end');
		})
		.pipe(source('vendors.min.js'))
		.pipe(buffer())
		.pipe(production ? gutil.noop() : sourcemaps.init({loadMaps: true}))
    .pipe(production ? uglify() : gutil.noop())
    .pipe(production ? gutil.noop() : sourcemaps.write('./', {}))
    .pipe(gulp.dest('./presentation/js'));
});

gulp.task('mobile-lint', function(){
	return gulp.src(['./server/www/src/js/**/*.js', '!./server/www/src/js/vendors/**/*.js'])
		.pipe(jshint())
		.pipe(jshint.reporter(stylish));
});

gulp.task('mobile-js', ['mobile-lint'], function(){

	var bundler = browserify({
		entries: ['./server/www/src/js/script.js'],
		debug: !production
	});

	bundler.require(__dirname + '/shared/js/Constants.js', { expose: 'Constants'});
	bundler.require(__dirname + '/shared/js/classes/slides/ContentBase.js', { expose: 'shared/ContentBase'});
	bundler.require(__dirname + '/shared/js/classes/SlideBridge.js', { expose: 'shared/SlideBridge'});
	bundler.require(__dirname + '/shared/js/classes/Presentation.js', { expose: 'shared/Presentation'});
	bundler.require(__dirname + '/shared/js/classes/MobileServerBridge.js', { expose: 'shared/MobileServerBridge'});

	bundler.require(__dirname + '/server/www/src/js/classes/slides/shake-your-phones/index.js', { expose: 'slides/ShakeYourPhonesSlide'});
	//bundler.require(__dirname + '/server/www/src/js/classes/slides/react-phones/index.js', { expose: 'slides/ReactPhones'});

	return bundler.bundle()
		.on('error', function(err) {
			gutil.log(err.message);
			gutil.beep();
			this.emit('end');
		})
		.pipe(source('script.min.js'))
		.pipe(buffer())
		.pipe(production ? gutil.noop() : sourcemaps.init({loadMaps: true}))
    .pipe(production ? uglify() : gutil.noop())
    .pipe(production ? gutil.noop() : sourcemaps.write('./', {}))
    .pipe(gulp.dest('./server/www/public/js'));
});

gulp.task('mobile-styles', function(){
	return gulp.src('./server/www/src/css/style.less')
		.pipe(sourcemaps.init())
		.pipe(less())
		.pipe(sourcemaps.write('./'))
		.on('error', function(err) {
			gutil.log(err.message);
			gutil.beep();
			this.emit('end');
		})
		.pipe(production ? minifyCSS() : gutil.noop())
		.pipe(gulp.dest('./server/www/public/css'));
});

gulp.task('mobile-vendors-js', function(){
	return gulp.src([
		'./server/www/src/js/vendors/jquery.min.js',
		'./server/www/src/js/vendors/bean.min.js',
		'./server/www/src/js/vendors/modernizr.min.js',
	])
	.pipe(concat('vendors.min.js'))
	//.pipe(uglify())
	.pipe(gulp.dest('./server/www/public/js'));
});

gulp.task('default', ['watch']);

gulp.task('watch', ['mobile-js', 'mobile-styles', 'mobile-vendors-js', 'presentation-js', 'presentation-styles', 'presentation-vendors-js'], function(){

	gulp.watch('server/www/src/js/**/**', ['mobile-js']);
	gulp.watch('server/www/src/css/**/*.less', ['mobile-styles']);

	gulp.watch('presentation/js/src/**/**', ['presentation-js']);
	gulp.watch('presentation/css/src/**/*.less', ['presentation-styles']);

	gulp.watch('shared/js/**/**', ['presentation-js', 'mobile-js']);
});
