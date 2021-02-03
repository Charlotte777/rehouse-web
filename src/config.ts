import {Config} from '@heytea/heyyo'
import {IConfig} from '@heytea/heyyo/dist/config'

const config: IConfig = {
  ...Config,
  apiFormat: {
    code: 'code',
    msg: 'message',
    data: 'data',
    page: 'page',
    pageSize: 'size',
    currentPage: 'current',
    count: 'total',
    totalPages: 'pages'
  },
  topAccountMenu: [{key: '/my/reset-password', name: '修改密码'}],
  svgUrl: 'https://ishuhui.oss-cn-hangzhou.aliyuncs.com/svg/',
  // svgMapLength: 30,
  hosts: {api: ''},
  // topAccountMenu: [{ key: '/my/reset-password', name: '重置密码' }]
}

if (process.env.REACT_APP_API_ENV === 'local') {
  config.hosts = {
    api: 'https://www.mandaotec.cn/api',
    console: 'https://www.mandaotec.cn/api',
  }
} else {
  config.hosts = {
    api: 'https://www.mandaotec.cn/api',
    // console: 'https://www.m3brand.top/api',
  }
}
export default config
