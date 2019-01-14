var fs = require('fs');

module.exports.img2Blob = function (swfData, imgPath) {
    // 读入文件并转化为 buffer 格式
    function readImage(file) {
        // read binary data
        var bitmap = fs.readFileSync(file);
        return new Buffer(bitmap);
    }
    // 读取当前images文件夹下的所有文件
    fs.readdir(imgPath, function(err, files){
        var metaList = [];//元数据
        var blobBuf = Buffer.alloc(0);
        var blobOffset = 0;
    
        files.forEach(function(filename){
            // 如果不是动画用到的图片则不加入到blob文件当中
            if (swfData.assets.filter(function(v) {return v.p == filename}).length == 0) {
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
        // fs.writeFileSync('img.blob', buffer, 'binary');
        //创建blob文件
        return buffer;
        // splitOut(buffer, cb)
    });
}