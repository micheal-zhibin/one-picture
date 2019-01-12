import React from 'react';
import { NavLink, Route } from 'react-router-dom';

import { Layout } from 'antd';

import DemoLottie from './components/demo-lottie';

import './index.less';

export default function OnlyTestContainer(props) {
    let { match } = props;

    return (
        <Layout className="page-workspace">
            <Layout.Content>
                <DemoLottie />

            </Layout.Content>
        </Layout>
    );
}

