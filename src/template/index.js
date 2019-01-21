const lottie = require('./lottie');
import TdBank from '/business/base-report/tdbank';
import * as animateData from './data.json';
function parseQuery(url) {
    const queryObj = {};
    const reg = /[?&]([^=&#]+)=([^&#]*)/g;
    const querys = url.match(reg);
    if (querys) {
        for (const i in querys) {
            const query = querys[i].split('=');
            const key = query[0].substr(1),
                value = query[1];
            queryObj[key] ? queryObj[key] = [].concat(queryObj[key], value) : queryObj[key] = value;
        }
    }
    return queryObj;
}
const blobSrc = [];
const blobIndex = parseQuery(window.location.href).blob || 1;
for (let i = 0; i < blobIndex; i ++) {
    const temp = require(`./img/img${blobIndex}-${i}.blob`);
    blobSrc.push(temp);
}
// 初始化 tdbank 上报
TdBank.init({
    opername: 'now-demo',
    module: 'blob_load'
});
window.reportTime = function (time) {
    const reportOpts = {
        action: `blob_${blobIndex}`,
        obj1: time
    };
    TdBank.report(reportOpts);
}
const animData = {
    wrapper: document.getElementById('bodymovin'),
    animType: 'html',
    loop: true,
    prerender: true,
    autoplay: true,
    animationData: animateData,
    blobSrc: blobSrc
};
const anim = lottie.loadAnimation(animData);
window.onresize = anim.resize.bind(anim);