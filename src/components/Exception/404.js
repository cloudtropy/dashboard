import React from "react";
import { Link } from "react-router-dom";
import { Button } from "antd";
import Exception from 'ant-design-pro/lib/Exception';
export default () => {
  return (
      <Exception
      type="404"
      style={{ minHeight: 500, height: '80%' }}
      actions={<Link to="/" style={{display:'none'}}><Button type="primary">返回首页</Button></Link>}
      title="404"
      desc="抱歉，你访问的页面不存在"
    />
  );
}