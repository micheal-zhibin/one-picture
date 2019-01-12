import React from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';

import { Layout } from 'antd';

import LayoutHeader from './components/layout-header';

import PageAbout from './pages/about';
import OnlyTest from './pages/only-test';
import DemoLottie from './pages/demo-lottie';

import './App.less';

export default function App() {
    return (
        <Router>
            <Layout className="app-container">
                <LayoutHeader />

                <Layout.Content>
                    <Route exact path={`/`} component={PageAbout} />
                    <Route path={`/about`} component={PageAbout} />
                    <Route path={`/only-test`} component={OnlyTest} />
                    <Route path={`/demo-lottie`} component={DemoLottie} />
                </Layout.Content>
            </Layout>
        </Router>
    );
}