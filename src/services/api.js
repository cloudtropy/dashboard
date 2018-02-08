import request from "../utils/request";
const basicMonit = "/api/basic/monitor";
const authority = "/api/authority";
/*----------------start 登录登出api-------------*/
/*登录*/
export async function login(params) {
  return request("/api/login", {
    method: 'POST',
    body: params
  });
}
/*登出*/
export async function logout() {
  return request("/api/logout", {
    method: 'POST',
  });
}
/*-------------------end 登录登出api-------------*/

/*-----------------start 用户相关api-------------*/
/*获取用户基本信息*/
export async function queryUserInfo() {
  return request("/api/user/info", {
    method: 'GET',
  });
}
/*修改用户基本信息*/
export async function updateUserInfo(params) {
  return request("/api/user/update", {
    method: 'POST',
    body: params
  });
}
/*修改用户密码*/
export async function updateUserPwd(params) {
  return request("/api/user/pwupdate", {
    method: 'POST',
    body: params
  });
}
/*获取用户列表*/
export async function queryUserList() {
  return request(`${authority}?action=GetUserList`, {
    method: 'GET',
  });
}
/*创建用户*/
export async function createUser(params) {
  return request(`${authority}?action=CreateUser`, {
    method: 'POST',
    body: params
  });
}
/*删除用户*/
export async function deleteUser(params) {
  return request(`${authority}?action=DeleteUser`, {
    method: 'POST',
    body: params
  });
}
/*管理员重置用户密码*/
export async function resetUserPwd(params) {
  return request(`${authority}?action=ResetPassword`, {
    method: 'POST',
    body: params
  });
}
/*管理员修改用户信息*/
export async function AdminUpdateUserInfo(params) {
  return request(`${authority}?action=UpdateUserInfo`, {
    method: 'POST',
    body: params
  });
}
/*-----------------end 用户相关api-------------*/

/*----------------start 基础监控相关api-------------*/
/*获取资产列表*/
export async function queryHostList() {
  return request(`${basicMonit}?action=GetHostList`, {
    method: 'GET',
  });
}
/*获取回收站列表*/
export async function queryRemovedHostList() {
  return request(`${basicMonit}?action=GetRemovedHostList`, {
    method: 'GET',
  });
}
/*编辑资产列表备注信息*/
export async function updateHostInfo(params) {
  return request(`${basicMonit}?action=UpdateHostInfo`, {
    method: 'POST',
    body: params
  });
}
/*获取指定主机监控信息*/
export async function queryHostMonitorData(params) {
  return request(`${basicMonit}?action=GetHostMonitorData&hostId=${params.hostId}&start=${params.start}&end=${params.end}`, {
    method: 'GET',
  });
}
/*-----------------end 基础监控相关api-------------*/