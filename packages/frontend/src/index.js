import 'regenerator-runtime/runtime';

import { createBrowserHistory } from 'history';
import React from 'react';
import ReactDOM from 'react-dom';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3-near';
import TagManager from 'react-gtm-module';
import { LocalizeProvider } from 'react-localize-redux';
import { Provider } from 'react-redux';
import { createStore } from 'redux';

import Routing from './components/Routing';
import { RECAPTCHA_ENTERPRISE_SITE_KEY, GOOGLE_TAG_MANAGER_ID } from './config';
import { isWhitelabel } from './config/whitelabel';
import createRootReducer from './redux/createReducers';
import createMiddleware from './redux/middleware';
import { initSentry } from './utils/sentry';

const tagManagerArgs = {
    gtmId: GOOGLE_TAG_MANAGER_ID
};

if (!isWhitelabel()) {
    TagManager.initialize(tagManagerArgs);
}

initSentry();

const history = createBrowserHistory();

export const store = createStore(createRootReducer(history), createMiddleware(history));

store.addAccountReducer = () => {
    store.replaceReducer(createRootReducer(history));
};

ReactDOM.render(
    <GoogleReCaptchaProvider
        reCaptchaKey={RECAPTCHA_ENTERPRISE_SITE_KEY}
        useRecaptchaNet={true}
        useEnterprise={true}
    >
        <Provider store={store}>
            <LocalizeProvider store={store}>
                <Routing history={history}/>
            </LocalizeProvider>
        </Provider>
    </GoogleReCaptchaProvider>,
    document.getElementById('root')
);
