import { notification } from 'antd';

const codeMessage = {
  200: '服务器成功返回请求的数据',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据,的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器',
  502: '网关错误',
  503: '服务不可用，服务器暂时过载或维护',
  504: '网关超时',
};

const checkStatus = (response) => {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    const errorText = codeMessage[response.status] || response.statusText;
    var error = new Error(errorText);
    error.response = response;
    notification.error({
      message: `请求错误 ${response.status}：${response.url}`,
      description: `${errorText}`
    });
    throw error;
  }
}
/*
  request 使用fetch发送请求，返回的是一个Promise对象  
*/
export default function request(url, options) {
  //Fetch 请求默认是不带 cookie 的，需要设置credentials: 'include'
  const defaultOptions = {
    credentials: 'include',
  };
  const newOptions = { ...defaultOptions, ...options };
  if (newOptions.method == 'POST' || newOptions.method == 'PUT') {
    newOptions.headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...newOptions.headers
    }
  }
  newOptions.body ? newOptions.body = JSON.stringify(newOptions.body) : null;
  return fetch(url, newOptions)
    .then(checkStatus)
    .then(response => {
      return response.json();
    })
    .catch((err) => {
      const status = err.response.status;
      if (status === 401) {
        //logout
        return;
      }
      if (status === 403) {
        //403
        return;
      }
      if (status <= 504 && status >= 500) {
        //500
        return;
      }
      if (status >= 404 && status < 422) {
        //404
        return;
      }
    });
}