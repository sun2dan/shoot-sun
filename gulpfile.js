var gulp = require('gulp');
var fs = require('fs');
// Plugins
var postcss = require('gulp-postcss');
var autoprefixer = require("autoprefixer");
var replace = require('gulp-replace');
var uglify = require('gulp-uglify');
var wrapper = require('gulp-wrapper');
var minifyCSS = require('gulp-minify-css');
var browserSync = require('browser-sync');
var gulpSequence = require('gulp-sequence');  //管理任务队列
var babel = require("gulp-babel");

// 工具类
var projectUtil = {
  // 获取当前时间
  getNowDate: function () {
    var nowDate = new Date();
    var now = nowDate.getFullYear() + '-' + (nowDate.getMonth() + 1) + '-' + nowDate.getDate() + ' ' + nowDate.getHours() + ':' + nowDate.getMinutes() + ':' + nowDate.getMinutes();
    return now;
  },
  // 删除文件夹
  deleteDir: function (path) {
    var _this = this;
    var files = [];
    if (fs.existsSync(path)) {
      files = fs.readdirSync(path);
      files.forEach(function (file, index) {
        var curPath = path + "/" + file;
        if (fs.statSync(curPath).isDirectory()) { // recurse
          _this.deleteDir(curPath);
        } else { // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  },
};

/**================================================================
 单步任务
 =================================================================*/
// css
gulp.task('css', function () {
  var dateStr = projectUtil.getNowDate();
  gulp.src(['./css/*.css'])
    .pipe(minifyCSS({}))
    .pipe(postcss([autoprefixer()]))
    .pipe(wrapper({
      header: '/* @update: ' + dateStr + ' */ \n'
    }))
    .pipe(gulp.dest('build/css'));
});

// uglify javascript
gulp.task('js', function () {
  gulp.src(['./js/*.js'])
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(uglify({
      mangle: {except: ['jQuery', '$', 'require']},
      output: {ascii_only: true}
    }))
    .pipe(wrapper({
      header: '/* @update: ' + projectUtil.getNowDate() + ' */ \n'
    }))
    .pipe(gulp.dest('build/js'));
});

gulp.task('moveFiles', function () {
  gulp.src(['./lib/*.*'])
    .pipe(gulp.dest('build/lib'));
});

gulp.task('assets', function () {
  gulp.src(['./images/*'])
    .pipe(gulp.dest('build/images'));

  gulp.src(['./assets/*',])
    .pipe(gulp.dest('build/assets'));
});

gulp.task('html', function () {
  gulp.src(['./*.html'])
    // .pipe(replace(/(\n|\s{2,})/g, ''))
    .pipe(gulp.dest('build/'));
});

// 删除build 文件夹
gulp.task('deleteBuild', function () {
  projectUtil.deleteDir('build');
});

/**================================================================
 关于发布的任务
 =================================================================*/
// 打包压缩
gulp.task('build', function () {
  gulpSequence(['deleteBuild', 'html', 'css', 'js', 'assets', 'moveFiles'], function () {
    console.log('done')
  });
});
/**================================================================
 Static server
 =================================================================*/
gulp.task('server', function () {
  var files = [
    '**/**/*.*'
  ];
  browserSync.init(files, {
    server: {
      baseDir: './',
      directory: true,
      https: false
    },
    // port: 3004,
  });
});
