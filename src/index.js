import React from "react";
import PropTypes from 'prop-types';
import ReactDOM from "react-dom";
import { LocaleProvider } from "antd";
import zhCN from 'antd/lib/locale-provider/zh_CN';
import App from "./app.js";
ReactDOM.render(
  <LocaleProvider locale={zhCN}>
      <App />
    </LocaleProvider>,
  document.getElementById('root')
);