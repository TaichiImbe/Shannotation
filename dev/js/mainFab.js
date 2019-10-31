var fabric = require('fabric').fabric;
var profile = require('./profile');
var Canvas = new fabric.Canvas('draw-area', {
    isDrawingMode: true,
    selection: false,
    stateful: true
});
// console.log(Canvas);
var Pen;
var identifier = ['enclosure', 'line'];
var AnnoCollection = new Map();
function setCanvasSize(viewport) {
    Canvas.setWidth(viewport.width);
    Canvas.setHeight(viewport.height);
}

//水色,青,緑,黄色,橙色,赤
//カラー参考サイト http://www.netyasun.com/home/color.html
var colorVariation = ['#8EF1FF', '#5D99FF', '#9BF9CC', '#FFFF66', '#FF6928', '#FF3333']
window.addEventListener('load', () => {
    // function init(viewport) {
    // const pd = Canvas.getElementById('pdfCan');
    // console.log('Event');


    fabric.Object.prototype.transparentCorners = false;
    Canvas.freeDrawingBrush = new fabric.PencilBrush(Canvas);
    Canvas.freeDrawingBrush.color = 'rgb(0,0,0)';
    Canvas.freeDrawingBrush.width = 5;
    Canvas.freeDrawingBrush.shadowBlur = 0;
    Canvas.hoverCursor = 'move';
    console.log("Fabric" + Canvas);
    Pen = new profile.Pencile(Canvas.freeDrawingBrush.color, Canvas.freeDrawingBrush.width, Canvas.freeDrawingBrush.shadowBlur);
    // }
});

Canvas.on('object:selected', function (e) {
    console.log(e.target);
})

Canvas.on('object:added', function (e) {
    // console.log(e.target);
    let object = e.target;
    // Canvas.getObjects().forEach(element => {
    // console.log(element);
    // });
    let time = new Date();
    let y = time.getFullYear();
    let m = ("00" + (time.getMonth() + 1)).slice(-2);
    let d = ("00" + time.getDate()).slice(-2);
    let hh = ("00" + time.getHours()).slice(-2);
    let mm = ("00" + time.getMinutes()).slice(-2);
    let ss = ("00" + time.getSeconds()).slice(-2);
    // logPrint(time);
    let realTime = y + "/" + m + "/" + d + " " + hh + ":" + mm + ":" + ss
    // logPrint(y+"/"+m+"/"+d+" "+hh+":"+mm+":"+ss);
    // logPrint(e);
    //消しゴムモードが起動している時
    //todo データを消した後のサーバー処理(delet命令)
    if (eraserMode) {
        Canvas.remove(object);
        Canvas.getObjects().forEach(element => {
            element.path.forEach(path => {
                if (coverd(path, object)) {
                    Canvas.remove(element);
                }
                // object.path.forEach(data => {
                //     // console.log(corverd(path, data));
                //     if (coverd(path, data)) {
                //     }
                // });
            });
        });
    } else {
        ident = identification(object);

        AnnoCollection.set(realTime, e.target);
        getPdfText(pageNum).then(function (text) {
            // var font = textCheck(object,text);
            console.log(text);
            var font = (function (object, text) {
                oCoords = object.oCoords;
                var str;
                // for (i = text.items.length-1; i >= 0 ; i--) {
                let sum = 0;
                for (let i = 0; i < text.items.length; i++) {
                    sum += text.items[i].height;
                }
                const thresh = sum / text.items.length;
                let subtextlist = [];
                let subsubtextlist = [];
                var minr = Math.sqrt(Math.pow((text.items[0].transform[4] + text.items[0].width) - oCoords.br.x, 2) + Math.pow(text.items[0].transform[5] - oCoords.br.y, 2));
                for (i = 0; i < text.items.length; i++) {
                    if (oCoords.bl.y - thresh <= text.items[i].transform[5] && text.items[i].transform[5] <= oCoords.bl.y + (thresh / 2)) {
                        if (oCoords.bl.x - thresh <= text.items[i].transform[4] && oCoords.br.x >= text.items[i].transform[4]) {
                            // console.log(text.items[i]);
                            subsubtextlist.push(text.items[i]);
                        }
                        subtextlist.push(text.items[i]);
                    }
                }
                if (subsubtextlist.length != 0) {

                    let subtext = '';
                    let subwidth = 0;
                    for (i = 0; i < subsubtextlist.length; i++) {
                        subtext += subsubtextlist[i].str;
                        subwidth += subsubtextlist[i].width;

                    }
                    str = subsubtextlist[0];
                    str.str = subtext;
                    str.width = subwidth;
                } else {

                    let minl = Math.sqrt(Math.pow(subtextlist[0].transform[4] - oCoords.bl.x, 2) + Math.pow(subtextlist[0].transform[5] - oCoords.bl.y, 2));
                    str = subtextlist[0];

                    for (i = 1; i < subtextlist.length; i++) {

                        if (minl > Math.sqrt(Math.pow(subtextlist[i].transform[4] - oCoords.bl.x, 2) + Math.pow(subtextlist[i].transform[5] - oCoords.bl.y, 2))) {
                            minil = Math.sqrt(Math.pow(subtextlist[i].transform[4] - oCoords.bl.x, 2) + Math.pow(subtextlist[i].transform[5] - oCoords.bl.y, 2));
                            str = subtextlist[i];
                        }
                    }
                }

                // console.log(oCoords);
                console.log(str);
                var charSize = str.width / str.str.length;
                var width = 0;
                var transform = str.transform;
                var t4 = str.transform[4];
                var substring = '';
                for (i = 0; i < str.str.length; i++) {
                    if (t4 <= oCoords.bl.x && t4 + str.height >= oCoords.bl.x) {
                        substring += str.str[i];
                        transform[4] = t4;
                    }
                    if (t4 >= oCoords.bl.x && oCoords.br.x >= t4) {
                        substring += str.str[i];
                        width += str.height;
                    }
                    if (t4 > oCoords.br.x) {
                        break;
                    }
                    t4 += str.height;
                }
                return new newString(substring, str.height, width, transform);
            })(object, text);
            // console.log(font);
            // console.log(object.oCoords);
            if (!pageTrans) {
                // console.log("Ad");
                send('object', e.target, e.target.oCoords, pageNum, ident, font, realTime);
            }
        });
    }
});

/**
 *  識別
 *
 * @param {*} canvas
 * @returns
 */
function identification(canvas) {
    oCoords = canvas.oCoords;
    tl = oCoords.tl;
    bl = oCoords.bl;
    tr = oCoords.tr;
    var double = function (l1, l2) {
        return Math.pow(l1.x - l2.x, 2) + Math.pow(l1.y - l2.y, 2);
    }
    var d = function (x1, x2) {
        return Math.sqrt(double(x1, x2));
    }
    if (d(tl, bl) < 49) {
        return identifier[1];
    } else if (d(tl, tr) < 49) {
        return identifier[1];
    } else {
        return identifier[0];
    }
}


/**
 * 消しゴム用
 * バウンディングボックスが線をまたいでいるか
 * @param {*} path
 * @param {*} data
 * @returns
 */
function coverd(path, data) {
    r = Math.round;
    // console.log(data.oCoords);
    // console.log(path);
    let bl = data.oCoords.bl,
        br = data.oCoords.br,
        tl = data.oCoords.tl;
    for (i = 1; i < path.length; i += 2) {
        // console.log(path[i]);
        if (bl.x < path[i] && br.x > path[i]) {
            // console.log(path);
            if (bl.y > r(path[i + 1]) && tl.y < r(path[i + 1])) {
                return true;
            }
        }
    }
    return false;
}

/**
 * 書き込み情報に付随するテキスト情報を取得
 * 無名関数にしたため現在は使用停止
 * @param {*} canvas
 * @param {*} text
 */
function textCheck(canvas, text) {
    var oCoords = canvas.oCoords;
    // for (item in text.item) {
    //     console.log(item);
    //     if(item.transform[5] < oCoords.br.y) {
    //         // return item;
    //     }
    // }
    for (i = 0; i < text.items.length; i++) {
        if (text.items[i].transform[5] < oCoords.br.y) {
            return text.items[i];
        }
    }
}

/**
 * 教師側の表示用データを作る
 *
 * @param {*} data
 * @param {*} pageNum
 * @param {*} ident
 */
function make(data, oCoords, pageNum, ident, text) {
    var line
    // if (ident == identifier[0]) {
    //     line = makeEnclosure(oCoords);
    // } else if (ident == identifier[1]) {
    //     line = makeLine(data);
    // }
    if (Array.isArray(text)) {
        let highLightList = [];
        text.forEach(textinfo => {
            console.log(textinfo);
            highLightList.push(makeTextHiglight(textinfo, textinfo.color));
        });
        setPage(highLightList, pageNum);

    } else {
        line = makeTextHiglight(text.text, text.color);
        if (line !== null) {
            console.log(pageNum);
            setPage(line, pageNum);
        }
    }
}

/**
 * 線を作る(仮)
 *
 * @param {*} data
 */
function makeLine(data, color) {
    var m, l;
    data.path.forEach(element => {
        if (element[0] == 'M') {
            m = element;
        } else if (element[0] == 'L') {
            l = element;
        } else {
            // console.log(element);
        }
    });
    var path = [m[1], m[2], l[1], l[2]];
    var line = new fabric.Line(path, {
        // fill: 'red',
        fill: color,
        stroke: color,
        strokeWidth: 5,
        selectable: false,
        evented: false,
        opacity: 0.5
    });
    // Canvas.add(line);
    return line;
}

/**
 * 囲みを作る
 *
 * @param {*} data
 */
function makeEnclosure(oCoords, color) {
    var height = oCoords.bl.y - oCoords.tl.y;
    var width = oCoords.tr.x - oCoords.tl.x;
    var Enclosure = new fabric.Rect({
        fill: color,
        // fill: 'red',
        top: oCoords.tl.y,
        left: oCoords.tl.x,
        width: width,
        height: height,
        opacity: 0.5
    });
    // console.log(Enclosure);

    return Enclosure;
}

/**
 *
 *
 * @param {*} text is pdfjs text infomation
 * @param {*} color is color code
 */
function makeTextHiglight(text, color) {
    height = text.height;
    width = text.width;
    var Highlight = new fabric.Rect({
        fill: color,
        top: text.transform[5] - height,
        left: text.transform[4],
        width: width,
        height: height,
        opacity: 0.5
    })

    return Highlight;
}

class newString {
    constructor(str, height, width, transform) {
        this.str = str;
        this.height = height;
        this.width = width;
        this.transform = transform;
    }
}


global.Canvas = Canvas;
global.setCanvasSize = setCanvasSize;
global.Pen = Pen;
global.make = make;