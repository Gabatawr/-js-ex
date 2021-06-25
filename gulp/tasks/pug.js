import gulp from 'gulp';
import gulpif from 'gulp-if';
import plumber from 'gulp-plumber';
import pug from 'gulp-pug';
import pugGlob from 'pug-include-glob';
import { setup as emittySetup } from '@zoxon/emitty';
import config from '../config';

const emittyPug = emittySetup(
  config.src.pug,
  'pug',
  { makeVinylFile: true },
);

global.isPugWatch = false;
global.emittyChangedFile = {
  path: '',
  stats: null,
};

export const pugBuild = () => (
  gulp.src(`${config.src.pug}/*.pug`)
    .pipe(plumber())
    .pipe(
      gulpif(
        global.isPugWatch,
        emittyPug.stream(
          global.emittyChangedFile.path,
          global.emittyChangedFile.stats,
        ),
      ),
    )
    .pipe(pug({
      pretty: config.isDev,
      plugins: [pugGlob()],
      locals: {
        isProd: config.isProd,
        repName: config.repName,
      },
    }))
    .pipe(gulp.dest(`${config.dest.html}`))
);

export const pugWatch = () => {
  global.isPugWatch = true;
  gulp.watch(`${config.src.pug}/**/*.pug`, pugBuild)
    .on('all', (event, filepath, stats) => {
      global.emittyChangedFile = {
        path: filepath,
        stats,
      };
    });
};
