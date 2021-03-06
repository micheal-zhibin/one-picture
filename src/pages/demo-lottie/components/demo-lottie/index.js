import React, { Component } from 'react';
import * as defaultanimateData from './data.json';
import { connect } from 'react-redux';

import './index.less';
import { loadProject, loadAnimation } from '../../../../data/data-project';
import { getLower } from './simple';
const lottie = require('./lottie');
let orignalanimateData = JSON.parse(JSON.stringify(defaultanimateData))
let animateData = JSON.parse(JSON.stringify(orignalanimateData));
let blobSrc = [];
let blobIndex = 0;
while(true) {
    try {
        const temp = require('./img' + blobIndex + '.blob')
        blobSrc.push(temp)
        blobIndex ++;
    } catch(e) {
        break;
    }
}
let blobContent = '';

// 通过 xhr 请求获取 arraybuffer 形式的 blob 文件
function getBlob(blobSrc) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', blobSrc, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function(e) {
            if (this.status == 200) {
                resolve(this.response)
            }
        }
        xhr.onerror = function(e) {
            reject(e);
        }
        xhr.send()
    })
}
// 将 arraybuffer 转换为 string

function ab2str(u,f) {
    const b = new Blob([u]);
    const r = new FileReader();
    r.readAsText(b, 'utf-8');
    r.onload = function (){if(f)f.call(null,r.result)}
}
// 合并两个 arraybuffer
function appendBuffer(buffer1, buffer2) {
    var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
    return tmp.buffer;
};

class RootComponent extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            isStopped: false,
            isPaused: false,
            frame: animateData.fr,
            startframe: animateData.ip,
            endframe: animateData.op,
            framelist: [],
            chosenFrame: [],
        };
        this.playorpause = this.playorpause.bind(this)
        this.handleFrameChange = this.handleFrameChange.bind(this)
        this.handleStartFrameChange = this.handleStartFrameChange.bind(this)
        this.handleEndFrameChange = this.handleEndFrameChange.bind(this)
        this.create = this.create.bind(this)
        this.show = this.show.bind(this)
        this.initAnimation = this.initAnimation.bind(this)
        this.reset = this.reset.bind(this)
        this.output = this.output.bind(this)
        this.handleChange = this.handleChange.bind(this)
    }

    playorpause() {
        const { isPaused } = this.state;
        if (isPaused) {
            this.anim.play()
        } else {
            this.anim.pause()
        }
        this.setState({
            isPaused: !isPaused
        })
    }

    show() {
        this.anim.renderer.renderFrame(this.state.frame);
    }

    create() {
        const { frame, startframe, endframe, chosenFrame } = this.state;
        animateData.fr = frame;
        animateData.ip = startframe;
        animateData.op = endframe;
        getLower(animateData, chosenFrame)
        this.initAnimation(animateData);
        this.setState({
            chosenFrame: [],
            frame: animateData.fr,
            startframe: animateData.ip,
            endframe:animateData.op
        })
    }

    reset() {
        animateData = JSON.parse(JSON.stringify(orignalanimateData));
        this.setState({
            frame: animateData.fr,
            startframe: animateData.ip,
            endframe: animateData.op,
        })
        this.initAnimation(animateData);
    }

    output() {
        const that = this;
        ab2str(blobContent.slice(4, 4 + new Int32Array(blobContent.slice(0, 4))[0]), (meta) => {
            that.props.loadProject({
                animateData: `var animateData = ${JSON.stringify(animateData)}`,
                blobData: new Uint8Array(blobContent),
                header: new Int32Array(blobContent.slice(0, 4))[0],
                meta,
                content: new Uint8Array(blobContent.slice(4 + new Int32Array(blobContent.slice(0, 4))[0]))
            });
        });
    }
    
    handleFrameChange (e) {
        this.setState({
            frame: e.target.value
        })
    }
    
    handleStartFrameChange (e) {
        this.setState({
            startframe: e.target.value
        })
    }
    
    handleEndFrameChange (e) {
        this.setState({
            endframe: e.target.value
        })
    }

    handleChoseFrame (index) {
        const temparr = this.state.chosenFrame;
        const temp = temparr.indexOf(index);
        if (temp == -1) {
            temparr.push(index)
        } else {
            temparr.splice(temp, 1)
        }
        this.setState({
            chosenFrame: temparr
        })
    }

    handleChange (e) {
        this.props.loadAnimation()
    }

    initBlobData() {
        return Promise.all(blobSrc.map((v) => {
            return getBlob(v)
        })).then(function(result) {
            blobContent = new ArrayBuffer();
            for (var i = 0;i < result.length;i ++) {
                blobContent = appendBuffer(blobContent, result[i]);
            }
            return blobContent;
        });
    }

    initAnimation(animateData, blobContent) {
        const that = this;
        const f = this.refs.animationbody;
        const childs = f.childNodes;
        for(var i = 0; i < childs.length; i++) {
            f.removeChild(childs[i]);
        }
        const animData = {
            wrapper: document.getElementById('bodymovin'),
            animType: 'canvas',
            loop: true,
            prerender: true,
            autoplay: true,
            animationData: animateData,
            blobContent: blobContent
        };
        that.anim = lottie.loadAnimation(animData);
        that.anim.addEventListener('DOMLoaded', () => {
            that.anim.pause();
            let framelist = [];
            for (let i = animateData.ip; i <= animateData.op; i ++) {
                that.anim.renderer.renderFrame(i);
                framelist.push(that.refs.animationbody.children[0].toDataURL('image/png'))
            }
            that.setState({
                framelist
            })
            that.anim.play();
        });
        window.onresize = that.anim.resize.bind(that.anim);
    }

    componentDidMount() {
        this.initBlobData().then((result) => {
            this.initAnimation(animateData, result);
        })
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.data.projectFolder && nextProps.data.projectFolder !== this.props.data.projectFolder) {
            alert(`已经保存到${nextProps.data.projectFolder}`)
        }
        if (nextProps.data.animationData !== this.props.data.animationData) {
            orignalanimateData = JSON.parse(nextProps.data.animationData);
            animateData = JSON.parse(JSON.stringify(orignalanimateData));
            blobContent = nextProps.data.imgblob;
            blobSrc = [];
            this.setState({
                frame: animateData.fr,
                startframe: animateData.ip,
                endframe: animateData.op,
            })
            this.initAnimation(animateData, blobContent);
        }
    }

    render() {
        const { framelist, frame, startframe, endframe, chosenFrame } = this.state;
        const buttonStyle = {
            display: 'block',
            margin: '10px auto'
        };
        const frameList = framelist.map((frame, index) => {
            return <img className={chosenFrame.indexOf(index) == -1 ? "frameimg" : "frameimg chosen"} src={frame} key={index} onClick={this.handleChoseFrame.bind(this, index)} />;
        })
        return (
            <div>
                <div id="bodymovin" style={{width: '160px', height: '160px'}} ref="animationbody"></div>
                <div>
                    <label>帧率：</label>
                    <input value={frame} onChange={this.handleFrameChange}></input>
                </div>
                <div>
                    <label>起始帧：</label>
                    <input value={startframe} onChange={this.handleStartFrameChange}></input>
                </div>
                <div>
                    <label>结束帧：</label>
                    <input value={endframe} onChange={this.handleEndFrameChange}></input>
                </div>
                <button style={buttonStyle} onClick={this.create}>预览</button>
                <button style={buttonStyle} onClick={this.playorpause}>播放/暂停</button>
                <button style={buttonStyle} onClick={this.reset}>重置</button>
                <button style={buttonStyle} onClick={this.output}>导出</button>
                <button style={buttonStyle} onClick={this.handleChange}>导入</button>
                <div className="frameList">
                    {frameList}
                </div>
            </div>
        )
    }
}

function mapStateToProps(state) {
    const { projectInfo } = state;

    return {
        isLoaded: projectInfo.isLoaded,
        isSuccess: projectInfo.isSuccess,
        data: projectInfo.data
    };
}

function mapDispatchToProps(dispatch) {
    return {
        loadProject(opts) {
            return dispatch(loadProject(opts));
        },
        loadAnimation(opts) {
            return dispatch(loadAnimation(opts));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(RootComponent);
