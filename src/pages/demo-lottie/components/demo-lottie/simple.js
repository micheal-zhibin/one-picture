export function getLower(swfData, dealArr) {
    swfData.op -= dealArr.length;

    swfData.layers = swfData.layers.filter((item) => {
        dealArr.forEach((deal) => {
            item.ks.o.k.splice(deal, 1);
            item.ks.o.k.forEach((it, index) => {
                if (index >= deal) {
                    it.t -= 1;
                }
            })
        })
        const frameNum = getLayerFrames(item);
        console.log(frameNum)
        if (frameNum - 2 <= 0) {
            return false;
        } else {
            return true;
        }
    })

    swfData.layers.forEach((item) => {
        swfData.assets.forEach((it) => {
            if (it.id == item.refId) {
                it.count = it.count ? it.count + 1 : 1;
            }
        });
    })

    swfData.assets = swfData.assets.filter((it, ind) => {
        return it.count;
    });

    return swfData;
}

function getLayerFrames(layer) {
    let temparr = [];
    layer.ks.o.k.forEach((item) => {
        let isExist = false;
        temparr.forEach((it) => {
            let tempit = JSON.parse(JSON.stringify(it)),
                tempitem = JSON.parse(JSON.stringify(item));
            tempit.t = tempitem.t = 0;
            if (JSON.stringify(tempit) == JSON.stringify(tempitem)) {
                isExist = true;
            }
        })
        if (!isExist) {
            temparr.push(item);
        }
    })
    return temparr.length;
}