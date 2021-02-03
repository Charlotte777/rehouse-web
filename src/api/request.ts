import Config from '../config'
import Axios, {AxiosRequestConfig} from 'axios';
import {merge, cloneDeep, forIn} from 'lodash';
import {notification} from 'antd';
import Store from "store";

const defaultConfig = {};
const httpCustomize = {format: true, resolve: false, showErrs: true, login: true, fieldNames: {code: 'code', message: 'message', data: 'data'}};
const defaultFieldNames = {code: 'code', data: 'data', message: 'message'};
const axios = Axios.create({
  timeout: 30000,
  responseType: 'json',
  headers: {'X-Requested-With': 'XMLHttpRequest'}
});
export type  HttpResult = {
  code?: number | string,
  data: any,
  message: string
} & any

export interface HttpCustomize {
  login?: boolean, //code===401状态是否自动跳转到登录
  format?: boolean, //code===0是否返回只data字段
  resolve?: boolean, //code!==0是是否resolve
  showErrs?: { success: boolean, fail: boolean } | boolean, //是否显示提示
  showErrsType?: string, //控制提示类型 可选值跟随notification
  notification?: Object, // 提示配置包括文案等 notification
  description?: { success: string, error: string } //等级最高
  fieldNames?: { code?: string, data?: string, message?: string }, //返回的字段名字fieldNames自定义默认code,data,message
}

export function showMsg({customize, result}: { customize: HttpCustomize, result: any }) {
  let {showErrs} = customize;
  if (!showErrs) return;
  showErrs = typeof showErrs === 'boolean' ? {success: true, fail: true} : showErrs; //默认成功不展示toast
  const {showErrsType} = customize;
  const description: any = customize.description || {};
  const {code, message} = result;
  const config = {message: '提示', description: message, ...(customize.notification || {})};
  if (String(code) === '0') {
    showErrs.success && notification[showErrsType || 'success']({...config, description: description.success || config.description})
  } else {
    showErrs.fail && notification[showErrsType || 'error']({...config, description: description.error || config.description})
  }
  return true;
}

export function getUrl(url: string = '') {
  const {hosts}: any = Config;
  return `${hosts.api}${url}`
}

export function getFieldNames(_customize: HttpCustomize = httpCustomize) {
  const {code, data, message} = _customize.fieldNames || defaultFieldNames;
  return {code, data, message};
}

export function getFieldByNames(source: any, fieldNames: { code?: string, message?: string, data?: string } = defaultFieldNames) { //通过字段获取值
  const {code, message, data} = merge({}, defaultFieldNames, fieldNames);
  try {
    return {code: source[code], data: source[data], message: source[message] || source.message || source.msg}; //此处不得已而为之，后端message字段极度混乱,后端统一后前端应该去除
  } catch
    (e) {
    return {code: '', data: '', message: ''};
  }
}

export default async function http(config: AxiosRequestConfig = defaultConfig, customize: HttpCustomize = httpCustomize): Promise<HttpResult> {
  const url = getUrl(config.url);
  const Authorization = Store.get('token') ? `${Store.get('token')}` : undefined;
  const _config = merge({}, defaultConfig, config, {url, headers: {token: Authorization}});
  console.log(_config,'_config');
  const _customize = merge({}, httpCustomize, customize);
  const {format, login} = _customize;
  const fieldNames = getFieldNames(_customize);
  try {
    if (!url) return {code: '', data: '', message: ''};
    const result: any = await axios(_config);
    const {code, data, message} = getFieldByNames(result.data, fieldNames);
    showMsg({customize: _customize, result: {code, data, message}});
    if ([401, 300000].includes(+code) && login) window.location.replace('/login');
    return Promise[String(code) === '0' ? 'resolve' : 'reject' as any]({code, data, message});
  } catch (e) {
    const response = (e && e.response) || {};
    if ([401, 300000].includes(+response.status) && login) window.location.replace('/login');
    showMsg({customize: _customize, result: {code: +response.status, message: '未知错误'}});
    if (format) return '';
    return {code: '', data: '', message: ''};
  }
}

export function downFileByBlob(blob: any, name: string) {
  try {
    let downloadElement = document.createElement('a');
    let href = window.URL.createObjectURL(blob);
    downloadElement.href = href;
    downloadElement.download = name;
    document.body.appendChild(downloadElement);
    downloadElement.click();
    document.body.removeChild(downloadElement);
    window.URL.revokeObjectURL(href);
    return true;
  } catch (e) {
    return false;
  }
}

export async function httpDownByBlob(config: AxiosRequestConfig = defaultConfig, customize: HttpCustomize = httpCustomize, downloadName: string = '') {
  const _config = merge({}, defaultConfig, config, {responseType: 'blob'});
  const data = await http(_config, customize);
  if (downloadName) downFileByBlob(data, downloadName);
  return data;
}

export async function httpFile(config: AxiosRequestConfig = defaultConfig, customize: HttpCustomize = httpCustomize): Promise<HttpResult> {
  const formData = new FormData();
  const dataType = (arg: any) => (/^\[object (.*)]$/.exec(Object.prototype.toString.call(arg)) as Array<any>)[1].toLocaleLowerCase();
  const isObject = (arg: any) => dataType(arg) === 'object';
  const isFile = (arg: any) => dataType(arg) === 'file';
  const isFileList = (arg: any) => dataType(arg) === 'fileList';
  const data = cloneDeep(config.data);
  forIn(data, (value, key) => {
    if (isObject(value) && value.hasOwnProperty('originFileObj') && isFile(value.originFileObj)) { //antd upload组件
      formData.set(key, value.originFileObj);
    } else if (isObject(value) && isFileList(value)) {
      forIn(value, (file) => {
        formData.append(`${key}[]`, file);
      });
    } else if (Array.isArray(value) && value.every(item => isFile(item.originFileObj))) {//antd upload组件
      forIn(value.map(item => item.originFileObj), (file) => {
        formData.append(`${key}[]`, file);
      });
    } else {
      formData.append(key, value);
    }
  });
  const _config = merge({method: 'post', data: formData}, config, {headers: {"Content-Type": "multipart/form-data"}});
  const _customize = merge({description: {success: '上传成功'}}, customize);
  return await http(_config, _customize)
}
