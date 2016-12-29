var gulp = require('gulp');
var browserSync = require('browser-sync').create();

// Static Server + watching scss/html files
gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./erd_d3"
        }
    });

    gulp.watch("./erd_d3/css/*.css").on('change', browserSync.reload);
    gulp.watch("./erd_d3/*.html").on('change', browserSync.reload);
    gulp.watch("./erd_d3/js/*.js").on('change', browserSync.reload);
});

gulp.task('default', ['browser-sync']);
