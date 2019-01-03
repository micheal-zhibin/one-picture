import React, { Component } from 'react';
import * as animateData from './data.json';

import './index.less';
// import Lottie from 'react-lottie';
const lottie = require('./lottie');

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
            frame: 0,
        };
        this.play = this.play.bind(this)
        this.stop = this.stop.bind(this)
        this.pause = this.pause.bind(this)
        this.show = this.show.bind(this)
        this.handleFrameChange = this.handleFrameChange.bind(this)
    }

    play() {
        this.anim.play()
    }

    stop() { 
        this.anim.stop()
    }

    pause() {
        this.anim.pause()
    }

    show() {
        this.anim.renderer.renderFrame(this.state.frame);
    }
    
    handleFrameChange (e) {
        this.setState({
            frame: e.target.value
        })
    }

    componentDidMount() {
        var animData = {
            wrapper: document.getElementById('bodymovin'),
            animType: 'html',
            loop: true,
            prerender: true,
            autoplay: true,
            animationData: animateData,
            blobSrc: blobSrc
        };
        this.anim = lottie.loadAnimation(animData);
        window.onresize = this.anim.resize.bind(this.anim);
        setTimeout(() => {
            this.anim.stop();
        }, 500)
    }

    render() {
        const buttonStyle = {
            display: 'block',
            margin: '10px auto'
        };

        return (
            <div>
                <div id="bodymovin" style={{width: '160px', height: '160px'}}></div>
                <div>
                    <label>显示帧数：</label>
                    <input value={this.state.frame} onChange={this.handleFrameChange}></input>
                </div>
                <button style={buttonStyle} onClick={this.show}>展示</button>
            </div>
        )
    }
}

export default RootComponent; 
