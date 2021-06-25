import gulp from 'gulp';
import gulpif from 'gulp-if';
import plumber from 'gulp-plumber';
import sass from 'gulp-dart-sass';
import autoprefixer from 'gulp-autoprefixer';
import gcmq from 'gulp-group-css-media-queries';
import cleanCSS from 'gulp-clean-css';
import smartGrid from 'smart-grid-sass-use';
import importFresh from 'import-fresh';
import rename from 'gulp-rename';
import config from '../config';

const SMART_GRID_CONFIG_NAME = 'smart-grid-config.js';

const sassBuild = () => (
  gulp.src(`${config.src.sass}/main.scss`, { sourcemaps: config.isDev })
    .pipe(plumber())
    .pipe(sass({
      outputStyle: 'expanded',
      includePaths: [
        './node_modules',
        './src/scss',
      ],
    }))
    .pipe(gulpif(config.isProd, gcmq()))
    .pipe(gulpif(config.isProd, autoprefixer()))
    .pipe(gulpif(config.isProd, cleanCSS({ level: 2 })))
    .pipe(rename({
      suffix: '.min',
    }))
    .pipe(gulp.dest(config.dest.css, { sourcemaps: config.isDev }))
);

const smartGridBuild = (callback) => {
  const smartGridConfig = importFresh(`../../${SMART_GRID_CONFIG_NAME}`);
  smartGrid(`${config.src.sass}/generated`, smartGridConfig);

  callback();
};

export const stylesBuild = gulp.series(smartGridBuild, sassBuild);

export const stylesWatch = () => {
  gulp.watch(`${config.src.sass}/**/*.scss`, sassBuild);
  gulp.watch(`./${SMART_GRID_CONFIG_NAME}`, smartGridBuild);
};
