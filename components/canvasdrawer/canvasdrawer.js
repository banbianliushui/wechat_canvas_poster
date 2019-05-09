/* global Component wx */

Component({
    properties: {
        painting: {
            type: Object,
            value: {
                view: []
            },
            observer(newVal, oldVal) {
                if (!this.data.isPainting) {
                    if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
                        if (newVal && newVal.width && newVal.height) {
                            this.setData({
                                showCanvas: true,
                                isPainting: true
                            })
                            this.readyPigment()
                        }
                    } else {
                        if (newVal && newVal.mode !== 'same') {
                            this.triggerEvent('getImage', {
                                errMsg: 'canvasdrawer:samme params'
                            })
                        }
                    }
                }
            }
        }
    },
    data: {
        showCanvas: false,
        width: 100,
        height: 100,
        bgShape: null, //roundRect  round,
        bgStrokeStyle: null,
        bgFillStyle: null,
        bgRadius: 5,
        index: 0,
        imageList: [],
        tempFileList: [],
        tempImagesList: {},
        tempBlockPositionRange: {}, //{1:{LTx:1,LTy:1,LBx:1,LBy:1,1:{...},2:{..}}}, //(LTx,LTy)匿名行左上角坐标，(LBx,LBy)匿名行左下角坐标
        isPainting: false,
        // customParam:null
    },
    ctx: null,
    cache: {},
    ready() {
        wx.removeStorageSync('canvasdrawer_pic_cache')
        this.cache = wx.getStorageSync('canvasdrawer_pic_cache') || {}
        this.ctx = wx.createCanvasContext('canvasdrawer', this)
    },
    methods: {
        readyPigment() {
            const {
                width,
                height,
                bgShape,
                bgFillStyle,
                views,
                //customParam=null
            } = this.data.painting;
            //this.ready();
            this.setData({
                width,
                height,
                bgShape,
                bgFillStyle

            })
            // this.ctx.clearActions()
            // this.ctx.save()
            // this.getImageList(views);
            // this.downLoadImagesAsync((isSuccess) => {
            //     if (isSuccess) {
            //         this.startPainting()
            //     }
            // })

            // const inter = setInterval(() => {
            if (this.ctx) {
                // this.clear();
                this.ctx.clearRect(0, 0, this.data.width, this.data.height);
                this.ctx.clearActions()
                this.ctx.save()
                //this.getImageList(views)
                this.initViews(views);
                this.downLoadImages(0)

            }
            // }, 100)
        },
        clear() {
            //  this.setData({ index: 0, imageList: [], tempFileList: [], cache: {}, tempImagesList: {}, tempBlockPositionRange: {} });
        },
        initViews(views) {

            const imageList = [];
            const tempBlockPositionRange = {};
            for (let i = 0; i < views.length; i++) {
                if (views[i]) {
                    if (views[i].type === 'image') {
                        imageList.push(views[i].url)
                    }
                    if (views[i].range && views[i].range.row) {

                        if (tempBlockPositionRange[views[i].range.row]) {
                            tempBlockPositionRange[views[i].range.row]['views'][i] = views[i];

                            if (views[i].range.col) {
                                tempBlockPositionRange[views[i].range.row][views[i].range.col] = views[i].range;
                                tempBlockPositionRange[views[i].range.row][views[i].range.col]['viewId'] = i;
                            }
                        } else {
                            let originviews = {};
                            originviews[i] = views[i];
                            tempBlockPositionRange[views[i].range.row] = {
                                views: originviews

                            };
                            tempBlockPositionRange[views[i].range.row][originviews.col == null ? 1 : originviews.col] = {}
                        }
                    }
                }
            }

            this.setData({
                imageList,
                tempBlockPositionRange
            })
        },
        downLoadImagesAsync(callback) {
            let index = 0;
            let imageList = this.data.imageList;
            let imgTotal = imageList.length;
            let tempFileList = this.data.tempFileList;
            let tempImagesList = this.data.tempImagesList;
            for (let i = 0; i < imgTotal; i++) {
                this.getImageInfo(imageList[i]).then(file => {
                    index++;
                    if (typeof file === "string") {
                        for (let i = 0; i < tempFileList.length; i++) {
                            if (tempFileList[i].path == file) {
                                tempFileList.push(tempFileList[i]);
                                break;
                            }
                        }

                    } else {
                        tempFileList.push(file);
                        tempImagesList[file.originUrl] = file;
                    }

                    this.setData({
                        tempFileList,
                        tempImagesList
                    })
                    if (index >= imgTotal && callback) {
                        callback(true);
                    }
                }, () => {
                    callback(false);
                })
            }

        },
        getImageList(views) {
            const imageList = []
            for (let i = 0; i < views.length; i++) {
                if (views[i].type === 'image') {
                    imageList.push(views[i].url)
                }
                // else if (views[i].type === 'text_icon' && views[i].icon && views[i].icon.url) {
                //     imageList.push(views[i].icon.url)
                // }
            }
            this.setData({
                imageList
            })
        },
        downLoadImages(index) {
            const {
                imageList,
                tempFileList
            } = this.data

            if (index < imageList.length) {
                this.getImageInfo(imageList[index]).then(file => {
                    if (typeof file === "string") {
                        for (let i = 0; i < tempFileList.length; i++) {
                            if (tempFileList[i].path == file) {
                                tempFileList.push(tempFileList[i]);
                                break;
                            }
                        }
                    } else {
                        tempFileList.push(file)
                    }

                    this.setData({
                        tempFileList
                    })
                    this.downLoadImages(index + 1)
                })
            } else {
                
                this.startPainting()
            }
        },
        startPainting() {
            if (this.data.bgShape) {
                let bgFillStyle = this.data.bgFillStyle == null ? "#ffffff" : this.data.bgFillStyle;
                if (this.data.bgShape == "roundRect") {
                    this.drawRoundRect(0, 0, this.data.width, this.data.height, this.data.bgRadius, this.data.bgFillStyle)
                }

            }
            const {
                tempFileList,
                tempImagesList,
                painting: {
                    views
                }
            } = this.data
            for (let i = 0, imageIndex = 0; i < views.length; i++) {
                if (views[i].type === 'image') {
                    // originUrl
                    //tempImagesList
                    this.drawImage({
                        ...views[i],
                        originWidth: tempFileList[imageIndex].width,
                        originHeight: tempFileList[imageIndex].height,
                        url: tempFileList[imageIndex].path
                        // originWidth: tempImagesList[views[i].url].width,
                        // originHeight: tempImagesList[views[i].url].height,
                        // url: tempImagesList[views[i].url].path
                    })
                    imageIndex++
                } else if (views[i].type === 'text' || views[i].type === 'text_icon') {
                    if (!this.ctx.measureText) {
                        wx.showModal({
                            title: '提示',
                            content: '当前微信版本过低，无法使用 measureText 功能，请升级到最新微信版本后重试。'
                        })
                        this.triggerEvent('getImage', {
                            errMsg: 'canvasdrawer:version too low'
                        })
                        return
                    } else {
                        this.drawText(views[i])
                    }
                } else if (views[i].type === 'rect') {
                    this.drawRect(views[i])
                } else if (views[i].type === 'msgRect') {
                    this.drawMsgRoundRect(views[i])

                } else if (views[i].type === 'roundRect') {
                    this.drawNewRoundRect(views[i])
                }


            }
            this.ctx.draw(false, () => {
                wx.setStorageSync('canvasdrawer_pic_cache', this.cache);
                setTimeout(() => {
                    this.saveImageToLocal()
                }, 500)


            })
        },
        drawNewRoundRect: function (params) {

            let {
                left = 0,
                    top = 0,
                    width = 0,
                    height = 0,
                    maxLineWidth = 0,
                    //otherWidth = 0,
                    radius = 5,
                    fillStyle = null,
                    strokeStyle = null,
                    shadowOffsetX = 0,
                    shadowOffsetY = 0,
                    blur = 0,
                    shadowColor = "black",
                    measure = null,
                    range = {}
            } = params;
            let adjustobj = this.adjustLeftTop({
                range: range,
                left,
                top
            });
            left = adjustobj.left;
            top = adjustobj.top;
            let tempRange = this.data.tempBlockPositionRange;

            let x = left;
            let y = top;
            let w = width;
            let h = height;

            if (w == 0 && measure != null && measure.to == "width") { //一行
                measure.fontSize && this.ctx.setFontSize(measure.fontSize)
                let contentW = this.ctx.measureText(measure.content).width;
                (maxLineWidth > contentW || maxLineWidth <= 0) ? w = contentW: w = maxLineWidth;
                w = w + (measure.otherWidth ? measure.otherWidth : 0);
            }

            if (h == 0 && measure != null && (measure.to == "height" || measure.to == null)) { //多行       
                let result = this.computeTextLine(measure.content, null, measure.width, 0, measure.fontSize);
                if (result.strArr.length > measure.MaxLineNumber) {
                    h = measure.MaxLineNumber * measure.lineHeight + measure.otherHeight;
                } else {
                    h = (result.strArr.length == 0 ? 1 : result.strArr.length) * measure.lineHeight + measure.otherHeight;
                }
            }

            strokeStyle != null && (this.ctx.setStrokeStyle(strokeStyle));
            fillStyle != null && (this.ctx.setFillStyle(fillStyle));
            this.ctx.save(); // 先保存状态 已便于画完圆再用
            this.ctx.beginPath();
            this.ctx.arc(x + radius, y + radius, radius, 1 * Math.PI, 1.5 * Math.PI, false);
            this.ctx.lineTo(x + w - 1 * radius, y);
            this.ctx.arc(x + w - 1 * radius, radius + y, radius, 1.5 * Math.PI, 2 * Math.PI, false);
            this.ctx.lineTo(x + w, y + h - 1 * radius);
            this.ctx.arc(x + w - 1 * radius, y + h - 1 * radius, radius, 0, 0.5 * Math.PI, false);
            this.ctx.lineTo(x + radius, y + h);
            this.ctx.arc(x + radius, y + h - radius, radius, 0.5 * Math.PI, 1 * Math.PI, false);
            this.ctx.lineTo(x, y + radius);
            this.ctx.fill();
            if (params.range) {
                this.adjustElemRange({
                    range: params.range,
                    left: x,
                    top: y,
                    width: w,
                    height: h
                });
            }
        },
        //new
        drawRoundRect: function (x, y, w, h, radius, fillStyle, strokeStyle) {
            strokeStyle != null && (this.ctx.setStrokeStyle(strokeStyle));
            fillStyle != null && (this.ctx.setFillStyle(fillStyle));
            let radiuslist = [];
            if (typeof radius == "number") {
                radiuslist = [radius, radius, radius, radius]
            } else if (Array.isArray(radius)) {
                radiuslist = radius;
                [radius, radius, radius, radius]
            }
            this.ctx.save(); // 先保存状态 已便于画完圆再用
            this.ctx.beginPath();
            this.ctx.arc(x + radiuslist[0], y + radiuslist[0], radiuslist[0], 1 * Math.PI, 1.5 * Math.PI, false);
            this.ctx.lineTo(x + w - 1 * radiuslist[1], y);
            this.ctx.arc(x + w - 1 * radiuslist[1], radiuslist[1] + y, radiuslist[1], 1.5 * Math.PI, 2 * Math.PI, false);
            this.ctx.lineTo(x + w, y + h - 1 * radiuslist[2]);
            this.ctx.arc(x + w - 1 * radiuslist[2], y + h - 1 * radiuslist[2], radiuslist[2], 0, 0.5 * Math.PI, false);
            this.ctx.lineTo(x + radiuslist[3], y + h);
            this.ctx.arc(x + radiuslist[3], y + h - radiuslist[3], radiuslist[3], 0.5 * Math.PI, 1 * Math.PI, false);
            this.ctx.lineTo(x, y + radiuslist[0]);
            this.ctx.fill();
        },
        drawMsgRoundRect: function (params) {

            let {
                left = 0,
                    top = 0,
                    width = 0,
                    height = 0,
                    triangleTop = 0,
                    triangleWidth = 12,
                    radius = 5,
                    fillStyle = "#ffffff",
                    strokeStyle = "#000000",
                    shadowOffsetX = 0,
                    shadowOffsetY = 0,
                    blur = 0,
                    shadowColor = "black",
                    measure = null,
                    range = {}
            } = params;
            let adjustobj = this.adjustLeftTop({
                range: range,
                left,
                top
            });
            left = adjustobj.left;
            top = adjustobj.top;
            let tempRange = this.data.tempBlockPositionRange;
            let x = left;
            let y = top;
            let w = width;
            let h = height;
            if (h == 0 && measure != null) {
                let result = this.computeTextLine(measure.content, null, measure.width, 0, measure.fontSize);
                if (result.strArr.length > measure.MaxLineNumber) {
                    h = measure.MaxLineNumber * measure.lineHeight + measure.otherHeight;
                } else {
                    h = (result.strArr.length == 0 ? 1 : result.strArr.length) * measure.lineHeight + measure.otherHeight;
                }

            }

            strokeStyle != null && (this.ctx.setStrokeStyle(strokeStyle));
            fillStyle != null && (this.ctx.setFillStyle(fillStyle));

            this.ctx.save(); // 先保存状态 已便于画完圆再用
            this.ctx.beginPath();
            this.ctx.arc(x + radius, y + radius, radius, 1 * Math.PI, 1.5 * Math.PI, false);
            this.ctx.lineTo(x + w - 1 * radius, y);
            this.ctx.arc(x + w - 1 * radius, radius + y, radius, 1.5 * Math.PI, 2 * Math.PI, false);
            this.ctx.lineTo(x + w, y + h - 1 * radius);
            this.ctx.arc(x + w - 1 * radius, y + h - 1 * radius, radius, 0, 0.5 * Math.PI, false);
            this.ctx.lineTo(x + radius, y + h);
            this.ctx.arc(x + radius, y + h - radius, radius, 0.5 * Math.PI, 1 * Math.PI, false);

            this.ctx.lineTo(x, y + radius + triangleWidth + triangleTop);
            this.ctx.lineTo(x + triangleWidth * Math.cos(2 * Math.PI * 1 / 3), y + radius + triangleWidth / 2 + triangleTop);
            this.ctx.lineTo(x, y + radius + triangleTop);
            this.ctx.lineTo(x, y + radius);
            this.ctx.setShadow(shadowOffsetX, shadowOffsetY, blur, shadowColor)
            this.ctx.fill();

            if (params.range) {
                this.adjustElemRange({
                    range: params.range,
                    left: x,
                    top: y,
                    width: w,
                    height: h
                });
            }

        },
        computeTextLine: function (str, fontStyle, defWidth, firstX, fontSize) {
            // ctx.font = (fontStyle || '14px');
            this.ctx.setFontSize(fontSize)
            let measure = this.ctx.measureText(str)
            let strArr = [];
            let currentLineWidth = firstX || 0;
            let lastSubStrIndex = 0;
            let lastWidth = 0;

            for (let i = 0; i < str.length; i++) {
                currentLineWidth += this.ctx.measureText(str[i]).width;
                if (currentLineWidth > defWidth) {

                    strArr.push(str.substring(lastSubStrIndex, i));
                    currentLineWidth = 0;
                    lastSubStrIndex = i;

                }
                if (i == str.length - 1) {
                    let laststr = str.substring(lastSubStrIndex, i + 1);
                    lastWidth = this.ctx.measureText(laststr)
                    strArr.push(laststr);

                }
            }
            return {
                strArr: strArr,
                width: measure.width,
                lastLineWidth: lastWidth.width,
            }
        },
        //new
        drawCircle(x, y, radius) {
            this.ctx.save(); // 先保存状态 已便于画完圆再用
            this.ctx.beginPath(); //开始绘制
            //先画个圆
            this.ctx.arc(x, y, radius, 0, Math.PI * 2, false);
        },
        drawImage(params) {
            this.ctx.save()
            let {
                url,
                originWidth,
                originHeight,
                top = 0,
                left = 0,
                width = 0,
                height = 0,
                borderRadius = 0,
                mode = null,
                bgShape = null,
                range = null
            } = params;
            // console.log(params);
            let sWidth = originWidth; //图片宽度
            let sHeight = originHeight; //图片高度
            let sx = 0;
            let sy = 0;
            let adjustobj = this.adjustLeftTop({
                range: range,
                left,
                top
            });
            left = adjustobj.left;
            top = adjustobj.top;
            let tempRange = this.data.tempBlockPositionRange;
            // if (range && (range.referRow || range.referCol)) {
            //     if (range.referRow && !range.referCol) { //距离参照行
            //         if (!range.referAlign || range.referAlign === "leftBottom") {
            //             left = left + tempRange[range.referRow]['LBx'];
            //             top = top + tempRange[range.referRow]['LBy'];
            //         }

            //     }
            // }
            // if (mode && mode == "aspectFit") { //长边展示
            //     if (height != 0 && width / height > originWidth / originHeight) { //originHeight需截高度中间部分
            //         sHeight = originWidth * height / width;
            //         sy = (originHeight - sHeight) / 2;
            //     } else if (height != 0 && width / height < originWidth / originHeight) {
            //         sWidth = originHeight * width / height;
            //         sx = (originWidth - sWidth) / 2;
            //     }
            // }
            if (mode && mode == "aspectFill") { //短边展示
                if (height != 0 && width / height > originWidth / originHeight) { //originHeight需截高度中间部分
                    (sWidth < width) && (sWidth = width);
                    sHeight = sWidth * height / width;
                    sy = (originHeight - sHeight) / 2;
                } else if (height != 0 && width / height < originWidth / originHeight) {
                    (sHeight < height) && (sHeight = height);
                    sWidth = sHeight * width / height;
                    sx = (originWidth - sWidth) / 2;
                }
            }
            if (bgShape && bgShape == "round") {
                // if(sWidth>sHeight){
                //     (sWidth-sHeight)/2
                // }
                this.drawCircle(left + width / 2, top + width / 2, width / 2);
                this.ctx.clip();

            } else if (bgShape && bgShape == "roundRect") {
                // if(sWidth>sHeight){
                //     (sWidth-sHeight)/2
                // }
                //this.drawCircle(left + width / 2, top + width / 2, width / 2);
                this.drawRoundRect(left, top, width, height, borderRadius, null, null)
                this.ctx.clip();

            }
            // if (borderRadius) {
            //   this.ctx.beginPath()
            //   this.ctx.arc(left + borderRadius, top + borderRadius, borderRadius, 0, 2 * Math.PI)
            //   this.ctx.clip()
            //   this.ctx.drawImage(url, left, top, width, height)
            // } else {
            this.ctx.drawImage(url, sx, sy, sWidth, sHeight, left, top, width, height)
            // }

            if (params.range) {
                this.adjustElemRange({
                    range: params.range,
                    left: left,
                    top: top,
                    width: width,
                    height: height
                });
            }
            this.ctx.restore()
        },
        drawText(params) {
            this.ctx.save()
            let {
                MaxLineNumber = 2,
                    breakWord = false,
                    color = 'black',
                    content = '',
                    fontSize = 16,
                    top = 0,
                    left = 0,
                    lineHeight = 20,
                    textAlign = 'left',
                    width,
                    bolder = false,
                    bold = false,
                    indent = null,
                    textDecoration = 'none',
                    type = "text",
                    icon = null,

                    range = null
            } = params

            this.ctx.beginPath()
            this.ctx.setTextBaseline('top')
            this.ctx.setTextAlign(textAlign)
            this.ctx.setFillStyle(color)
            this.ctx.setFontSize(fontSize)

            let tempRange = this.data.tempBlockPositionRange;

            let adjustobj = this.adjustLeftTop({
                range: range,
                left,
                top
            });
            left = adjustobj.left;
            top = adjustobj.top;

            if (type === "text_icon" && icon) {
                if (icon.url) {
                    // wx.getImageInfo({
                    //     src: icon.url,
                    //     complete: res => {
                    let measureWidth = this.ctx.measureText(content).width;
                    if (measureWidth < width && textAlign == "center") {
                        let wideWidth = 2 * left;
                        let x = (wideWidth - width) / 2; //文本框距左侧的位置
                        left = x + (width - (icon.width + (icon.iconRight ? icon.iconRight : 0) + measureWidth)) / 2;
                        this.ctx.setTextAlign("left")
                    }
                    this.ctx.save()
                    let iconTop = top;
                    let iconLeft = left;
                    if (icon.iconTop) {
                        iconTop = top + icon.iconTop;
                    }
                    if (icon.iconLeft) {
                        iconLeft = iconLeft + icon.iconLeft;
                    }
                    this.ctx.drawImage(icon.url, iconLeft, iconTop, icon.width, icon.height);
                    left = left + icon.width + (icon.iconRight ? icon.iconRight : 0);
                    this.ctx.restore()
                    this.drawSimpleText(MaxLineNumber, breakWord,
                        color, content, fontSize, top, left, lineHeight, textAlign, width, bolder,
                        textDecoration, type, icon, params)
                    //     }
                    // })
                }
            } else {
                // this.ctx.restore();
                this.drawNewSimpleText({
                    MaxLineNumber,
                    breakWord,
                    color,
                    content,
                    fontSize,
                    top,
                    left,
                    lineHeight,
                    textAlign,
                    width,
                    bolder,
                    textDecoration,
                    type,
                    icon,
                    indent,
                    params
                })
                // this.drawSimpleText(MaxLineNumber, breakWord,
                //     color, content, fontSize, top, left, lineHeight, textAlign, width, bolder,
                //     textDecoration, type, icon, params)
            }


        },
        adjustLeftTop(params) {

            let {
                range = null, left = 0, top = 0
            } = params;
            let tempRange = this.data.tempBlockPositionRange;
            if (range && (range.referRow || range.referCol)) {
                if (range.referRow && !range.referCol) { //距离参照行
                    if (!range.referAlign || range.referAlign === "leftBottom") {
                        left = left + tempRange[range.referRow]['LBx'];
                        top = top + tempRange[range.referRow]['LBy'];
                    } else if (range.referAlign === "leftTop") {
                        left = left + tempRange[range.referRow]['LTx'];
                        top = top + tempRange[range.referRow]['LTy'];
                    } else if (!range.referAlign || range.referAlign === "rightTop") {
                        left = left + tempRange[range.referRow]['RTx'];
                        top = top + tempRange[range.referRow]['RTy'];
                    } else if (!range.referAlign || range.referAlign === "rightBottom") {
                        left = left + tempRange[range.referRow]['RBx'];
                        top = top + tempRange[range.referRow]['RBy'];
                    }


                }
                if (range.referRow && range.referCol) {
                    if (!range.referAlign || range.referAlign === "rightTop") {
                        left = left + tempRange[range.referRow][range.referCol]['RTx'];
                        top = top + tempRange[range.referRow][range.referCol]['RTy'];
                    } else if (range.referAlign === "leftTop") {
                        left = left + tempRange[range.referRow][range.referCol]['LTx'];
                        top = top + tempRange[range.referRow][range.referCol]['LTy'];
                    } else if (range.referAlign === "leftBottom") {
                        left = left + tempRange[range.referRow][range.referCol]['LBx'];
                        top = top + tempRange[range.referRow][range.referCol]['LBy'];
                    } else if (!range.referAlign || range.referAlign === "rightBottom") {
                        left = left + tempRange[range.referRow][range.referCol]['RBx'];
                        top = top + tempRange[range.referRow][range.referCol]['RBy'];
                    }

                }
            }
            return {
                left: left,
                top: top
            };
        },
        adjustElemRange(params) {
            let tempRange = this.data.tempBlockPositionRange;
            let {
                range = null, left = 0, top = 0, width = 0, height = 0
            } = params
            if (range != null) {
                //LTx LTy  LBx LBy RTx RTy  RBx RBy

                if (range.col == null) {
                    range.col = 1;
                }
                if (tempRange[range.row][range.col] == null) tempRange[range.row][range.col] = {};
                tempRange[range.row][range.col]['LTx'] = left;
                tempRange[range.row][range.col]['LTy'] = top;
                tempRange[range.row][range.col]['LBx'] = left;
                tempRange[range.row][range.col]['LBy'] = top + height;
                tempRange[range.row][range.col]['RTx'] = left + width;
                tempRange[range.row][range.col]['RTy'] = top;
                tempRange[range.row][range.col]['RBx'] = left + width;
                tempRange[range.row][range.col]['RBy'] = top + height;
                if (range.col == 1) {
                    tempRange[range.row]['LTx'] = left;
                    tempRange[range.row]['LTy'] = top;
                    tempRange[range.row]['LBx'] = left;
                    tempRange[range.row]['LBy'] = top + height;
                    tempRange[range.row]['RTx'] = left + width;
                    tempRange[range.row]['RTy'] = top;
                    tempRange[range.row]['RBx'] = left + width;
                    tempRange[range.row]['RBy'] = top + height;
                } else {
                    if (left + width > tempRange[range.row]['RTx']) {
                        tempRange[range.row]['RTx'] = left + width;
                        tempRange[range.row]['RBx'] = left + width;
                    }
                    if (top + height > tempRange[range.row]['RBy']) {
                        tempRange[range.row]['RBy'] = top + height;
                    }
                    if (top > tempRange[range.row]['RTy']) {
                        tempRange[range.row]['RTy'] = top;
                    }
                }
                this.setData({
                    tempBlockPositionRange: tempRange
                })
            }
        },
        drawNewSimpleText({
            MaxLineNumber = null,
            breakWord = null,
            color = "#000000",
            content = null,
            fontSize = 12,
            top = 0,
            left = 0,
            lineHeight = 12,
            textAlign = null,
            width = 0,
            bolder = false,
            textDecoration = null,
            type = null,
            icon = null,
            indent = null,
            params = {}
        } = {}) {
            this.ctx.save()
            // if(params.bold){
            //    this.ctx.font = 'normal bold';
            //  }
            let newIndent = indent;
            if (indent) {
                if (typeof indent == "number") {

                } else {
                    //content: '拼团优惠',
                    if (indent != null) { //一行
                        indent.fontSize && this.ctx.setFontSize(indent.fontSize)
                        newIndent = this.ctx.measureText(indent.content).width;
                        // (maxLineWidth > contentW || maxLineWidth <= 0) ? w = contentW: w = maxLineWidth;
                        // w = w + (measure.otherWidth ? measure.otherWidth : 0);
                        newIndent = newIndent + (indent.otherWidth ? indent.otherWidth : 0);
                    }
                }
            }
            if (newIndent == null) {
                newIndent = 0;
            }
            this.ctx.setFontSize(fontSize)
            let maxLineWidth = ((this.ctx.measureText(content).width > width && width != 0) ? width : this.ctx.measureText(content).width);
            let totalHeight = fontSize;
            if (!breakWord) { //不换行
                this.ctx.fillText(content, left + newIndent, top)
                this.drawTextLine(left, top, textDecoration, color, fontSize, content)
            } else {
                let fillText = ''
                let fillTop = top
                let lineNum = 1
                for (let i = 0; i < content.length; i++) {
                    fillText += [content[i]];
                    if (this.isEmojiCharacter(content, i)) {
                        continue;
                    }
                    if ((lineNum == 1 ? this.ctx.measureText(fillText).width + newIndent : this.ctx.measureText(fillText).width) > width) { //输出整行
                        if (lineNum === MaxLineNumber) {
                            if (i !== content.length) {
                                fillText = fillText.substring(0, fillText.length - 1) + '...'
                                this.ctx.fillText(fillText, i == 0 ? left + newIndent : left, fillTop)
                                this.drawTextLine(i == 0 ? left + newIndent : left, fillTop, textDecoration, color, fontSize, fillText)
                                fillText = ''
                                break
                            }
                        }
                        this.ctx.fillText(fillText, lineNum == 1 ? left + newIndent : left, fillTop)
                        this.drawTextLine(lineNum == 1 ? left + newIndent : left, fillTop, textDecoration, color, fontSize, fillText)
                        fillText = ''
                        fillTop += lineHeight
                        lineNum++
                    }
                }


                this.ctx.fillText(fillText, lineNum == 1 ? left + newIndent : left, fillTop)
                this.drawTextLine(lineNum == 1 ? left + newIndent : left, fillTop, textDecoration, color, fontSize, fillText)
                totalHeight = fillTop + lineHeight - top;
            }

            if (params.range) {
                this.adjustElemRange({
                    range: params.range,
                    left: left,
                    top: top,
                    width: maxLineWidth,
                    height: totalHeight
                });
            }
            this.ctx.restore()

            if (bolder) {
                this.drawText({
                    ...params,
                    left: left + 0.3,
                    top: top + 0.3,
                    bolder: false,
                    textDecoration: 'none'
                })
            }
        },
        drawSimpleText(MaxLineNumber, breakWord,
            color, content, fontSize, top,
            left, lineHeight, textAlign, width,
            bolder, textDecoration, type, icon, params) {
            // if(params.bold){
            //    this.ctx.font = 'normal bold';
            //  }

            let maxLineWidth = (this.ctx.measureText(content).width > width ? width : this.ctx.measureText(content).width);
            let totalHeight = fontSize;
            if (!breakWord) { //不换行
                this.ctx.fillText(content, left, top)
                this.drawTextLine(left, top, textDecoration, color, fontSize, content)
            } else {
                let fillText = ''
                let fillTop = top
                let lineNum = 1
                for (let i = 0; i < content.length; i++) {
                    fillText += [content[i]]
                    if (this.ctx.measureText(fillText).width > width) { //输出整行
                        if (lineNum === MaxLineNumber) {
                            if (i !== content.length) {
                                fillText = fillText.substring(0, fillText.length - 1) + '...'
                                this.ctx.fillText(fillText, left, fillTop)
                                this.drawTextLine(left, fillTop, textDecoration, color, fontSize, fillText)
                                fillText = ''
                                break
                            }
                        }
                        this.ctx.fillText(fillText, left, fillTop)
                        this.drawTextLine(left, fillTop, textDecoration, color, fontSize, fillText)
                        fillText = ''
                        fillTop += lineHeight
                        lineNum++
                    }
                }


                this.ctx.fillText(fillText, left, fillTop)
                this.drawTextLine(left, fillTop, textDecoration, color, fontSize, fillText)
                totalHeight = fillTop + lineHeight - top;
            }

            if (params.range) {
                this.adjustElemRange({
                    range: params.range,
                    left: left,
                    top: top,
                    width: maxLineWidth,
                    height: totalHeight
                });
            }
            this.ctx.restore()

            if (bolder) {
                this.drawText({
                    ...params,
                    left: left + 0.3,
                    top: top + 0.3,
                    bolder: false,
                    textDecoration: 'none'
                })
            }
        },
        drawTextLine(left, top, textDecoration, color, fontSize, content) {
            if (textDecoration === 'underline') {
                this.drawRect({
                    background: color,
                    top: top + fontSize * 1.2,
                    left: left - 1,
                    width: this.ctx.measureText(content).width + 3,
                    height: 1
                })
            } else if (textDecoration === 'line-through') {
                this.drawRect({
                    background: color,
                    top: top + fontSize * 0.6,
                    left: left - 1,
                    width: this.ctx.measureText(content).width + 3,
                    height: 1
                })
            }
        },
        drawRect(params) {
            this.ctx.save()
            const {
                background,
                top = 0,
                left = 0,
                width = 0,
                height = 0
            } = params
            this.ctx.setFillStyle(background)
            this.ctx.fillRect(left, top, width, height)
            this.ctx.restore()
        },
        getImageInfo(url) {
            return new Promise((resolve, reject) => {
                if (this.cache[url]) {
                    resolve(this.cache[url])
                } else {
                    const objExp = new RegExp(/^http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/)
                    if (objExp.test(url)) {
                        wx.getImageInfo({
                            src: url,
                            complete: res => {
                                if (res.errMsg === 'getImageInfo:ok') {
                                    this.cache[url] = res;
                                    res.originUrl = url;                                   
                                    resolve(res)
                                } else {

                                    this.triggerEvent('getImage', {
                                        errMsg: 'canvasdrawer:download fail'
                                    })
                                    reject(new Error('getImageInfo fail ' + url))
                                }
                            }
                        })
                    } else {
                        this.cache[url] = url
                        resolve({
                            path: url
                        })
                    }
                }
            })
        },
        isEmojiCharacter(strs, i) {
            //字符串中的第一个字符是否是emoji
            //for (let i = index; i < strs.length; i++) {
            let currentCode = strs.charCodeAt(i);
            if (0xd800 <= currentCode && currentCode <= 0xdbff) {
                var afterCode = strs.charCodeAt(i + 1);
                var uc = (currentCode - 0xd800) * 0x400 + (afterCode - 0xdc00) + 0x10000;
                if (0x1d000 <= uc && uc <= 0x1f77f) {
                    return true;
                }
            } else if (i + 1 < strs.length) {
                var afterCode = strs.charCodeAt(i + 1);
                if (afterCode == 0x20e3) {
                    return true;
                }
            }
            if (0x2100 <= currentCode && currentCode <= 0x27ff) {
                return true;
            } else if (0x2b05 <= currentCode && currentCode <= 0x2b07) {
                return true;
            } else if (0x2934 <= currentCode && currentCode <= 0x2935) {
                return true;
            } else if (0x3297 <= currentCode && currentCode <= 0x3299) {
                return true;
            } else if (
                currentCode == 0xa9 ||
                currentCode == 0xae ||
                currentCode == 0x303d ||
                currentCode == 0x3030 ||
                currentCode == 0x2b55 ||
                currentCode == 0x2b1c ||
                currentCode == 0x2b1b ||
                currentCode == 0x2b50
            ) {
                return true;
            }
            //  }
            return false;
        },
        saveImageToLocal() {
            const {
                width,
                height
            } = this.data
            wx.canvasToTempFilePath({
                x: 0,
                y: 0,
                width,
                height,
                destWidth: width * 6,
                destHeight: height * 6,
                //  quality:1,
                // fileType:'jpg',
                canvasId: 'canvasdrawer',
                complete: res => {
                    if (res.errMsg === 'canvasToTempFilePath:ok') {
                        //   this.setData({ index: 0, imageList: [], tempFileList: [], cache: {}, tempImagesList: {}, tempBlockPositionRange: {} });
                        this.setData({
                            showCanvas: false,
                            isPainting: false,
                            imageList: [],
                            tempFileList: [],
                            tempImagesList: {},
                            tempBlockPositionRange: {}
                        })
                        this.triggerEvent('getImage', {
                            tempFilePath: res.tempFilePath,
                            customParam: this.data.painting.customParam,
                            errMsg: 'canvasdrawer:ok'
                        })
                    } else {
                        this.triggerEvent('getImage', {
                            errMsg: 'canvasdrawer:fail'
                        })
                    }
                }
            }, this)
        }
    }
})



/* 

{
    width: 287,
            height: 499,
            clear: true,
            bgShape: 'roundRect', //roundRect  round,
            bgFillStyle: '#ffffff',
views:[{
                    type: 'text_icon',
                    content: '颜铺SPA馆',
                    fontSize: 16,
                    color: '#333333',
                    textAlign: 'center',
                    top: 20,
                    left: 143.5,
                    lineHeight: 20,
                    MaxLineNumber: 1,
                    breakWord: true,
                    width: 125,
                    icon: {//可选
                        url: '/static/shop_icon.png',
                        width: 17,
                        height: 16,
                        type: 'prefix', //suffix  prefix 
                        iconTop: 1, //可选  相对于文本的
                        iconLeft:1,//可选 

                    }
                },
                {
                    type: 'image',
                    url: 'https://asset.imuge.net/FpndfxCTwD3aAa4MTBDcfk-7w0OI',
                    top: 50,
                    left: 9,
                    width: 270,
                    height: 210,
                    mode: 'aspectFit'
                },
                {
                    type: 'text',
                    content: ' 藕粉桂💰花😯糖🏃糕哦是的群我IE一诶诶1113232殴我就方可进入滴滴滴',
                    fontSize: 14,
                    color: '#333333',
                    textAlign: 'left',
                    top: 240,
                    left: 10,
                    lineHeight: 20,
                    MaxLineNumber: 2,
                    breakWord: true,
                    width: 260,
                   
                    range: {//相对布局，可选
                        row: 1,
                        col: 1
                    },
                    {
                    type: 'text',
                    content: '“可视对讲付款时间的可视对讲付款时间的反馈可视对讲付款时间的反馈世纪东方”',
                    fontSize: 12,
                    color: '#333333',
                    textAlign: 'left',
                    top: 2,
                    left: 14,
                    lineHeight: 16,
                    MaxLineNumber: 2,
                    breakWord: true,
                    width: 198,
                    range: {
                        row: 3,
                        col: 3,
                        referRow: 3, //相对时必选，参照时可选。参照的行,只有行则相对于第二行的左下角
                        referCol: 2,//可选
                        referAlign: 'leftTop'//可选
                    }

                },
                },]
}

*/