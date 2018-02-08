import React from "react";
import { Row, Col, Card, Button, Tabs, Table, Input, Badge, Icon, Dropdown, Menu, message, Modal } from "antd";
import { Link } from "react-router-dom";
import styles from "./Dashboard.less";
import classNames from "classnames";
import { queryHostList, queryRemovedHostList, updateHostInfo } from "../../services/api";
import { getWs } from "../../utils/utils";
const TabPane = Tabs.TabPane;
export default class Wrapper extends React.Component {

  state = {
    loading: true,
    dataSource: [],
    originData: [],
    editable: false,
    totalCount: 0,
    offlineCount: 0,
    onlineCount: 0,
  }

  //获取主机列表
  queryHostList = () => {
    this.setState({
      loading: true
    });
    queryHostList().then(res => {
      if (res.msg == 'success' || res.code == 'Success') {
        const dataSource = [];
        let onlineCount = 0;
        res.data.map((item, index) => {
          item.is_online == 'online' ? onlineCount += 1 : null;
          dataSource.push({
            ...item,
            key: item.key || index
          });
        });
        this.setState({
          dataSource: dataSource,
          originData: dataSource,
          totalCount: dataSource.length,
          onlineCount: onlineCount,
          offlineCount: dataSource.length - onlineCount
        });
      }
      this.setState({
        loading: false
      });
    });
  }

  //获取回收站列表
  queryRemovedHostList = () => {
    this.setState({
      loading: true
    });
    queryRemovedHostList().then(res => {
      if (res.msg == 'success' || res.code == 'Success') {
        const dataSource = [];
        res.data.map((item, index) => {
          dataSource.push({
            ...item,
            key: item.key || index
          });
        });
        this.setState({
          dataSource: dataSource,
          originData: dataSource,
        });
      }
      this.setState({
        loading: false
      });
    });
  }

  /* Tabs切换 */
  onTabsChange = (key) => {
    this.setState({ key, dataSource: [] });
    if (key == "intranet") {
      this.queryHostList();
    } else if (key == "recycleBin") {
      this.queryRemovedHostList();
    }
  }

  componentDidMount() {
    this.queryHostList()

    //监听websocket
    this.ws = new getWs();
    this.ws.onmessage = (event) => {
      var data = JSON.parse(event.data);
      console.log("ws-data", data);
      if (data.topic == 'host_status_change') {
        this.queryHostList();
      }
    }
  }

  componentWillUnmount() {
    console.log('已离开', this.ws)
    this.ws.onclose = (e) => { console.log('closed!') }
    this.ws.close()
  }

  /* search func */
  handleSearch = (value) => {
    let { dataSource, originData } = this.state;
    const reg = new RegExp(value, 'gi');
    const match = this.state.originData.filter(record => {
      return record.host_ip.match(reg);
    });
    this.setState({
      dataSource: match
    });
  }

  /* 编辑单元格改变的函数=>edit comment func */
  onCellChange = (key, dataIndex) => {
    return (value) => {
      const params = {
        "update_key": "comment",
        "new_value": value,
        "host_id": key,
      }
      updateHostInfo(params).then(res => {
        if (res.msg == "success" || res.code == 'Success') {
          message.success("修改备注成功！");
          if (this.state.key == 'recycleBin') {
            this.queryRemovedHostList();
          } else {
            this.queryHostList();
          }
        } else {
          message.error(`修改备注失败！msg：${res.msg}`)
        }
      });
    };
  }

  menu = (record, handleClick) => (
    <Menu onClick={handleClick.bind(this,record)}>
        <Menu.Item key="monit" disabled={this.state.key=="recycleBin"}>
          <Link to={{pathname:"/dashboard/hostMonitor", state:record}}><div><Icon type="line-chart" style={{marginRight:5+'px'}}/>监控</div></Link>
        </Menu.Item>
        {
          this.state.key=='recycleBin'?
          <Menu.Item key="recovery">
            <div><Icon type="delete" style={{marginRight:5+'px'}}/>恢复</div>
          </Menu.Item>
          :
          <Menu.Item key="remove">
            <div><Icon type="delete" style={{marginRight:5+'px'}}/>下架</div>
          </Menu.Item>
        }
        <Menu.Item key="shell" disabled>
          <div><Icon type="laptop" style={{marginRight:5+'px'}}/>终端</div>
        </Menu.Item>
        <Menu.Item key="restart" disabled>
          <div><Icon type="reload" style={{marginRight:5+'px'}}/>重启</div>
        </Menu.Item>
      </Menu>
  );

  /* menu click func */
  handleMenuClick = (record, item, key, keyPath) => {
    if (item.key == "remove") { //下架机器
      Modal.confirm({
        title: `确定下架机器：${record.host_ip} 吗？`,
        content: '请谨慎操作！',
        onOk: () => {
          const params = {
            "update_key": "status",
            "new_value": "1", //1表示下架, 0表示上架
            "host_id": record.host_id,
          }
          updateHostInfo(params).then(res => {
            if (res.msg == 'success' || res.code == 'Success') {
              message.success('下架成功！', 0.5, () => { this.queryHostList() });
            } else {
              message.error(`下架失败，msg：${res.msg}`);
            }
          });
        }
      });
    } else if (item.key == "recovery") { //恢复机器
      Modal.confirm({
        title: `确定恢复机器：${record.host_ip} 吗？`,
        content: '请谨慎操作！',
        onOk: () => {
          const params = {
            "update_key": "status",
            "new_value": "0", //1表示下架, 0表示上架
            "host_id": record.host_id,
          }
          updateHostInfo(params).then(res => {
            if (res.msg == 'success' || res.code == 'Success') {
              message.success('恢复成功！', 0.5, () => { this.queryRemovedHostList() });
            } else {
              message.error(`恢复失败，msg：${res.msg}`);
            }
          });
        }
      });
    }
  }

  render() {

    const { loading, dataSource, totalCount, onlineCount, offlineCount } = this.state;

    const Info = ({ title, value, bordered, className }) => {
      return (
        <div className={styles.headerInfo}>
        <span>{title}</span>
        <p className={className}>{value}<span>（台）</span></p>
        {bordered && <em />}
      </div>
      );
    }

    const tabBarExtraContent = (
      <div>
        <Button type="primary">初始化</Button>
      </div>
    );

    const columns = [{
      title: "实例名称",
      dataIndex: 'hostname',
      key: 'hostname',
      width: '18%',
    }, {
      title: "IP地址",
      dataIndex: 'host_ip',
      key: 'host_ip',
      width: '15%',
    }, {
      title: "状态",
      dataIndex: 'is_online',
      key: 'is_online',
      width: '10%',
      render: (text) => { return text == 'online' ? <Badge status="success" text="运行中" /> : <Badge status="error" text="离线" /> },
      filters: [
        { text: '运行中', value: 'online' },
        { text: '离线', value: 'offline' },
      ],
      onFilter: (value, record) => record.is_online.indexOf(value) === 0,
    }, {
      title: "配置",
      dataIndex: 'cpu_count',
      key: 'cpu_count',
      width: '35%',
      render: (text, record) => (
        <span>
          CPU：{record.cpu_count} 核&nbsp;
          内存：{ (record.mem_capacity/1024/1024).toFixed(2)<0.5 ? '512M' : Math.ceil(record.mem_capacity/1024/1024)+' GB'}&nbsp;
          操作系统：{record.host_os}
        </span>
      )
    }, {
      title: "备注",
      dataIndex: 'comment',
      key: 'comment',
      width: '17%',
      render: (text, record) => (
        <EditableCell
          value={text}
          onChange={this.onCellChange(record.host_id, 'comment')}
        />
      ),
    }, {
      title: "操作",
      dataIndex: 'option',
      key: 'option',
      width: '5%',
      render: (text, record) => (
        <span className="table-operation">
          <Dropdown overlay={this.menu(record,this.handleMenuClick)} trigger={['click']}>
            <a href="#">
              运维 <Icon type="down" />
            </a>
          </Dropdown>
        </span>
      )
    }];

    const content = (<div>
      <p className={styles.filterBar}>
        <span style={{fontWeight:'bold',color:'#333'}}>IP过滤：</span>
        <Input.Search placeholder="请输入IP..." style={{ width: 250 }} enterButton onSearch={this.handleSearch} />
      </p>
      <Table
        size = "middle"
        loading = {loading}
        dataSource = {dataSource}
        columns = {columns}
        pagination = {{
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `数据 ${total} 条，当前展示第 ${range[0]}-${range[1]} 条`
        }}
      />
    </div>);

    const panes = [
      { title: '内网', content: content, key: 'intranet' },
      { title: '回收站', content: content, key: 'recycleBin' },
    ];

    return (
      <div className={styles.standardList}>
        <Row gutter={16}>
          <Col span={8} >
            <Card bodyStyle={{ padding: '12px 32px' }} bordered={false}>
              <Row>
                <Col sm={24} xs={24}>
                  <Info title="主机总数量" value={totalCount} />
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={16}>
            <Card bordered={false} bodyStyle={{ padding: '12px 32px' }}>
              <Row>
                <Col sm={12} xs={24}>
                  <Info title="运行中" value={onlineCount} bordered className={styles.online_color}/>
                </Col>
                <Col sm={12} xs={24}>
                  <Info title="已离线" value={offlineCount} className={styles.offline_color} />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
        <Card
          className={styles.listCard}
          bordered={false}
          style={{ marginTop: 18 }}
          bodyStyle={{ padding: '10px 20px 0px 20px' }}
        >
          <Tabs onChange={this.onTabsChange}>
            { panes.map( pane =><TabPane tab={ pane.title } key={ pane.key }>{ pane.content }</TabPane>) }
          </Tabs>
        </Card>
      </div>
    );
  }
}


/* 编辑备注单元格 */
class EditableCell extends React.Component {
  state = {
    value: this.props.value,
    editable: false,
    changed: false,
  }
  handleChange = (e) => {
    const value = e.target.value;
    this.setState({ value, changed: true });
  }
  check = () => {
    this.setState({ editable: false });
    if (this.state.changed) {
      if (this.props.onChange) {
        if (this.state.value.length > 30) {
          message.warning("请将备注控制在30个字符以内！", 2);
          this.props.onChange(this.state.value.substring(0, 30));
        } else {
          this.props.onChange(this.state.value);
        }
      }
    } else {
      return null;
    }
  }
  edit = (e) => {
    this.setState({ editable: true });
  }
  render() {
    const { editable } = this.state;
    return (
      <div className="editable-cell">
        {
          editable ?
            <div className="editable-cell-input-wrapper">
              <Input
                defaultValue={this.props.value?this.props.value:'--'}
                onChange={this.handleChange}
                onPressEnter={this.check}
              />
              <Icon
                type="check"
                className="editable-cell-icon-check"
                onClick={this.check}
              />
            </div>
            :
            <div className="editable-cell-text-wrapper">
              {this.props.value || '--'}
              <Icon
                type="edit"
                className="editable-cell-icon"
                onClick={this.edit}
              />
            </div>
        }
      </div>
    );
  }
}