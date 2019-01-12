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
        this.props.loadProject({
            animateData: JSON.stringify(animateData)
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

    initAnimation(animateData) {
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
            blobSrc: blobSrc
        };
        this.anim = lottie.loadAnimation(animData);
        this.anim.addEventListener('DOMLoaded', () => {
            this.anim.pause();
            let framelist = [];
            for (let i = animateData.ip; i <= animateData.op; i ++) {
                this.anim.renderer.renderFrame(i);
                framelist.push(this.refs.animationbody.children[0].toDataURL('image/png'))
            }
            this.setState({
                framelist
            })
            this.anim.play();
        });
        window.onresize = this.anim.resize.bind(this.anim);
    }

    componentDidMount() {
        this.initAnimation(animateData);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.data.projectFolder !== this.props.data.projectFolder) {
            alert(`已经保存到${nextProps.data.projectFolder}`)
        }
        if (nextProps.data.animationData !== this.props.data.animationData) {
            orignalanimateData = JSON.stringify(nextProps.data.animationData);
            animateData = JSON.parse(JSON.stringify(orignalanimateData));
            this.initAnimation(animateData);
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
