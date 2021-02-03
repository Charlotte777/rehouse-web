import {HTTP} from '@heytea/heyyo'
import Store from 'store'
import Config from '../config'
import {IBeforeFn, IBeforeFnOpt} from '@heytea/heyyo/dist/unit/http';

const beforeFn: IBeforeFn = function ({url, data, conf = {}}: IBeforeFnOpt) {
  const opt: IBeforeFnOpt = {url: url, data, conf}
  const {hosts} = Config
  opt.url = url.replace(/^\/([\w\d]+)\//, (a1, a2) => a2 && hosts && hosts[a2] ? `${hosts[a2]}/` : a1)
  const token = Store.get('token') || {};
  if (token) {
    !conf.headers && (conf.headers = {})
    conf.headers.Authorization = 'Bearer ' + token
  }
  return opt
};
const afterFn: any = async function (result: any) {
  try {
    const {code} = result.data;
    if (+code === 401) return window.location.replace('/login');
    return result.data;
  } catch (e) {
  }
  return result;
};
const Http = HTTP({beforeFn, afterFn});
export default Http
const {httpDel, httpGet, httpPatch, httpPost, httpPut} = Http
export const HttpMap = {get: httpGet, post: httpPost, del: httpDel, patch: httpPatch, put: httpPut}
