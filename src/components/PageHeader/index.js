import React from 'react';
import { Breadcrumb, Icon } from 'antd';
import classNames from 'classnames';
import styles from './index.less';
import { Link } from 'react-router-dom';

export default ({ children }) => {
  return (
    <div className={styles.pageHeader}>
      <Breadcrumb>
        <Breadcrumb.Item href=""><Link to="/"><Icon type="home" className={styles.homepage_icon} />首页</Link></Breadcrumb.Item>
        {
          children.map(item=><Breadcrumb.Item key={item.router}><Link to={item.router}>{item.name}</Link></Breadcrumb.Item>)
        }
      </Breadcrumb>
    </div>
  );
}