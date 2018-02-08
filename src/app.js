import React from "react";
import { BrowserRouter as Router, Route, Switch, Redirect } from "react-router-dom";
import LoginLayout from "./layouts/LoginLayout";
import BasicLayout from "./layouts/BasicLayout";
import "./styles/main.css";
import { getCookie } from "./utils/utils";

const isAuthenticated = getCookie("sid") ? true : false;
const userName = getCookie("userName") ? getCookie("userName") : null;

console.log("isAuthenticated", isAuthenticated)
export default class App extends React.Component {
  state = {
    isAuthenticated: getCookie("sid") ? true : false
  }
  subscribeAuth = (auth) => {
    this.setState({
      isAuthenticated: auth
    });
  }
  render() {
    console.log("app--render!!!", this.state.isAuthenticated)
    return (
      <Router>
        <div>
          <Switch>
             <PublicRoute path="/user/login" component={LoginLayout} subscribeAuth={this.subscribeAuth} />
             <PrivateRoute path="/" component={BasicLayout} subscribeAuth={this.subscribeAuth} isAuthenticated={this.state.isAuthenticated} />
          </Switch>
        </div>
      </Router>
    );
  }
}

const PrivateRoute = ({ component: Component, subscribeAuth, isAuthenticated, ...rest }) => (
<Route {...rest} render={ 
  props =>(isAuthenticated ? (<Component {...props} subscribeAuth={subscribeAuth} />): (<Redirect to={{ pathname: '/user/login', state: { from: props.location }}}/>))
}
/>
)

const PublicRoute = ({ component: Component, subscribeAuth, ...rest }) => (
<Route {...rest} render={
  props => <Component {...props} subscribeAuth={subscribeAuth} />
}
/>
)

//暂时无需
const fakeAuth = {
  isAuthenticated: true,
  authenticate(cb) {
    this.isAuthenticated = true
    setTimeout(cb, 100) // fake async
  },
  signout(cb) {
    this.isAuthenticated = false
    setTimeout(cb, 100)
  }
}