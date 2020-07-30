(function () {
    var _publicMethod = {

        //页面适配
        pageAdapter: function (size) {
            var DESIGN_SIZE = 640;
            if (typeof size !== 'number') {
                size = DESIGN_SIZE;
            }

            function setHtmlSize() {
                var htmlWidth = document.documentElement.clientWidth;
                var htmlHeight = document.documentElement.clientHeight;
                htmlWidth = htmlWidth > 750 ? 750 : htmlWidth;
                var value = htmlWidth > htmlHeight ? htmlHeight : htmlWidth;
                document.getElementsByTagName('html')[0].style.fontSize = (value / size) * 100 + "px";
            }

            window.addEventListener('resize', setHtmlSize);

            setHtmlSize();
        },

        //禁止移动端页面滚动,如果想释放某区域滚动，参数：单区域 - string, 多区域 - Array
        stopPageScroll: function (className) {
            document.addEventListener('touchmove', function (evt) {
                evt.preventDefault();
            }, {capture: false, passive: false});

            if (typeof className === 'string') {
                scroll(className);
            }

            if (Array.isArray(className)) {
                className.forEach(function (name) {
                    name && scroll(name)
                })
            }

            function scroll(name) {
                var node = document.querySelector(name);
                node.addEventListener('touchmove', function (evt) {
                    evt.stopPropagation();
                }, false)
            }
        },

        //页面图片资源加载, bool有值就跳过数字过渡阶段
        loading: function (imgArray, callback, bool) {

            var cacheArr = [];
            var index = 0; //图片数组开始下标
            var number = 0; //当前加载开始数值
            var isEdit = false; // 数字是否修改中
            var IMG_POLL_TIME = 50; //图片轮询时间
            var NUM_INTERVAL = 20; //数字渲染间隔时间

            imgArray.forEach(function (val) {
                imgLoad(val, function () {
                    index++;
                    if (bool) {
                        index / imgArray.length === 1 && callback && callback('end');
                    } else {
                        cacheArr.push(parseInt(index / imgArray.length * 100));
                        insertNum();
                    }

                })
            });

            function insertNum() {
                if (cacheArr[0] < 0 || isEdit) return;
                isEdit = true;
                var timeNum = 0;
                var idx = number;

                if (idx === cacheArr[0]) {
                    editNum(number, timeNum);
                } else {
                    while (idx++ < cacheArr[0]) {
                        editNum(++number, ++timeNum);
                    }
                }
            }

            function editNum(domNum, timeNum) {
                var timer = setTimeout(function () {
                    callback && callback.call(null, domNum);
                    if (domNum === cacheArr[0]) {
                        cacheArr.splice(0, 1);
                        clearTimeout(timer);
                        isEdit = false;
                        cacheArr[0] && insertNum();
                    }
                }, NUM_INTERVAL * timeNum)
            }

            function imgLoad(img, cbk) {
                var timer = setInterval(function () {
                    if (img.complete) {
                        clearInterval(timer);
                        timer = null;
                        cbk && cbk();
                    }
                }, IMG_POLL_TIME)
            }
        },

        //滚动加载 - params对象的4个属性， 必填属性（id：滚动对象id），选填属性（wait：滚动停止后多久开始执行，limit：滚动距离底部的最大距离，type：throttle/debounce）。callback：滚动达到距离底部最大距离的回调
        scrollLoad: function (params, callback) {
            if (!params.id) throw '缺少必填属性idName';
            var element = document.getElementById(params.id);
            var fn = callback || function () {
            };
            var wait = params.wait || 50;
            var maxLimit = params.limit || 10;
            var method = params.type === 'throttle' ? commonMethod.throttle : commonMethod.debounce;

            element.addEventListener('scroll', method(function (evt) {
                var scrollHeight = evt.target.clientHeight + evt.target.scrollTop;
                var childrenElement = Array.prototype.slice.apply(evt.target.children);
                var childHeight = childrenElement.reduce(function (prev, cur) {
                    return prev + cur.clientHeight;
                }, 0);
                if (childHeight - scrollHeight <= maxLimit) {
                    fn.apply(null, arguments);
                }

            }, wait), false);
        },

        //判断活动时间是否过期  deadline格式 xxxx-xx-xx xx:xx
        isOutOfDate: function (deadline) {
            var nowDate = new Date().getTime();
            deadline = new Date(deadline).getTime();
            return nowDate >= deadline;
        },

        //抽奖
        lotteryDraw: function (DEG, callback) {
            var startDeg = 0;
            DEG = parseInt(DEG);
            editNum();

            function editNum() {
                var ratio = startDeg / DEG;
                startDeg += (10 - parseInt(ratio * 10));
                var timer = setTimeout(function () {
                    callback && callback.call(null, startDeg);
                    clearTimeout(timer);
                    timer = null;
                    startDeg !== DEG && editNum();
                }, 0);
            }
        },

        //微信分享
        WXShare: function (params, config) {

            if (typeof wx === 'object') {
                shareAndConfig();
            } else {
                var script = document.createElement('script');
                script.src = 'http://res.wx.qq.com/open/js/jweixin-1.4.0.js';
                document.head.appendChild(script);
                script.onload = function () {
                    shareAndConfig();
                }
            }

            function shareAndConfig() {
                if (config) {
                    wx.config({
                        debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                        appId: config.appId, // 必填，公众号的唯一标识
                        timestamp: config.timestamp, // 必填，生成签名的时间戳
                        nonceStr: config.nonceStr, // 必填，生成签名的随机串
                        signature: config.signature,// 必填，签名
                        jsApiList: ['updateTimelineShareData', 'updateAppMessageShareData'] // 必填，需要使用的JS接口列表
                    })
                }
                wx.ready(function () {
                    wx.updateTimelineShareData(params);
                    wx.updateAppMessageShareData(params);
                })
            }
        },

        //页面截图 params属性：idName, scale放大倍数
        htmlToImage: function (params, callback) {
            if (typeof html2canvas !== 'function') throw '请添加html2canvas插件';

            var canvas = document.createElement('canvas');
            var element = document.getElementById(params.idName);
            var style = getComputedStyle(element);
            var scale = params.scale || 2;

            html2canvas(element, {
                useCORS: true,
                allowTaint: true,
                canvas: canvas,
                width: parseFloat(style.width),
                height: parseFloat(style.height),
                scale: scale
            }).then(function (cvs) {
                callback && callback(cvs.toDataURL('image/png'));
            })
        },

        //移动端图片上传，旋转，压缩
        uploadImage: function (file, callback) {
            if (typeof EXIF === 'undefined') throw '请添加exif插件';

            var reader = new FileReader(),
                image = new Image(),
                Orientation = null;

            EXIF.getData(file, function () {
                Orientation = EXIF.getTag(this, 'Orientation');
            });

            reader.onload = function (evt) {
                image.src = evt.target.result;
                image.onload = function () {
                    var imgWidth = this.width;
                    var imgHeight = this.height;

                    //控制图片的宽高
                    if (imgWidth > imgHeight && imgWidth > 750) {
                        imgWidth = 750;
                        imgHeight = Math.ceil(750 * this.height / this.width);
                    }
                    else if (imgWidth < imgHeight && imgHeight > 1334) {
                        imgWidth = Math.ceil(1334 * this.width / this.height);
                        imgHeight = 1334;
                    }

                    var canvas = document.createElement('canvas'),
                        ctx = canvas.getContext('2d');
                    canvas.width = imgWidth;
                    canvas.height = imgHeight;

                    if (Orientation && Orientation !== 1) {
                        switch (Orientation) {
                            case 6:     // 旋转90度
                                canvas.width = imgHeight;
                                canvas.height = imgWidth;
                                ctx.rotate(Math.PI / 2);
                                // (0,-imgHeight) 从旋转原理图那里获得的起始点
                                ctx.drawImage(this, 0, -imgHeight, imgWidth, imgHeight);
                                break;
                            case 3:     // 旋转180度
                                ctx.rotate(Math.PI);
                                ctx.drawImage(this, -imgWidth, -imgHeight, imgWidth, imgHeight);
                                break;
                            case 8:     // 旋转-90度
                                canvas.width = imgHeight;
                                canvas.height = imgWidth;
                                ctx.rotate(3 * Math.PI / 2);
                                ctx.drawImage(this, -imgWidth, 0, imgWidth, imgHeight);
                                break;
                        }
                    } else {
                        ctx.drawImage(this, 0, 0, imgWidth, imgHeight);
                    }

                    callback && callback(canvas.toDataURL('image/png'))
                }
            };

            reader.readAsDataURL(file);
        },

        //添加背景音乐 params: audioAttr, imgSrc, imgStyle
        addMusic: function (params) {
            var audio = document.createElement('audio'),
                img = document.createElement('img'),
                body = document.body,
                imgSrcIsArray = Array.isArray(params.imgSrc) && params.imgSrc.length > 1;

            if (typeof params.audioAttr === 'object') {
                for (var key in params.audioAttr) {
                    audio.setAttribute(key, params.audioAttr[key]);
                }
            }
            img.src = imgSrcIsArray ? params.imgSrc[1] : params.imgSrc;
            img.classList.add('music_pause');

            document.addEventListener("WeixinJSBridgeReady", function () {
                audio.play();
                img.classList.add('music_play');
                img.src = imgSrcIsArray ? params.imgSrc[0] : params.imgSrc;
            }, false);

            typeof params.imgStyle === 'object' && commonMethod.domAddStyle(img, params.imgStyle);
            body.insertBefore(img, body.childNodes[0]);
            body.insertBefore(audio, body.childNodes[0]);

            img.onclick = function (evt) {
                if (evt.target.classList.value.indexOf('music_play') > -1) {
                    audio.pause();
                    evt.target.classList.add('music_pause');
                    evt.target.classList.remove('music_play');
                    imgSrcIsArray && (evt.target.src = params.imgSrc[1]);
                } else {
                    audio.play();
                    evt.target.classList.add('music_play');
                    evt.target.classList.remove('music_pause');
                    imgSrcIsArray && (evt.target.src = params.imgSrc[0]);
                }
            }
        },

        //元素添加拖拽方法
        dragElement: function (className, isLimit) {
            var drag = document.getElementsByClassName(className)[0];
            var x = null,
                y = null,
                start_x = null,
                start_y = null,
                value = [],
                max_x = null,
                max_y = null,
                min_x = null,
                min_y = null;

            if (typeof drag['ontouchstart'] !== 'undefined') {
                drag.addEventListener('touchstart', dragStart, false);
                drag.addEventListener('touchmove', dragMove, false);
                drag.addEventListener('touchend', dragUp, false);
            } else {
                drag.addEventListener('mousedown', dragStart, false);
                document.addEventListener('mousemove', dragMove, false);
                document.addEventListener('mouseup', dragUp, false);
            }

            init();

            function init() {
                var matrix = getComputedStyle(drag).transform;
                if (matrix === 'none') {
                    x = y = 0;
                } else {
                    value = matrix.slice(7, -1).split(',');
                    x = parseInt(value[4]);
                    y = parseInt(value[5]);
                }
                if (isLimit) {
                    var parentWidth = drag.parentNode.clientWidth,
                        parentHeight = drag.parentNode.clientHeight,
                        top = drag.offsetTop,
                        left = drag.offsetLeft,
                        dragWidth = drag.clientWidth,
                        dragHeight = drag.clientHeight,
                        scaleW = 0,
                        scaleH = 0;
                    if (value[0]) {
                        scaleW = dragWidth * (parseFloat(value[0]) - 1) / 2;
                    }
                    if (value[3]) {
                        scaleH = dragHeight * (parseFloat(value[3]) - 1) / 2;
                    }

                    max_x = parentWidth - dragWidth - left - scaleW;
                    max_y = parentHeight - dragHeight - top - scaleH;
                    min_x = -left + scaleW;
                    min_y = -top + scaleH;
                }
            }

            function dragStart(evt) {
                if (evt.touches && evt.touches.length > 1) return;
                start_x = evt.clientX || evt.targetTouches[0].clientX;
                start_y = evt.clientY || evt.targetTouches[0].clientY;
            }

            function dragMove(evt) {
                evt.preventDefault();
                if (start_x && start_y) {
                    if (evt.touches && evt.touches.length > 1) return;
                    var matrix = getComputedStyle(drag).transform;
                    matrix.slice(7, 17) !== value.slice(0, 4).join(',') && init();

                    var move_x = evt.clientX || evt.targetTouches[0].clientX;
                    var move_y = evt.clientY || evt.targetTouches[0].clientY;
                    x += move_x - start_x;
                    y += move_y - start_y;
                    start_x = move_x;
                    start_y = move_y;

                    if (isLimit) {
                        x = x < min_x ? min_x : x;
                        x = x > max_x ? max_x : x;
                        y = y < min_y ? min_y : y;
                        y = y > max_y ? max_y : y;
                    }
                    drag.style.transform = 'matrix(' + (value[0] || 1) + ',' + (value[1] || 0) + ',' + (value[2] || 0) + ',' + (value[3] || 1) + ',' + x + ',' + y + ')';
                }
            }

            function dragUp() {
                start_x = null;
                start_y = null;
            }
        },

        //移动端横屏
        detectOrient: function (className,callback) {
            var container = document.querySelector(className);
            setDomStyle();

            window.addEventListener('resize', function () {
                setDomStyle();
            });

            window.addEventListener('orientationchange', ()=>{
                if(window.orientation === 0){
                    callback && callback.call(null, 'vertical');
                }else{
                    callback && callback.call(null, 'horizontal');
                }
            });

            function setDomStyle() {
                if (window.innerWidth <= window.innerHeight) {
                    commonMethod.domAddStyle(container, getStyle());
                }else{
                    callback && callback.call(null, 'horizontal');
                }
            }

            function getStyle(){
                return {
                    transformOrigin: window.innerWidth / 2 + "px " + window.innerWidth / 2 + "px",
                    transform: 'rotate(90deg)',
                    width: window.innerHeight + 'px',
                    height: window.innerWidth + 'px'
                }
            }
        },

        //双指缩放 limit: max, min
        doubleTouchScale: function (className, limit) {
            var distance = {start: null, stop: null};
            var targetDom = document.getElementsByClassName(className)[0];
            var scale = 1;
            targetDom.style.transformOrigin = '50% 50%';

            function touchStart(evt) {
                if (evt.touches.length > 1) {
                    distance.start = getDistance({
                        x: evt.touches[0].screenX,
                        y: evt.touches[0].screenY
                    }, {
                        x: evt.touches[1].screenX,
                        y: evt.touches[1].screenY
                    });
                }
            }

            function touchMove(evt) {
                if (evt.touches.length === 2) {
                    distance.stop = getDistance({
                        x: evt.touches[0].screenX,
                        y: evt.touches[0].screenY
                    }, {
                        x: evt.touches[1].screenX,
                        y: evt.touches[1].screenY
                    });
                    scale = distance.stop / distance.start;
                    distance.start = distance.stop;
                    updateDom();
                }
            }

            function getDistance(touchOne, touchTwo) {
                return Math.sqrt(Math.pow(touchOne.x - touchTwo.x, 2) + Math.pow(touchOne.y - touchTwo.y, 2));
            }

            function updateDom() {
                var _scale = null, _x = null, _y = null, matrix = [];
                var transform = getComputedStyle(targetDom).transform;
                if (transform === 'none') {
                    _scale = 1;
                    _x = _y = 0;
                } else {
                    matrix = transform.slice(7, -1).split(',');
                    _scale = parseFloat(matrix[0]) * scale;
                    _x = parseFloat(matrix[4]);
                    _y = parseFloat(matrix[5]);
                }

                if (typeof limit === 'object') {
                    _scale = _scale < limit.min ? limit.min : _scale;
                    _scale = _scale > limit.max ? limit.max : _scale;
                }
                targetDom.style.transform = 'matrix(' + _scale + ',' + (matrix[1] || 0) + ',' + (matrix[2] || 0) + ',' + _scale + ',' + _x + ',' + _y + ')';
            }

            targetDom.addEventListener('touchstart', touchStart, false);
            targetDom.addEventListener('touchmove', touchMove, false);
        },

        //添加动画
        animateCSS: function (node, animationName, callback) {
            if (typeof node === 'string') {
                node = document.querySelector(node);
            }

            if (typeof animationName === 'string') {
                if(animationName.indexOf(',')>-1){
                    animationName = animationName.split(',');
                }else{
                    animationName = animationName.split(' ');
                }
            }
            animationName.push('animated');
            node.classList.add.apply(node.classList, animationName);

            function handleAnimationEnd() {
                node.classList.remove.apply(node.classList, animationName);
                node.removeEventListener('animationend', handleAnimationEnd);
                callback && callback();
            }

            node.addEventListener('animationend', handleAnimationEnd);
        },

        //创建图片对象
        createImage: function (src) {
            var image = new Image();
            if (Array.isArray(src)) {
                var imgArray = [];
                src.forEach(function (val) {
                    image.src = val;
                    imgArray.push(image);
                });
                return imgArray;
            } else {
                image.src = src;
                return image;
            }
        },

        //移动端输入框弹出软键盘影响定位处理
        insertStyle: function(){
            var insert = document.querySelectorAll('input,textarea');
            insert.forEach(function(value){
                addEvent(value);
            });
            function addEvent(eventObj){
                eventObj.addEventListener('blur', function(){
                    setTimeout(function () {
                        window.scrollTo(0,0);
                    })
                })
            }
        },

        //获取URL的参数：type: hash || search
        getURLParams: function(type){
            var codeArr = null;
            var hashObj = {};
            if(type === 'search'){
                codeArr = window.location.search && window.location.search.split('?')[1].split('&');
            }
            else if(type === 'hash'){
                codeArr = window.location.hash && window.location.hash.split('#')[1].split('&');
            }

            Array.isArray(codeArr) && codeArr.forEach(function (val) {
                var property = val.split('=');
                hashObj[property[0]] = property[1];
            });

            return hashObj;
        }
    };

    var commonMethod = {

        domAddStyle: function (element, style) {
            for (var key in style) {
                element.style[key] = style[key];
            }
        },

        debounce: function (_fn, _wait) { //去抖
            var timer = null;
            return function () {
                var arg = arguments;
                clearTimeout(timer);
                timer = setTimeout(function () {
                    timer = null;
                    return _fn.apply(null, arg)
                }, _wait)
            }
        },

        throttle: function (_fn, _wait) { //节流
            var timer = null;
            var once = true;
            return function () {
                var arg = arguments;
                if (once) {
                    once = false;
                    return _fn.apply(null, arg);
                }
                if (timer) return;
                timer = setTimeout(function () {
                    clearTimeout(timer);
                    timer = null;
                    _fn.apply(null, arg);
                }, _wait)
            }
        },

        dataURLtoBlob: function (base64) {
            var arr = base64.split(','),
                mime = arr[0].match(/:(.*?);/)[1],
                bString = window.atob(arr[1]),
                n = bString.length,
                u8arr = new Uint8Array(n);
            while (n--) {
                u8arr[n] = bString.charCodeAt(n);
            }
            return new Blob([u8arr], {type: mime});
        }
    };

    Object.assign(_publicMethod, commonMethod);

    if (typeof module !== 'undefined' && typeof exports === 'object') {
        module.exports = _publicMethod;
    } else if (typeof define === 'function' && define.amd) {
        define(function () {
            return _publicMethod;
        });
    } else {
        window._publicMethod = _publicMethod;
    }
})();
