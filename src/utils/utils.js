/*get cookie*/
export const getCookie = (name) => {
  var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
  if (arr = document.cookie.match(reg))
    return unescape(arr[2]);
  else
    return null;
}
/*ws连接*/
export const getWs = () => {
  if (window.WebSocket != undefined) {
    var connection = new WebSocket('ws://192.168.1.61:10101/wsapi/msg');
    return connection
  }
}