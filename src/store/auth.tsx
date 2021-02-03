import {observable, action, computed} from 'mobx'
import Store from 'store'
import {IFormStatus} from '@heytea/heyyo/dist/store/_i'
import {IResult} from '@heytea/heyyo/dist/unit/http'
import {ICURD} from '@heytea/heyyo/dist/store/curd'
import {IForm} from '@heytea/heyyo/dist/store/form'
import {getInfo, login, reset, logout, getCode, getImgCaptcha, passwordReset, passwordInit} from '../api/admin'
import {Form} from '@heytea/heyyo'
import Config from '../config'

const {codeValidated, codeSuccess, apiFormat: {code}} = Config

interface IUserData {
  user?: IUser,
  token?: string
}

interface IUser {
  id: number,
  name: string
}

export interface IAuth {
  dataFn: { [key: string]: (...args: any) => Promise<IResult> }
  dfUser: IUser,
  user: IUser,
  referrer: string,

  setUser(user?: IUserData): void,

  setReferrer(url: string): void,

  infoLoading: boolean

  getInfo(): Promise<IResult>,


  loginStatus: IFormStatus,
  loginForm: { name: string, password: string },
  loginErrs: { name: string, password: string },
  loginFormConf: any,

  login(): Promise<IResult>,

  logout(): Promise<IResult>,

  resetStatus: IFormStatus,
  resetForm: { username: string, captcha: string, password: string, rePassword: string },
  resetErrs: { username: string, captcha: string, password: string, rePassword: string },
  resetFormConf: any,

  reset(): Promise<IResult>,

  passwordInitStatus: IFormStatus,
  passwordInitForm: { username: string, oldPassword: string, newPassword: string, rePassword: string },
  passwordInitErrs: { username: string, oldPassword: string, newPassword: string, rePassword: string },
  passwordInitFormConf: any,

  passwordInit(): Promise<IResult>,

  passwordResetStatus: IFormStatus,
  passwordResetForm: { oldPassword: string, newPassword: string, rePassword: string },
  passwordResetErrs: { oldPassword: string, newPassword: string, rePassword: string },
  passwordResetFormConf: any,

  passwordReset(): Promise<IResult>,
}

@Form
class Auth implements IAuth {
  @observable dict = {loginImgCaptcha: {uuid: '', img: ''}, resetImgCaptcha: {uuid: '', img: ''}}
  dataFn = {login, getInfo, reset, logout, getImgCaptcha, getCode, passwordReset, passwordInit}
  dfUser = {id: 0, name: ''};
  @observable user: IUser = {...this.dfUser, ...(Store.get('user') || {})};
  @observable referrer: string = '';

  @action
  setUser = (userObj: IUserData = {}) => {
    const token = userObj;
    if (!token) {
      Store.set('user', {});
      Store.remove('token');
      window.location.replace('/login');
      return;
    }
    // this.user = {...this.user, ...user};
    // Store.set('user', this.user);
    Store.set('token', token);
  };

  @action
  setReferrer = (url: string): void => {
    this.referrer = url
  }

  @action setCaptcha(type: string, data: { uuid: string, img: string }) {
    // @ts-ignore
    this.dict[`${type}ImgCaptcha`] = data
    // @ts-ignore
    this[`${type}Form`] && (this[`${type}Form`].imgUuid = data.uuid)
  }

  @action
  async getCaptcha(type: string) {
    const data = await this.dataFn.getImgCaptcha(type)
    if (data[code] === codeSuccess) {
      const {uuid, img} = data.data
      this.setCaptcha(type, {uuid, img})
    }
  }

  // 登录
  dfLoginForm = {name: '', password: ''}
  @observable loginStatus: IFormStatus = {submit: false, loading: false}
  @observable loginForm = {...this.dfLoginForm}
  @observable loginErrs = {name: '', password: ''}

  @computed get loginFormConf() {
    return {
      fields: [
        {
          field: 'name',
          type: 'input',
          span: 24,
          rules: 'required',
          aliasName: '邮箱/手机',
          props: {placeholder: '用户名'}
        },
        {
          field: 'password',
          type: 'input',
          span: 24,
          rules: 'required',
          aliasName: '密码',
          props: {type: 'password', placeholder: '密码'},
        }
      ]
    }
  }

  @action
  login = async (): Promise<IResult> => {
    this.loginStatus.loading = true;
    const userData = await this.dataFn.login(this.loginForm, '登录成功')
    const {code, msg, data} = userData;
    if (code === 0 && data !== null && data) {
      this.setUser(data);
      this.loginForm = {...this.dfLoginForm}
    }else if (data === null) {
      this.loginErrs = Object.assign(this.loginErrs, msg)
      const {uuid = '', img = ''} = data || {}
      this.loginStatus.loading = false
      img && this.setCaptcha('login', {uuid, img})
    } else 
    this.loginStatus.loading = false
    return userData
  };

  // 获取用户信息
  @observable infoLoading = false
  @action
  getInfo = async () => {
    debugger
    this.infoLoading = true
    const userData = await this.dataFn.getInfo()
    const {code, data} = userData;
    code === codeSuccess ? this.setUser(data) : this.setUser();
    this.infoLoading = false
    return userData
  }


  // 重置密码
  dfResetForm = {username: '', captcha: '', password: '', rePassword: '',}
  @observable resetStatus = {submit: false, loading: false}
  @observable resetForm = {...this.dfResetForm}
  @observable resetErrs = {username: '', password: '', captcha: '', rePassword: ''};

  @computed get resetFormConf() {
    const {resetErrs: {username: eUsername}, resetForm: {username}} = this
    return {
      fields: [
        {
          field: 'username',
          type: 'input',
          span: 24,
          rules: 'required',
          aliasName: '用户名',
          props: {placeholder: '用户名'}
        },
        {
          field: 'captcha',
          type: 'captcha',
          span: 24,
          rules: 'required|captcha',
          aliasName: '验证码',
          props: {
            placeholder: '验证码',
            isActive: !eUsername && username,
            onGetCode: () => this.dataFn.getCode({username})
          }
        },
        {
          field: 'password',
          type: 'input',
          span: 24,
          rules: 'required|password',
          aliasName: '密码',
          props: {type: 'password', placeholder: '密码', autoComplete: 'new-password'},
        },
        {
          field: 'rePassword',
          type: 'input',
          span: 24,
          rules: {required: '', password: '', equals: {field: 'password', original: '确认密码', equal: '密码'}},
          aliasName: '确认密码',
          props: {type: 'password', placeholder: '确认密码', autoComplete: 'new-password'},
        }
      ]
    }
  }

  @action
  reset = async (): Promise<IResult> => {
    this.resetStatus.loading = true
    const userData = await this.dataFn.reset(this.resetForm)
    const {code, msg} = userData
    if (code === codeValidated) {
      this.resetErrs = Object.assign(this.resetErrs, msg)
    } else if (code === codeSuccess) {
      this.resetForm = {...this.dfResetForm}
    }
    this.resetStatus.loading = false
    return userData
  }

  @action
  logout = async () => {
    const outData = await this.dataFn.logout();
    if (outData[code] === codeSuccess || outData.status === 204) {
      this.setUser();
    }
    return outData
  }

  // 初始密码
  dfPasswordInitForm = {username: '', oldPassword: '', newPassword: '', rePassword: ''}
  @observable passwordInitStatus: IFormStatus = {submit: false, loading: false}
  @observable passwordInitForm = {...this.dfPasswordInitForm}
  @observable passwordInitErrs = {...this.dfPasswordInitForm}
  passwordInitFormConf = {
    fields: [
      {
        field: 'username',
        type: 'input',
        span: 24,
        rules: 'required',
        aliasName: '用户名',
        props: {placeholder: '用户名'}
      },
      {
        field: 'oldPassword',
        type: 'input',
        span: 24,
        rules: 'required|password',
        aliasName: '当前密码',
        props: {type: 'password', placeholder: '当前密码'},
      },
      {
        field: 'newPassword',
        type: 'input',
        span: 24,
        rules: 'required|password',
        aliasName: '新密码',
        props: {type: 'password', placeholder: '新密码'},
      },
      {
        field: 'rePassword',
        type: 'input',
        span: 24,
        rules: {required: '', password: '', equals: {field: 'newPassword', original: '确认密码', equal: '密码'}},
        aliasName: '确认密码',
        props: {type: 'password', placeholder: '确认密码'},
      }
    ]
  }

  @action
  passwordInit = async (): Promise<IResult> => {
    this.passwordInitStatus.loading = true
    const {username, oldPassword, newPassword} = this.passwordInitForm
    const userData = await this.dataFn.passwordInit({username, oldPassword, newPassword})
    const {data} = userData
    if (userData[code] === codeValidated) {
      this.passwordInitErrs = Object.assign(this.passwordInitErrs, data)
    } else if (userData[code] === codeSuccess) {
      this.passwordInitForm = {...this.dfPasswordInitForm}
    }
    this.passwordInitStatus.loading = false
    return userData
  }


  // 初始密码
  dfPasswordResetForm = {oldPassword: '', newPassword: '', rePassword: ''}
  @observable passwordResetStatus: IFormStatus = {submit: false, loading: false}
  @observable passwordResetForm = {...this.dfPasswordResetForm}
  @observable passwordResetErrs = {...this.dfPasswordResetForm}
  passwordResetFormConf = {
    props: {layout: 'inline'},
    fields: [
      {
        title: '当前密码',
        field: 'oldPassword',
        type: 'input',
        span: 24,
        rules: 'required|password',
        props: {type: 'password', placeholder: '当前密码'},
      },
      {
        field: 'newPassword',
        type: 'input',
        span: 24,
        rules: 'required|password',
        title: '新密码',
        props: {type: 'password', placeholder: '新密码', autoComplete: 'off'},
      },
      {
        field: 'rePassword',
        type: 'input',
        span: 24,
        rules: {required: '', password: '', equals: {field: 'newPassword', original: '确认密码', equal: '密码'}},
        title: '确认密码',
        props: {type: 'password', placeholder: '确认密码', autoComplete: 'off'},
      }
    ]
  }

  @action
  passwordReset = async (): Promise<IResult> => {
    this.passwordResetStatus.loading = true
    const resetData = await this.dataFn.passwordReset(this.passwordResetForm)
    if (resetData[code] === codeValidated) {
      this.resetErrs = Object.assign(this.resetErrs, resetData.data)
    } else if (resetData[code] === codeSuccess) {
      this.passwordResetForm = {...this.dfPasswordResetForm}
    }
    this.passwordResetStatus.loading = false
    return resetData
  }
}

export default new Auth() as Auth & ICURD<IResult> & IForm
