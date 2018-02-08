import React from "react";
import md5 from "md5"
import { Row, Col, Button, Icon, Modal, Form, Input, Radio, Select, message, Table, Tag, Divider } from "antd";
import styles from './UserManagement.less';
// import PageHeader from '../../components/PageHeader';
import { queryUserInfo, queryUserList, createUser, deleteUser, resetUserPwd, AdminUpdateUserInfo, logout } from "../../services/api";
import { getCookie } from '../../utils/utils';
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

class Wrapper extends React.Component {
  state = {
    dataSource: [],
    loading: true,
    visible_createUser: false,
    visible_resetPwd: false,
    visible_updateInfo: false,
    confirmDirty: false,
    userInfo: {},
  }

  /*获取用户列表*/
  queryUserList = () => {
    this.setState({
      loading: true
    });
    queryUserList().then((res) => {
      if (res.msg == 'success' || res.code == 'Success') {
        const dataSource = [];
        res.data.map((item, index) => {
          dataSource.push({
            ...item,
            key: item.key || index
          });
        });
        this.setState({
          dataSource: dataSource
        });
      }
    });
    this.setState({
      loading: false
    });
  }

  componentDidMount() {
    this.queryUserList();
  }

  /*添加用户*/
  showCreateUserModal = () => {
    this.setState({
      visible_createUser: true,
    });
  }
  hideCreateUserModal = (e) => {
    this.setState({
      visible_createUser: false,
    });
  }
  confirmCreateUser = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll(['user', 'alias', 'passwd', 'sex', 'email', 'phone', 'wechat'], { force: true }, (err, values) => {
      if (!err) {
        values.prefix = undefined;
        values.passwd = md5(values.passwd);
        createUser(values).then(res => {
          if (res.msg == 'success' || res.code == 'Success') {
            message.success('创建用户成功！', 1, () => { this.queryUserList() });
          } else {
            message.error(`创建用户失败！msg：${res.msg}`);
          }
        });
        this.setState({
          visible_createUser: false,
        });
      }
    });
  }

  /*删除用户*/
  delUser = (id, user) => {
    Modal.confirm({
      title: `你确定要删除用户：${user} 吗？`,
      content: '此操作将撤销该用户对控制台的访问权限，请谨慎操作！',
      onOk: () => {
        deleteUser({ id: id }).then(res => {
          if (res.msg == 'success' || res.code == 'Success') {
            message.success(`用户${user}删除成功！`, 1, () => { this.queryUserList() });
          } else {
            message.error(`用户${user}删除失败！msg：${res.msg}`);
          }
        });
      }
    });
  }

  /*重置密码*/
  showResetPwdModal = (user) => {
    this.setState({
      visible_resetPwd: true,
      user: user
    });
  }
  hideResetPwdModal = (e) => {
    this.setState({
      visible_resetPwd: false,
    });
  }
  confirmResetPwd = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll(['user_reset', 'password_reset', 'confirm_reset'], { force: true }, (err, values) => {
      if (!err) {
        resetUserPwd({ user: values.user_reset, passwd: md5(values.password_reset) }).then(res => {
          if (res.msg == 'success' || res.code == 'Success') {
            if (getCookie('username') == values.user_reset) {
              console.log("history", this.props.history);
              message.success("你的密码重置成功！请重新登录~", 2.5, () => {
                logout();
                this.props.history.push("/user/login");
              });
            } else {
              message.success("密码重置成功！");
            }
          } else {
            message.error(`密码重置失败！msg：${res.msg}`);
          }
        });
        this.setState({
          visible_resetPwd: false,
        });
      }
    });
  }

  /*重置密码验证*/
  handleConfirmBlur = (e) => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  }
  checkPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password_reset')) {
      callback('两次输入的密码不一致，请重新输入！');
    } else {
      callback();
    }
  }
  checkConfirm = (rule, value, callback) => {
    const form = this.props.form;
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirm'], { force: true });
    }
    callback();
  }

  /*编辑信息*/
  showUpdateInfoModal = (userInfo) => {
    this.setState({
      visible_updateInfo: true,
      userInfo: userInfo
    });
    this.props.form.setFieldsValue({
      user: userInfo.user
    });
  }
  hideUpdateInfoModal = (e) => {
    this.setState({
      visible_updateInfo: false,
      userInfo: {}
    });
  }
  confirmUpdateInfo = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll(['user_upd', 'alias_upd', 'sex_upd', 'email_upd', 'phone_upd', 'wechat_upd'], { force: true }, (err, values) => {
      if (!err) {
        const params = {
          user: values.user_upd,
          alias: values.alias_upd,
          sex: values.sex_upd,
          email: values.email_upd,
          phone: values.phone_upd,
          wechat: values.wechat_upd
        }
        AdminUpdateUserInfo(params).then(res => {
          if (res.msg == 'success' || res.code == 'Success') {
            message.success("更新用户信息成功！", 1, () => { this.queryUserList() });
          } else {
            message.error(`更新用户信息失败！msg：${res.msg}`);
          }
        });
        this.setState({
          visible_updateInfo: false,
        });
      }
    });
  }

  render() {
    const { dataSource, loading, visible_resetPwd, visible_updateInfo, visible_createUser, userInfo } = this.state;
    const { getFieldDecorator } = this.props.form;
    const columns = [{
      title: "用户名 / 显示名",
      dataIndex: "user",
      key: "user",
      render: (text, record) => <span>{text} / {record.alias}</span>
    }, {
      title: "性别",
      dataIndex: "sex",
      key: "sex",
      render: text => { return text == 'male' ? <Tag color="blue">{text}</Tag> : <Tag color="red">{text}</Tag> }
    }, {
      title: "邮箱",
      dataIndex: "email",
      key: "email",
      render: text => text ? text : '--',
    }, {
      title: "电话",
      dataIndex: "phone",
      key: "phone",
      render: text => text ? text : '--',
    }, {
      title: "微信",
      dataIndex: "wechat",
      key: "wechat",
      render: text => text ? text : '--',
    }, {
      title: "创建时间",
      dataIndex: "createTime",
      key: "createTime",
    }, {
      title: "操作",
      dataIndex: "option",
      key: "option",
      render: (text, record) => (
        <span>
          <a onClick={()=>this.showUpdateInfoModal(record)}>编辑</a>
          <Divider type="vertical" />
          <a onClick={()=>this.showResetPwdModal(record.user)}>重置密码</a>
          <Divider type="vertical" />
          <a onClick={()=>this.delUser(record.id, record.user)}>删除</a>
        </span>
      ),
    }];
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
      <Select style={{ width: 70 }}>
        <Option value="86">+86</Option>
      </Select>
    );
    const createUserModalChildren = (
      <Form>
        <FormItem
          {...formItemLayout}
          label="用户名"
        >
          {getFieldDecorator('user', {
            rules: [{
              required: true, message: '请为该用户填写一个用户名！',
              pattern: /^[\w.-]{0,64}$/g, message: '长度1-64个字符，允许输入大小写英文字母、数字、"."、"_"或"-"',
            }],
          })(
            <Input />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="显示名"
        >
          {getFieldDecorator('alias', {
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
          label="登录密码"
        >
          {getFieldDecorator('passwd', {
            rules: [{
              required:true, message: '请为该用户填写一个登录密码！',
              pattern: /^[^\u4e00-\u9fa5]{8,}$/g, message: '密码不小于8位',
            }],
          })(
            <Input type='password'/>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="性别"
        >
          {getFieldDecorator('sex', {
            rules: [{
              required: true, message: '请选择用户性别！',
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
            rules: [{ required: false, message: 'Please input your phone number!',
            pattern: /^1(3|4|5|7|8)\d{9}$/g, message: '无效的电话号码！',
          }],
          })(
            <Input addonBefore={prefixSelector} style={{ width: '100%' }} />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="微信"
        >
          {getFieldDecorator('wechat', {
            rules: [{
              required: false, message: 'Please input your E-mail!',
            }],
          })(
            <Input /> 
          )}
        </FormItem>
      </Form>
    );
    const resetPwdModalChildren = (
      <Form>
        <FormItem
          {...formItemLayout}
          label="用户名"
        >
          {getFieldDecorator('user_reset', {
            initialValue:this.state.user,
            rules: [{
              required: true, message: '请填写用户名！',
            }],
          })(
            <Input disabled/>
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="新密码"
          hasFeedback
        >
          {getFieldDecorator('password_reset', {
            rules: [{
              required: true, message: '请为该用户填写一个登录密码！',
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
          {getFieldDecorator('confirm_reset', {
            rules: [{
              required: true, message: '请确认你的密码！',
            }, {
              validator: this.checkPassword,
            }],
          })(
            <Input type="password" onBlur={this.handleConfirmBlur} />
          )}
        </FormItem>
      </Form>
    );
    const updateInfoModalChildren = (
      <Form>
        <FormItem
          {...formItemLayout}
          label="用户名"
        >
          {getFieldDecorator('user_upd', {
            initialValue:userInfo.user,
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
          {getFieldDecorator('alias_upd', {
            initialValue:userInfo.alias,
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
          {getFieldDecorator('sex_upd', {
            initialValue:userInfo.sex,
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
          {getFieldDecorator('email_upd', {
            initialValue:userInfo.email,
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
          {getFieldDecorator('phone_upd', {
            initialValue:userInfo.phone,
            rules: [{ required: false, message: 'Please input your phone number!',
              pattern: /^1(3|4|5|7|8)\d{9}$/g, message: '无效的电话号码！',
            }],
          })(
            <Input addonBefore={prefixSelector} style={{ width: '100%' }} />
          )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label="微信"
        >
          {getFieldDecorator('wechat_upd', {
            initialValue:userInfo.wechat,
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
            <Icon type="user" style={{marginRight:8+'px'}} />用户管理
            <Button type="primary" style={{float:'right'}} onClick={this.showCreateUserModal}><Icon type="user-add" />新建用户</Button>
          </Col>
          <Col span={23} style={{paddingTop:12+'px',borderBottom:1+'px'+' solid'+' #e9e9e9'}}></Col>
          <Col span={23} style={{marginTop:24+'px'}}>
            <Table
              columns={columns}
              dataSource={dataSource}
              loading={loading}
              pagination={{
                showTotal:(total, range) => `数据${total}条，当前显示第${range[0]}条 到 第${range[1]}条 `,
                showSizeChanger:true,
                showQuickJumper:true,
              }}
             />
            <Modal
              title="新建用户"
              width={600}
              destroyOnClose
              visible={visible_createUser}
              onOk={this.confirmCreateUser}
              onCancel={this.hideCreateUserModal}
            >
              {createUserModalChildren}
            </Modal>
            <Modal
              title="重置用户密码"
              destroyOnClose
              visible={visible_resetPwd}
              onOk={this.confirmResetPwd}
              onCancel={this.hideResetPwdModal}
            >
              {resetPwdModalChildren}
            </Modal>
            <Modal
              title="编辑用户基本信息"
              width={600}
              destroyOnClose
              visible={visible_updateInfo}
              onOk={this.confirmUpdateInfo}
              onCancel={this.hideUpdateInfoModal}
            >
              {updateInfoModalChildren}
            </Modal>
          </Col>
        </Row>
      </div>
    );
  }
}
const UserManagement = Form.create()(Wrapper);
export default UserManagement;