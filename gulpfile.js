let DEV = process.argv.includes('--dev');
let SERVER = process.argv.includes('--server');
let server;

const fs = require('fs');
const path = require('path')
const colors = require('ansi-colors');
const log = require('fancy-log');
const del = require('del');
const notifier = require('node-notifier');
const onExit = require('on-exit');
const imageminOptipng = require('imagemin-optipng');
const imageminPngquant = require('imagemin-pngquant');

const gulp = require('gulp');
const babel = require('gulp-babel');
const babelMinify = require('gulp-babel-minify');
const minifyCss = require('gulp-clean-css');
const stylus = require('gulp-stylus');
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const plumber = require('gulp-plumber');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const spritesmith = require('gulp.spritesmith');
const svgSprite = require("gulp-svg-sprites");
const svgmin = require('gulp-svgmin');
const gls = require('gulp-live-server');
const watch = require('gulp-watch');
const gulpif = require('gulp-if');
const gcmq = require('gulp-group-css-media-queries');
const jsImport = require('gulp-js-import');
const fileinclude = require('gulp-file-include');

const watchOpts = {events: ['add', 'change', 'unlink']};

const assetsDir = 'assets/';
const destBuildDir = `${assetsDir}build/`;
const destBuildMinDir = `${assetsDir}build/min/`;
const destSpritesDir = `${destBuildDir}sprites/`;

const cssDir = 'css/';
const cssBuildDir = `${cssDir}build/`;
const cssSpritesDir = `${cssDir}/sprites/`;

const jsDir = 'js/';
const jsBuildDir = `${jsDir}build/`;

const htmlDir = 'html/';
const htmlBuildDir = `${htmlDir}build/`;

const spriteDir = `${assetsDir}sprites/`;

gulp.task('build-css', function() {
    let dirs = [
        `${destBuildDir}/**/*.css`
    ];
    del.sync(dirs, {force: true});
    combineStylus();
});

gulp.task('build-js', function() {
    let dirs = [
        `${destBuildDir}/**/*.js`
    ];
    del.sync(dirs, {force: true});
    combineJs();
});

gulp.task('build-sprites', function() {
    let dirs = [
        `${destSpritesDir}/**/*`,
        `${cssSpritesDir}/**/*`
    ];
    del.sync(dirs, {force: true});
    createSprites().then(() => {
        combineStylus();
    });
});

gulp.task('build-html', function() {
    combineHtml();
});

gulp.task('default', function () {
    del.sync([
        `${destBuildDir}/**/*`,
        `${cssSpritesDir}**/*`
    ], {force: true});

    Promise.all([
        new Promise(resolve => {
            createSprites().then(() => {
                combineStylus().then(() => {
                    resolve();
                });
            });
        }),
        combineJs(),
        combineHtml()
    ]).then(() => {
        log('build complete');

        if (SERVER) {
            server = gls.static('./', 8080);
            server.start();
            onExit(function() {
                log('Stopping server');
                server.stop();
            });
        }

        if (DEV) {
            log('watching');

            watch([`${spriteDir}**/*.png`, `${spriteDir}**/*.svg`], {read: 0, awaitWriteFinish: true}, function(file) {
                log('sprite updated', colors.cyanBright(file.relative));
                let sprite = path.basename(path.dirname(file.path));
                createSprite(sprite).then(() => {
                    if (SERVER) server.notify.apply(server, [file]);
                });
            });

            watch([`${cssDir}**/*.styl`], {read: 0, awaitWriteFinish: true}, function(file) {
                log('css updated', colors.blueBright(file.relative));
                combineStylus(file).then(() => {
                    if (SERVER) server.notify.apply(server, [file]);
                });
            });

            watch([`${jsDir}**/*.js`], {read: 0, awaitWriteFinish: true}, function(file) {
                log('js updated', colors.yellowBright(file.relative));
                combineJs(file).then(() => {
                    if (SERVER) server.notify.apply(server, [file]);
                });
            });

            watch([`${htmlDir}**/*.html`], {read: 0, awaitWriteFinish: true}, function(file) {
                log('html updated', colors.magentaBright(file.relative));
                combineHtml(file).then(() => {
                    if (SERVER) server.notify.apply(server, [file]);
                });
            });
        }
    });

});


function combineStylus(changedFile = null) {
    return Promise.all(getFilesList(cssBuildDir, changedFile).map(file => {
        return new Promise(resolve => {
            gulp.src(file)
                .pipe(plumber({
                    errorHandler: function (error) {
                        log(colors.red(error));
                        this.emit('end');
                    }
                }))
                .pipe(stylus({
                    'include css': true
                }))
                .pipe(autoprefixer({
                    browsers: ['last 2 versions', 'ie >= 8'],
                    cascade: false
                }))
                .pipe(gcmq())
                .pipe(gulp.dest(destBuildDir))
                .on('end', () => {
                    if (DEV) {
                        log('combined css for', file);
                        resolve();
                    }
                })
                .pipe(gulpif(!DEV, minifyCss({
                    compatibility: 'ie8',
                    advanced: true
                })))
                .pipe(gulpif(!DEV, rename({suffix: '.min'})))
                .pipe(gulpif(!DEV, gulp.dest(destBuildMinDir)))
                .on('end', () => {
                    log('combined css for', file);
                    resolve();
                })
        });
    })).then(() => {
        log(colors.green('css combined'));
    });
}

function combineJs(changedFile = null) {
    return Promise.all(getFilesList(jsBuildDir, changedFile).map(file => {
        return new Promise(resolve => {
            gulp.src(file)
                .pipe(plumber({
                    errorHandler: function (error) {
                        log(colors.red(error));
                        this.emit('end');
                    }
                }))
                .pipe(jsImport({hideConsole: true}))
                .pipe(babel({
                    presets: [
                        ["env", {"targets": {
                                "browsers": ["last 2 versions", "ie 8"]
                            }, "modules": false}]
                    ],
                    compact: true
                }))
                .pipe(gulp.dest(destBuildDir))
                .on('end', () => {
                    if (DEV) {
                        log('combined js for', file);
                        resolve();
                    }
                })
                .pipe(gulpif(!DEV, babelMinify({
                    mangle: {
                        keepClassName: true
                    }
                })))
                .pipe(gulpif(!DEV, rename({suffix: '.min'})))
                .pipe(gulpif(!DEV, gulp.dest(destBuildMinDir)))
                .on('end', () => {
                    log('combined js for ', file);
                    resolve();
                });
        });
    })).then(() => {
        log(colors.green('js combined'));
    });
}

function createSprite(name) {
    return new Promise((resolve) => {
        let spritePng = gulp.src(`${spriteDir}${name}/*.png`)
            .pipe(spritesmith({
                imgName: name + '.png',
                cssName: name + '.styl',
                imgPath: `/${destSpritesDir}${name}.png`,
                padding: 25,
                cssOpts: {functions: false},
                cssSpritesheetName: `spritesheet-${name}`
            }));

        Promise.all([
            new Promise((resolveInner) => {
                spritePng.img
                    .pipe(gulp.dest(destSpritesDir))
                    .on('end', resolveInner);
            }),
            new Promise((resolveInner) => {
                spritePng.css
                    .pipe(gulp.dest(cssSpritesDir))
                    .on('end', resolveInner)
            }),
            new Promise((resolveInner) => {
                // create css
                gulp.src(`${spriteDir}${name}/*.svg`)
                    .pipe(svgSprite({
                        selector: "icon-%f",
                        svg: {
                            sprite: `${destSpritesDir}${name}.svg`,
                        },
                        cssFile: `${cssSpritesDir}${name}-svg.css`,
                        preview: false,
                        baseSize: 32,
                        templates: {
                            css: fs.readFileSync(`${spriteDir}/sprite-template.css`, "utf-8")
                        }
                    }))
                    .pipe(gulp.dest('./'))
                    .on('end', () => {
                        // create stylus
                        gulp.src(`${spriteDir}${name}/*.svg`)
                            .pipe(svgSprite({
                                selector: "icon-%f",
                                svg: {
                                    sprite: `${destSpritesDir}${name}.svg`,
                                },
                                cssFile: `${cssSpritesDir}${name}-svg.styl`,
                                preview: false,
                                baseSize: 32,
                                templates: {
                                    css: fs.readFileSync(`${spriteDir}/sprite-template-styl.css`, "utf-8")
                                }
                            }))
                            .pipe(gulp.dest('./'))
                            .on('end', () => {
                                // create svg sprites
                                gulp.src(`${spriteDir}${name}/*.svg`)
                                    .pipe(svgmin({
                                        plugins: [
                                            {removeHiddenElems: true},
                                            {removeAttrs: {
                                                attrs: 'fill|stroke'
                                            }},
                                            {removeStyleElement: true}
                                        ],
                                        js2svg: {
                                            pretty: true
                                        }
                                    }))
                                    .pipe(svgSprite({
                                        mode: 'symbols',
                                        selector: "icon-%f",
                                        svg: {
                                            symbols: `${destSpritesDir}${name}.svg`,
                                        },
                                        preview: false,
                                        baseSize: 32
                                    }))
                                    .pipe(gulp.dest('./'))
                                    .on('end', resolveInner);
                            });
                    });
            })
        ]).then(() => {
            log(`create sprite ${name}`);
            resolve();
        });
    });
}

function createSprites() {
    return Promise.all(getDirs(spriteDir).map(dir => {
        return createSprite(dir);
    })).then(() => {
        log(colors.green('sprites created'));
    });
}

function combineHtml(changedFile = null) {
    return Promise.all(getFilesList(htmlBuildDir, changedFile).map(file => {
        return new Promise(resolve => {
            gulp.src(file)
                .pipe(plumber({
                    errorHandler: function (error) {
                        log(colors.red(error));
                        this.emit('end');
                    }
                }))
                .pipe(fileinclude({
                    prefix: '@@'
                }))
                .pipe(gulp.dest('./'))
                .on('end', () => {
                    log('combined html for ', file);
                    resolve();
                });
        });
    })).then(() => {
        log(colors.green('html combined'));
    });
}


function getDirs(srcpath) {
    return fs.readdirSync(srcpath).filter(file => fs.statSync(path.join(srcpath, file)).isDirectory());
}

function getFiles(srcpath) {
    return fs.readdirSync(srcpath).filter(file => !fs.statSync(path.join(srcpath, file)).isDirectory());
}

function getNewLineChar() {
    var isWindows = typeof process != 'undefined' && 'win32' === process.platform;
    return isWindows ? '\r\n' : '\n';
}

function isBuildFile(file, dir) {
    let filPath = path.dirname(file.path).replace(/\\/g, '/') + '/';
    var re = new RegExp(`${dir}`, 'g');
    return re.test(filPath);
}

function getFilesList(dir, changedFile = null) {
    let filesList = [];
    if (changedFile) {
        if (isBuildFile(changedFile, dir)) {
            filesList.push(`${dir}${changedFile.basename}`);
        } else {
            let fileRegex = changedFile.relative
                .replace(/\\/g, '/')
                .replace(/\//g, '\\/')
                .replace(/\\\\/g, '\\')
                .replace(/\./g, '\\.');
            getFiles(dir).map(file => {
                let re = new RegExp(`^.*?(?:@require|@import|@@include)\s*(?:'|")?.*?${fileRegex}(?:'|")?.*?$`, 'g');
                var lines = fs.readFileSync(`${dir}${file}`).toString().split(getNewLineChar());
                for (let i in lines) {
                    if (!lines.hasOwnProperty(i)) {
                        continue;
                    }
                    if (re.test(lines[i])) {
                        filesList.push(`${dir}${file}`);
                        break;
                    }
                }
            });
        }
    } else {
        getFiles(dir).map(file => {
            filesList.push(`${dir}${file}`);
        });
    }
    return filesList;
}