const { img2Blob } = require('./convert_average');
const path = require('path');
const fs = require('fs');
const { ipcMain, dialog } = require('electron');

const { EVENT } = require('../../src/business/electron-main-render-common');

// 读入文件并转化为 buffer 格式
function readImage(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    return new Buffer(bitmap);
}

/**
 * 获得项目的信息
 *
 * @param {Object} event 事件对象
 * @param {Object} [opts] 额外的参数，用于处理某些逻辑
 */
ipcMain.on(EVENT.PROJECT_INFO.REQ, (event, opts) => {
    dialog.showOpenDialog({
        properties: ['openDirectory']
    }, (files) => {
        // 注意 files 为只有一个元素的数组，但选择文件夹时只能单选，因此此处直接返回第一个元素即可
        if (!files || !files.length) {
            event.sender.send(EVENT.PROJECT_INFO.RSP, {
                retcode: -1,
                msg: '没有选择目录！'
            }, opts);
            return;
        }
        const projectFolder = files[0];
        const metaBuf = Buffer.from(opts.meta);
        const header = Buffer.alloc(4);//记录元数据长度
        header.writeInt32LE(opts.header);
        const buffer = Buffer.concat([header, metaBuf, new Buffer(opts.content)]);
        // 获取 projects/generator/startkit.config.js 的信息
        fs.writeFileSync(path.join(projectFolder, 'data.js'), opts.animateData, 'utf8');
        // fs.writeFileSync(path.join(projectFolder, 'img.blob'), buffer, 'utf8');
        fs.writeFileSync(path.join(projectFolder, 'img.blob'), new Buffer(opts.blobData), 'utf8');
        const src = path.join(process.cwd(), './src/template');
        const dst = projectFolder;
        let paths = fs.readdirSync(src); //同步读取当前目录
        paths.forEach(function(path){
            var _src=src+'/'+path;
            var _dst=dst+'/'+path;
            fs.stat(_src,function(err,stats){  //stats  该对象 包含文件属性
                if(err)throw err;
                if(stats.isFile()){ //如果是个文件则拷贝 
                    let  readable=fs.createReadStream(_src);//创建读取流
                    let  writable=fs.createWriteStream(_dst);//创建写入流
                    readable.pipe(writable);
                }else if(stats.isDirectory()){ //是目录则 递归 
                    checkDirectory(_src,_dst,copy);
                }
            });
        });

        // 获取 project.js 的信息

        // 获取 feflow.js 或 feflow.json 的信息

        // 获取其他信息

        // 最好有一个缓存文件

        event.sender.send(EVENT.PROJECT_INFO.RSP, {
            retcode: 0,
            result: {
                projectFolder
            }
        }, opts);
    });
});

ipcMain.on(EVENT.GET_PROJECT_INFO.REQ, (event, opts) => {
    dialog.showOpenDialog({
        properties: ['openDirectory']
    }, (files) => {
        // 注意 files 为只有一个元素的数组，但选择文件夹时只能单选，因此此处直接返回第一个元素即可
        if (!files || !files.length) {
            event.sender.send(EVENT.GET_PROJECT_INFO.RSP, {
                retcode: -1,
                msg: '没有选择目录！'
            }, opts);
            return;
        }

        const projectFolder = files[0];
        // 获取 project.js 的信息

        if (fs.existsSync(path.join(projectFolder, 'data.json'))) {
            // 获取 projects/generator/startkit.config.js 的信息
            const animationData = fs.readFileSync(path.join(projectFolder, 'data.json'), 'utf8');
            const imgPath = path.join(projectFolder, './images/');
            // 读取当前images文件夹下的所有文件
            fs.readdir(imgPath, function(err, files){
                var metaList = [];//元数据
                var blobBuf = Buffer.alloc(0);
                var blobOffset = 0;

                files && files.forEach(function(filename){
                    // 如果不是动画用到的图片则不加入到blob文件当中
                    if (JSON.parse(animationData).assets && JSON.parse(animationData).assets.filter(function(v) {return v.p == filename}).length == 0) {
                        return false;
                    }
                    var blob = readImage(imgPath + filename);//将图片转码
                    var endAddress = blobOffset + blob.length;
                    var meta = {//记录图片url和开始起始位子
                        imageUrl: filename,
                        slices: [blobOffset, endAddress]
                    };
                    metaList.push(meta);
                    blobBuf = Buffer.concat([blobBuf, blob]);//图片数据存起来
                    blobOffset = endAddress;//下一张图片的开始位置
                });

                var metaBuf = Buffer.from(JSON.stringify(metaList));
                var header = Buffer.alloc(4);//记录元数据长度
                header.writeInt32LE(metaBuf.length);
                var buffer = Buffer.concat([header, metaBuf, blobBuf]);
                //创建blob文件
                // 根据配置里的图片转化为 blob 文件
                event.sender.send(EVENT.GET_PROJECT_INFO.RSP, {
                    retcode: 0,
                    result: {
                        animationData,
                        imgblob: buffer
                    }
                }, opts);
            });
        } else {
            event.sender.send(EVENT.GET_PROJECT_INFO.RSP, {
                retcode: -1,
                msg: 'no such file'
            }, opts);
        }

        // 获取 feflow.js 或 feflow.json 的信息

        // 获取其他信息

        // 最好有一个缓存文件
    });
});
