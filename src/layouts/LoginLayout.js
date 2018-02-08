import React from "react";
import { Link } from "react-router-dom";
import { Form, Button, Icon, Input, Checkbox, message, notification } from "antd";
import md5 from "md5";
import styles from "./LoginLayout.less";
import logo from "../../public/favicon.ico";
import GlobalFooter from "../components/GlobalFooter";
import { login } from "../services/api";

const FormItem = Form.Item;
const copyright = <div>Copyright <Icon type="copyright" /> 2018 云熵网络科技技术部出品</div>;
const links = [{
  title: '云熵官网',
  href: 'http://crazycdn.com',
  blankTarget: true,
}, {
  title: 'GitHub',
  href: 'https://github.com/oneandonly1111/console',
  blankTarget: true,
}, {
  title: 'Ant Design',
  href: 'http://ant.design',
  blankTarget: true,
}];
class LoginForm extends React.Component {

  state = {
    submitting: false,
  }

  /*登录验证*/
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        values.password = md5(values.password);
        values.remember = values.remember.toString();
        /*請求登録*/
        this.setState({
          submitting: true
        });
        login(values).then((res) => {
          if (res.msg == 'success' || res.code == 'Success') {
            this.props.subscribeAuth(true);
            this.props.history.push("/");
            notification.open({
              message: '登录成功！',
              description: `${values.username}，欢迎访问云熵控制台~`,
              icon: <Icon type="smile-circle" style={{ color: '#108ee9' }} />,
            });
          } else {
            message.error("用户名或密码错误！请重新输入~")
          }
          this.setState({
            submitting: false
          });
        });
      }
    });
  }

  render() {
    const { submitting } = this.state;
    const { getFieldDecorator } = this.props.form;
    return (
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.header}>
            <Link to="/">
              <img alt="logo" className={styles.logo} src={logo} />
              <span className={styles.title}>CONSOLE</span>
            </Link>
          </div>
          <div className={styles.desc}></div>
        </div>
        <div className={styles.main}>
          <Form onSubmit={this.handleSubmit}>
            <FormItem>
              {getFieldDecorator('username', {
                rules: [{ required: true, message: '请填写用户名！' }],
              })(
                <Input size="large" prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="用户名" />
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('password', {
                rules: [{ required: true, message: '请填写密码！' }],
              })(
                <Input size="large" prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="密码" />
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('remember', {
                valuePropName: 'checked',
                initialValue: true,
              })(
                <Checkbox>记住密码</Checkbox>
              )}
              <a className={styles.forgot_pwd} href="">忘记密码</a>
              <Button size="large" type="primary" htmlType="submit" className={styles.login_btn} loading={submitting}>
                登录
              </Button>
              或 <a href="">立即注册！</a>
            </FormItem>
          </Form>
        </div>
        <GlobalFooter className={styles.footer} links={links} copyright={copyright} />
      </div>
    );
  }
}

const LoginLayout = Form.create()(LoginForm);
export default LoginLayout;