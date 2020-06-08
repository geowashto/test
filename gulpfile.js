//через переменную создаем папку с конечными файлами, 
//которые галп скомпилирует сам файлов папки src.
// эту папку мы отдадим клиентам
//Через переменную это делаем чтобы, если нам пришлось поменять имя папки,
//мы поменяли ее только здесь, а не по всему галп файлу
let project_folder = "dist";
//создаем папку с исходниками тоже через переменную
let source_folder = "#src";
// создаем переменную, которая будет содержать объекты,
//описывающие пути к различным папкам и файлам
let path = {
        //здесь прописан путь куда (в какие папки) галп будет выгружать готовые файлы
        build: {
            html: project_folder + "/",
            css: project_folder + "/css/",
            js: project_folder + "/js/",
            img: project_folder + "/img/",
            fonts: project_folder + "/fonts/",
        },
        //здесь прописан путь где (в каких папках) будут размещаться файлы исходников.
        //как видим они расположены в папке src и к некоторым файлам прописан прямой путь.
        // терминология /img/**/*. означает, что в папке img галп просматривает все папки(**),
        // а в этих папках ищутся любые файлы с расширениями {jpg,png,svg,gif,ico,webp}.
        src: {
            //здесь мы прописываем исключение "!" + source_folder + "/_*.html", чтобы
            // в папку dist не записывались файлы html, название которых начинается с прочерка.
            html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
            css: source_folder + "/scss/style.scss",
            js: source_folder + "/js/script.js",
            img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
            fonts: source_folder + "/fonts/*ttf",
        },
        // создаем объект который будет постоянно проверять файлы, отлавливать их изменения
        // и после этого что-то выполнять. Выбираем только те файлы которые нужно отслеживать.
        watch: {
            html: source_folder + "/**/*.html",
            css: source_folder + "/scss/**/*.scss",
            js: source_folder + "/js/**/*.js",
            img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
        },
        // создаем объект, содержащий путь к папке, которую мы будем каждый раз удалять,
        //чтобы галп создавал ее заново, каждый раз, когда мы будем запускать проект.
        clean: "./" + project_folder + "/"

    }
    //создадим еще несколько переменных, которые помогут написать сценарий. 
    //присвоим им значение галп
let { src, dest } = require('gulp'),
    //также создадим отдельную переменную галп, которой присвоим такое же значение.
    gulp = require('gulp'),
    // назначаем плагину browser-sync переменную, которая отвечает за обновление браузера.
    browsersync = require("browser-sync").create(),
    // назначаем плагину gulp-file-include переменную, которая отвечает за импорт одних html файлов в другие.
    fileinclude = require("gulp-file-include"),
    // назначаем плагину del переменную, которая отвечает за автоматическое удаление папки dist
    // после завершения работы галп и запуска нового сеанса.
    del = require("del"),
    // назначим плагину gulp-sass переменную, которая преобразовывает scss файл в css файл.
    scss = require("gulp-sass"),
    // назначим плагину gulp-autoprefixer переменную, которая будет автоматически
    // подставлять свойствам css вендорные префиксы.
    autoprefixer = require("gulp-autoprefixer"),
    // назначим плагину gulp-group-css-media-queries переменную, которая будет 
    //собирать медиа запросы по всему CSS файлу и сгруппирует их в одном месте
    // в зависимости от ширины экрана и стилей, прописаных для каждой ширины.
    group_media = require("gulp-group-css-media-queries"),
    //назначим плагину gulp-clean-css переменную, которая будет чистить и сжимать
    //(минимизировать) файл css в папке dist.
    clean_css = require("gulp-clean-css"),
    //назначим плагину gulp-rename переменную, которая будет переименовывать 
    //минимизированый файл css в папке dist. (чтобы оставлять расширенный)
    rename = require("gulp-rename"),
    //назначим плагину gulp-uglify-es переменную, которая будет чистить и сжимать
    //(минимизировать) файл js в папке dist.
    uglify = require("gulp-uglify-es").default,
    //назначим плагину gulp-uglify-es переменную, которая будет сжимать
    //картинки для веб в папке dist.
    imagemin = require("gulp-imagemin"),
    //назначим плагину gulp-webp переменную, которая будет превращать исходые картинки 
    //в формат webp для веб в папке dist.
    webp = require("gulp-webp"),
    //назначим плагину gulp-webp-html переменную, которая будет прописывать webp картинки 
    //для браузеров, которые поддерживают данный формат или альтернативно, картинки в
    // исходных форматах (jpg, gif и т.д.) для браузеров, которые не поддерживают.
    webphtml = require("gulp-webp-html"),
    // переменная для плагина gulp-webpcss, аналогичному gulp-webp-html, но для CSS стилей картинок.
    webpcss = require("gulp-webpcss"),
    // создаем переменную, для плагина gulp-ttf2woff,который будет конвертировать
    // ttf шрифты в формат woff.
    ttf2woff = require("gulp-ttf2woff"),
    // создаем переменную, для плагина gulp-ttf2woff2,который будет конвертировать
    // ttf шрифты в формат woff2.Шрифты вставлять прямо в папку #src/fonts без всяких
    //промежуточных папок (иначе не найдет)
    ttf2woff2 = require("gulp-ttf2woff2"),
    // создаем переменную, для плагина gulp-fonter,который будет конвертировать
    // otf шрифты в форматы woff и woff2.Шрифты вставлять прямо в папку #src/fonts без всяких
    //промежуточных папок (иначе не найдет)
    fonter = require("gulp-fonter");
//создадим отдельную функцию, которая будет обновлять страницу в браузере
function browserSync(params) {
    browsersync.init({
        server: {
            baseDir: "./" + project_folder + "/"
        },
        port: 3000,
        notify: false
    })

};
// создаем функцию, которая будет возвращать html файл в папку src
function html() {
    return src(path.src.html)
        // здесь попросим собирать html-файлы в один index.html
        .pipe(fileinclude())
        // здесь с помощью плагина gulp-webp-html будут автоматически создаваться и 
        //вставляться теги для изображений в webp формате и в исходных форматах
        // (для браузеров, которые его не поддерживают) 
        .pipe(webphtml())
        // с помощью pipe будем перебрасывать наши файлы из папки src в папку dist,
        // которую отдадим заказчику.
        .pipe(dest(path.build.html))
        // после этого обновим нашу страницу.
        .pipe(browsersync.stream())
};
//создаем функцию, которая будет превращать файл scss из папки #src 
// в файл css в папке dist
function css() {
    // это путь, куда будем отправлять файл (см. выше переменная css)
    return src(path.src.css)
        // с помощью pipe настроим обработку нашего scss файла в развернутый (не сжатый) файл css.
        .pipe(
            scss({
                outputStyle: "expanded"
            })
        )
        // с помощью pipe запускаем плагин gulp-group-css-media-queries 
        .pipe(
            group_media()
        )
        // с помощью pipe настроим наш плагин gulp-autoprefixer на поддержку
        // 5 последних версий браузеров и на стиль написания вендорных префиксов - каскад
        .pipe(
            autoprefixer({
                overrideBrowserslist: ["last 5 versions"],
                cascade: true
            })
        )
        //запускается плагин, который прописывает стили как для webp картинок, так и для альтернативных
        // в традиционных форматов (для браузеров, не поддерживающих webp)
        .pipe(webpcss())
        // с помощью pipe будем перебрасывать наши файлы из папки src в папку dist,
        // которую отдадим заказчику.
        .pipe(dest(path.build.css))
        // с помощью pipe запускаем плагин gulp-clean-css
        .pipe(clean_css())
        // с помощью pipe запускаем плагин gulp-rename
        .pipe(
            rename({
                extname: ".min.css"
            })
        )
        // еще раз перебросим в папку к заказчику уже минимизированный файл style.min.css
        .pipe(dest(path.build.css))
        // после этого обновим нашу страницу.
        .pipe(browsersync.stream())

};
// создаем функцию, которая будет возвращать js файл в папку js в нашей папке.
function js() {
    return src(path.src.js)
        // здесь попросим собирать все js-файлы в один script.js
        .pipe(fileinclude())
        // с помощью pipe будем перебрасывать наши файлы из папки src в папку dist,
        // которую отдадим заказчику.
        .pipe(dest(path.build.js))
        // будем сжимать наш js-файл в min.js
        .pipe(
            uglify()
        )
        //с помощью pipe запускаем плагин gulp-rename
        .pipe(
            rename({
                extname: ".min.js"
            })
        )
        // еще раз перебросим в папку к заказчику уже минимизированный файл script.min.css
        .pipe(dest(path.build.js))
        // после этого обновим нашу страницу.
        .pipe(browsersync.stream())
};
// создаем функцию, которая будет возвращать img файл в папку src
function images() {
    return src(path.src.img)
        // запускаем преобразование исходных картинок в формат webp
        .pipe(
            webp({
                quality: 70
            })
        )
        // выгружаем файлы картинок после преобразования в webp. Теперь в тех браузерах, которые,
        //поддерживают картинки в webp, они отобразятся. Для остальных - отобразятся сжатые картинки
        //в исходных форматах.
        .pipe(dest(path.build.js))
        .pipe(src(path.src.img))
        //запускаем обработку изображений, активизируем, СВДж, оптимизация других форматов изображений
        .pipe(
            imagemin({
                progressive: true,
                svgoPlugins: [{ removeViewBox: false }],
                interlaced: true,
                optimizationLevel: 3 //from 0 to 7
            })
        )
        // с помощью pipe будем перебрасывать наши файлы из папки src в папку dist,
        // которую отдадим заказчику.
        .pipe(dest(path.build.img))
        // после этого обновим нашу страницу.
        .pipe(browsersync.stream())
};
//создаем функцию, которая будет обрабатывать шрифты
function fonts(params) {
    //прописываем путь к исходникам (откуда брать шрифты)
    src(path.src.fonts)
        //обработка. применяем первый плагин ttf2woff
        .pipe(ttf2woff())
        //выгружаем результат в папку dist
        .pipe(dest(path.build.fonts));
    //прописываем путь к исходникам (откуда брать шрифты), 
    //перед этим завершаеv выполнение предыдущей функции (ttf2woff) и возвращаем её значение.
    return src(path.src.fonts)
        //обработка. применяем первый плагин ttf2woff2
        .pipe(ttf2woff2())
        //выгружаем результат в папку dist
        .pipe(dest(path.build.fonts));
};
//создадим задачу otf2ttf, в которой будут найдены шрифты otf и преобразованы в ttf.
//для того, чтобы мы могли их позже преобразовать в woff и wooff2
// чтобы запустить выполнение этой задачи (если мы используем шрифт otf), 
//набираем в командной строке название задачи gulp otf2ttf
//после того, как задача выполнится в папке исходника появится тот же шрифт в ttf формате.
gulp.task('otf2ttf', function() {
        return src([source_folder + '/fonts/*.otf'])
            .pipe(fonter({
                formats: ['ttf']
            }))
            .pipe(dest(source_folder + '/fonts/'));
    })
    // отслеживаем на лету изменения в файле index.html для того, 
    //чтобы немедленно вносить изменения в браузер
function watchFiles(params) {
    gulp.watch([path.watch.html], html);
    //отслеживаем на лету изменения в файле style.css для того, 
    //чтобы немедленно вносить изменения в браузер
    gulp.watch([path.watch.css], css);
    //отслеживаем на лету изменения в файле script.js для того, 
    //чтобы немедленно вносить изменения в браузер
    gulp.watch([path.watch.js], js);
    //отслеживаем на лету изменения картинок на сайте для того, 
    //чтобы немедленно вносить изменения в браузер
    gulp.watch([path.watch.img], images);
};
// создаем функцию, которая будет удалять папку dist, при каждом новом запуске галпа.
function clean(params) {
    return del(path.clean);
}
// подружим с галпом переменную build. Мы хотим, чтобы функции обработки
//файлов html и файлов стилей css выполнялись одновременно (для этого используем parallel)
let build = gulp.series(clean, gulp.parallel(js, css, html, images, fonts));
//проверим работоспособность кода, написанного выше. 
//Все три процесса выполняем одновременно через parallel
let watch = gulp.parallel(build, watchFiles, browserSync);
//здесь хотим подружить галп с новыми переменными, для этого прописываем их
//определенным образом.Т.е. как только запустится галп, начнет выполняться
exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;