import React from 'react';
import { queryHostMonitorData } from '../../services/api';
import styles from './HostMonitor.less';
import { Row, Col, Table, Button, Menu, Icon, Divider, Card, Badge, Tabs, Radio, message, Dropdown, Form, Input, Modal, } from "antd";
import LineChart from '../../components/Chart/LineChart';
const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

const gridStyle = {
  width: '33.3%',
  textAlign: 'left',
  padding: '10px 32px',
};

export default class HostMonitor extends React.Component {

  state = {
    hostInfo: this.props.location.state,
    chartData: [],
  }

  componentDidMount() {
    let start = Math.floor((new Date().getTime() - 1 * 60 * 60 * 1000) / 1000);
    let end = Math.floor(new Date().getTime() / 1000);
    this.queryHostMonitorData(this.state.hostInfo.host_id, start, end);
  }

  /* monit time change func */
  handleMonitTimeChange = (e) => {
    let interval = e.target.value;
    let start = Math.floor((new Date().getTime() - interval * 60 * 60 * 1000) / 1000);
    let end = Math.floor(new Date().getTime() / 1000);
    this.queryHostMonitorData(this.state.hostInfo.host_id, start, end);
  }


  /* get monit chart data func */
  queryHostMonitorData = (hostId, start, end) => {
    this.setState({ chartData: [] });
    const params = {
      hostId: hostId,
      start: start,
      end: end,
    }
    queryHostMonitorData(params).then(res => {
      if (res.code = 'Success') {
        this.setState({
          chartData: res.data
        });
      }
    });
  }

  render() {
    const { hostInfo } = this.state;

    const Info = ({ title, value, bordered, className }) => {
      return (
        <div className={styles.headerInfo}>
        <span>{title}</span>
        <p className={className}>{value}</p>
        {bordered && <em />}
      </div>
      );
    }

    return (
      <div>
        <Row type={'flex'} justify="center">
          <Col span={23} style={{marginTop:12+'px'}}>
            <Icon type="laptop" style={{marginRight:8+'px'}} />IP：{this.state.hostInfo.host_ip}
          </Col>
          <Col span={23} style={{paddingTop:12+'px',borderBottom:1+'px'+' solid'+' #e9e9e9'}}></Col>
          <Col span={23} style={{marginTop:24+'px'}}>
            <Button onClick={()=>{this.props.history.goBack()}}>返回</Button>
          </Col>
          <Col span={23} style={{marginTop:24+'px'}} id="userInfo">
            <Card 
              title={(<span>基本信息</span>)}
              hoverable={false}
              bodyStyle={{padding:0}}
            >
              <Card.Grid className={styles.gridStyle}><span>实例ID：</span>{hostInfo.host_id}</Card.Grid>
              <Card.Grid className={styles.gridStyle}><span>实例name：</span>{hostInfo.hostname}</Card.Grid>
              <Card.Grid className={styles.gridStyle}><span>IP：</span>{hostInfo.host_ip}</Card.Grid>
              <Card.Grid className={styles.gridStyle}><span>CPU：</span>{hostInfo.cpu_count} 核</Card.Grid>
              <Card.Grid className={styles.gridStyle}><span>内存：</span>{(hostInfo.mem_capacity/1024/1024).toFixed(2)<0.5 ? '512M' : Math.ceil(hostInfo.mem_capacity/1024/1024)+' GB'}</Card.Grid>
              <Card.Grid className={styles.gridStyle}><span>操作系统：</span>{hostInfo.host_os}</Card.Grid>
              <Card.Grid className={styles.gridStyle}><span>磁盘：</span>{Math.floor(hostInfo.disk_capacity/1024/1024)+' GB'}</Card.Grid>
              <Card.Grid className={styles.gridStyle}><span>备注：</span>{hostInfo.comment}</Card.Grid>
            </Card>
          </Col>
        </Row>
        <Row gutter={16} style={{padding:'0 30px',overflowY:'auto',marginTop:'24px'}}>
          <Col span={23}>
            <RadioGroup defaultValue={1} onChange={this.handleMonitTimeChange}>
              <RadioButton value={1}>1小时</RadioButton>
              <RadioButton value={3}>3小时</RadioButton>
              <RadioButton value={6}>6小时</RadioButton>
              <RadioButton value={12}>12小时</RadioButton>
              <RadioButton value={24}>1天</RadioButton>
              <RadioButton value={24*3}>3天</RadioButton>
            </RadioGroup>
          </Col>
          <Col span={24} style={{margin:'20px 0px 10px 0px'}}>
           <p className={styles.chartBar}>CPU负载 / CPU使用率 / 网卡流量</p>
          </Col>
          {
            this.state.chartData? this.state.chartData.map((chart,index)=>(
              <Col span={8} style={{marginBottom:15}} key={index}><LineChart width="100%" height={320} id={index} data={chart} /></Col>
            )):null
          }
        </Row>
      </div>
    );
  }
}
// { this.state.chartData?this.state.chartData.map((chart,index)=><Col span={8} style={{marginBottom:15}}><LineChart width="100%" height="320" id={index} data={chart} /></Col>):null }