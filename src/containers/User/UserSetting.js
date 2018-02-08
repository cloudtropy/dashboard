import React from "react";
import md5 from "md5"
import { Row, Col, Button, Icon, Card, Modal, Form, Input, Radio, Select, message, } from "antd";
import { queryUserInfo, updateUserInfo, updateUserPwd, logout } from "../../services/api";
import styles from './UserSetting.less';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

class Wrapper extends React.Component {
  state = {
    userInfo: {},
    visible_resetPwd: false,
    visible_updateInfo: false,
    confirmDirty: false,
  }

  queryUserInfo = () => {
    queryUserInfo().then((res) => {
      if (res.msg == 'success' || res.code == 'Success') {
        this.setState({
          userInfo: res.data
        });
      }
    });
  }
  componentDidMount() {
    this.queryUserInfo();
  }

  /*修改基本信息*/
  showUpdateInfoModal = () => {
    this.setState({
      visible_updateInfo: true,
    });
  }
  hideUpdateInfoModal = (e) => {
    this.setState({
      visible_updateInfo: false,
    });
  }
  confirmUpdateInfo = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll(['alias', 'sex', 'email', 'phone', 'wechat'], { force: true }, (err, values) => {
      if (!err) {
        updateUserInfo(values).then(res => {
          if (res.msg == 'success' || res.code == 'Success') {
            message.success("修改用户信息成功！");
            this.queryUserInfo();
          } else {
            message.error(`修改用户信息失败！msg: ${res.msg}`);
          }
        });
        this.setState({
          visible_updateInfo: false
        });
      }
    });
  }

  /*修改密碼*/
  showResetPwdModal = () => {
    this.setState({
      visible_resetPwd: true,
    });
  }
  hideResetPwdModal = (e) => {
    this.setState({
      visible_resetPwd: false,
    });
  }
  confirmResetPwd = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll(['originPassword', 'password', 'confirm'], { force: true }, (err, values) => {
      if (!err) {
        updateUserPwd({ passwd: md5(values.originPassword), newPasswd: md5(values.password) }).then(res => {
          if (res.msg == "success" || res.code == "Success") {
            message.success("密码修改成功！请重新登录~", 2.5, () => {
              logout();
              this.props.history.push("/user/login");
            });
          } else {
            message.error(`密码修改失败！msg：${res.msg}`);
          }
        });
        this.setState({
          visible_resetPwd: false
        });
      }
    });
  }

  /*密码比较验证*/
  handleConfirmBlur = (e) => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  }
  checkPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value == form.getFieldValue('originPassword')) {
      callback('禁止使用与原始密码相同的密码！');
    }
    if (value && value !== form.getFieldValue('password')) {
      callback('两次输入的密码不一致，请重新输入！');
    } else {
      callback();
    }
  }
  checkConfirm = (rule, value, callback) => {
    const form = this.props.form;
    if (value == form.getFieldValue('originPassword')) {
      callback('禁止使用与原始密码相同的密码！');
    }
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  }

  render() {
    const { user, alias, sex, email, phone, wechat, createTime } = this.state.userInfo
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 7 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 12 },
      },
    };
    const prefixSelector = getFieldDecorator('prefix', {
      initialValue: '86',
    })(
      <Select>
        <Option value="86">+86</Option>
      </Select>
    );
    const resetPwdModalChildren = (
      <Form>
        <FormItem
          {...formItemLayout}
          label="原始密码"
          hasFeedback
        >
          {getFieldDecorator('originPassword', {
            rules: [{
              required: true, message: '请输入你的原始密码！',
            }],
          })(
            <Input type="password" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="新密码"
          hasFeedback
        >
          {getFieldDecorator('password', {
            rules: [{
              required: true, message: '请填写你的新密码！',
              pattern: /^[^\u4e00-\u9fa5]{8,}$/g, message: '密码不小于8位',
            }, {
              validator: this.checkConfirm,
            }],
          })(
            <Input type="password" />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="确认密码"
          hasFeedback
        >
          {getFieldDecorator('confirm', {
            rules: [{
              required: true, message: '请确认你的密码！',
            }, {
              validator: this.checkPassword,
            }],
          })(
            <Input type="password" onBlur={this.handleConfirmBlur} />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="注"
        >
          <span className={styles.forget_origin_pwd}>如忘记原始密码，请联系管理员进行重置！</span>
        </FormItem>
      </Form>
    );
    const updateInfoModalChildren = (
      <Form>
        <FormItem
          {...formItemLayout}
          label="用户名"
        >
          {getFieldDecorator('user', {
            initialValue:user,
            rules: [{
              required: true, message: '请为该用户填写一个用户名！',
              pattern: /^[\w.-]{0,64}$/g, message: '长度1-64个字符，允许输入大小写英文字母、数字、"."、"_"或"-"',
            }],
          })(
            <Input disabled/> 
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="显示名"
        >
          {getFieldDecorator('alias', {
            initialValue:alias,
            rules: [{
              required: true, message: '请先给该用户填写一个显示名！',
              pattern: /^[\w\u4e00-\u9fa5@.-]{0,12}$/g, message: '长度1-12个字符或汉字，允许输入英文字母、数字、"@"、"."、"_"或"-"',
            }],
          })(
            <Input />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="性别"
        >
          {getFieldDecorator('sex', {
            initialValue:sex,
            rules: [{
              required: false, message: '请选择用户性别！',
            }],
          })(
            <RadioGroup>
              <Radio value="male">男</Radio>
              <Radio value="female">女</Radio>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="邮箱"
        >
          {getFieldDecorator('email', {
            initialValue:email,
            rules: [{
              type: 'email', message: '邮箱格式不正确！',
            }],
          })(
            <Input /> 
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="电话"
        >
          {getFieldDecorator('phone', {
            initialValue:phone,
            rules: [{ required: false, message: 'Please input your phone number!',
              pattern: /^1(3|4|5|7|8)\d{9}$/g, message: '无效的电话号码！',
            }],
          })(
            <Input addonBefore={prefixSelector} />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="微信"
        >
          {getFieldDecorator('wechat', {
            initialValue:wechat,
            rules: [{
              required: false, message: 'Please input your E-mail!',
            }],
          })(
            <Input /> 
          )}
        </FormItem>
      </Form>
    );

    return (
      <div>
        <Row type={'flex'} justify="center">
          <Col span={23} style={{marginTop:12+'px'}}>
            <Icon type="setting" style={{marginRight:8+'px'}} />个人设置中心
          </Col>
          <Col span={23} style={{paddingTop:12+'px',borderBottom:1+'px'+' solid'+' #e9e9e9'}}></Col>
          <Col span={23} style={{marginTop:24+'px'}}>
            <Card 
              title={(<span>基本信息</span>)}
              bodyStyle={{padding:0}}
              extra={<span>
                <Button className={styles.edit_btn} onClick={this.showUpdateInfoModal}>编辑基本信息</Button>
                <Button type="primary" onClick={this.showResetPwdModal}>修改密码</Button>
              </span>}
            >
              <Card.Grid className={styles.gridStyle}><span>用户名：</span>{user}</Card.Grid>
              <Card.Grid className={styles.gridStyle}><span>显示名：</span>{alias}</Card.Grid>
              <Card.Grid className={styles.gridStyle}><span>性别：</span>{sex=='male'?'男':'女'}</Card.Grid>
              <Card.Grid className={styles.gridStyle}><span>邮箱：</span>{email}</Card.Grid>
              <Card.Grid className={styles.gridStyle}><span>手机：</span>{phone}</Card.Grid>
              <Card.Grid className={styles.gridStyle}><span>微信：</span>{wechat}</Card.Grid>
              <Card.Grid className={styles.gridStyle}><span>创建时间：</span>{createTime}</Card.Grid>
            </Card>
          </Col>
          <Modal
            destroyOnClose
            title="修改密码"
            visible={this.state.visible_resetPwd}
            onOk={this.confirmResetPwd}
            onCancel={this.hideResetPwdModal}
          >
            {resetPwdModalChildren}
          </Modal>
          <Modal
            destroyOnClose
            title="编辑基本信息"
            visible={this.state.visible_updateInfo}
            onOk={this.confirmUpdateInfo}
            onCancel={this.hideUpdateInfoModal}
          >
            {updateInfoModalChildren}
          </Modal>
        </Row>
      </div>
    );
  }
}
const UserSetting = Form.create()(Wrapper);
export default UserSetting;