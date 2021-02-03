import Http from './http'
import request from './request'; 

const {httpGet, httpPost, httpPatch} = Http

interface ILogin {
  name: string,
  password: string
}

interface IReset {
  username: string,
  captcha: string,
  password: string,
}

interface IPasswordReset {
  oldPassword: string,
  newPassword: string,
  rePassword: string
}

export function getInfo() {
  return httpGet('/console/index', '', false)
}

export function getPrivilege() {
  return httpGet('/console/api/service-upms/admin/nav/priv')
}


export async function login(data: ILogin, tips: boolean | string = false) {
  try {
    return await request({url: '/login', data, method: 'POST'}, {resolve: true, format: false})
  } catch (e) {
    return e;
  }
}


export async function getImgCaptcha(type: string) {
  return httpPost('/console/captcha/img', type, false)
}


export async function getCode({username = ''}: { username: string }) {
  return httpPost('/console/api/service-upms/admin/user/forgetPassword', {username})
}

export async function reset(data: IReset, tips: boolean | string = false) {
  try {
    return request({url: '/console/api/service-upms/admin/user/forgetPassword', data, method: 'patch'}, {format: false})
  } catch (e) {
    return e;
  }
}

export async function passwordReset(data: IPasswordReset, tips: boolean | string = true) {
  return httpPatch('/console/api/service-upms/admin/user/password/change', data, tips)
}

export async function logout(data?: IReset, tips: boolean | string = false) {
  return httpPost('/console/api/service-upms/admin/user/logout', data, tips)
}

export async function passwordInit(data: any, tips: boolean | string = false): Promise<any> {
  try {
    return request({url: '/console/api/service-upms/admin/user/password/reset/first', data}, {format: false})
  } catch (e) {
    return e;
  }
  // if (passwordInitData.code === 0) {
  //   Store.set('token', passwordInitData.data && passwordInitData.data.token || '')
  // }
  // return passwordInitData
}
