import React, { PureComponent } from 'react';
import { Layout, Menu, Icon, Spin, Tag, Dropdown, Avatar, Divider, Popover, Badge, List } from 'antd';
import moment from 'moment';
import { Link } from 'react-router-dom';
import styles from './index.less';
import avatar from '../../assets/avatar.png';
import avatar2 from '../../assets/avatar2.png';
import { logout } from '../../services/api';
const { Header } = Layout;

export default class GlobalHeader extends PureComponent {

  toggle = () => {
    const { collapsed, onCollapse } = this.props;
    onCollapse(!collapsed);
  }

  onMenuClick = (item, key, keyPath) => {
    if (item.key == "logout") {
      logout();
      this.props.subscribeAuth(false);
    }
  }

  render() {
    const { collapsed, userName } = this.props;
    const menu = (
      <Menu className={styles.menu} selectedKeys={[]} onClick={this.onMenuClick}>
        <Menu.Item key="user"><Link to="/user/setting"><Icon type="user" />个人中心</Link></Menu.Item>
        <Menu.Item key="setting" disabled><Icon type="setting" />设置</Menu.Item>
        <Menu.Divider />
        <Menu.Item key="logout"><Link to="/login"><Icon type="logout" />退出登录</Link></Menu.Item>
      </Menu>
    );

    const noticeDataSource = [{
      title: '你收到一条新的测试信息~',
    }, {
      title: '你收到一条新的测试信息~',
    }, {
      title: '你收到一条新的测试信息~',
    }, {
      title: '你收到一条新的测试信息~',
    }, {
      title: '你收到一条新的测试信息~',
    }, {
      title: '你收到一条新的测试信息~',
    }];

    const notificationBox = (
      <List
        size="small"
        itemLayout="horizontal"
        className={styles.list}
        header={<div>通知（12）</div>}
        dataSource={noticeDataSource}
        renderItem={item=>(
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar src={avatar2}/>
    }
    title = { <a>{item.title}</a> }
    description = "3小时前" /
      >
      <
      /List.Item>
  )
}
/>
);

const trigger = (
  <span className={styles.noticeButton}>
        <Badge count={12}>
          <Icon type="bell" className={styles.icon} />
        </Badge>
      </span>
);
return (
  <Header className={styles.header}>
        <Icon
          className={styles.trigger}
          type={collapsed ? 'menu-unfold' : 'menu-fold'}
          onClick={this.toggle}
        />
        <div className={styles.right}>
          <Popover
            placement="bottomRight"
            content={notificationBox}
            popupClassName={styles.popover}
            trigger="click"
            arrowPointAtCenter
          >
            {trigger}
          </Popover>
          <Dropdown overlay={menu}>
              <span className={`${styles.action} ${styles.account}`}>
                <Avatar size="small" className={styles.avatar} src={avatar} />
                <span className={styles.name}>{userName}</span>
              </span>
            </Dropdown>
        </div>
      </Header>
);
}
}