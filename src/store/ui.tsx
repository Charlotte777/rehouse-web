import {observable, action, computed} from 'mobx'
import {IResult} from '@heytea/heyyo/dist/unit/http'


export interface IUI {
  pageTitle: string,

  setPageTitle(title: string): void

  clearMyMenu(): void

  site: {
    name: string,
    keywords: string,
    description: string
  }
  layout: { clientHeight: number, clientWidth: number, header: number },
  myMenu: any[],
  // selectedKeys: { [key: string]: any },
  leftMenuMap: { [key: string]: any },
  initDataLoading: boolean,
  initData: Function
}

class UI implements IUI {
  constructor() {
    if (process.browser) {
      const {clientWidth, clientHeight} = document.documentElement
      this.setLayout({clientWidth, clientHeight})
      window.onresize = () => {
        const {clientWidth, clientHeight} = document.documentElement
        this.setLayout({clientWidth, clientHeight})
      }
    }
  }

  @observable pageTitle = ''
  setPageTitle = (title: string) => {
    this.pageTitle = title
  }
  @observable site = {
    name: '管理后台',
    keywords: '管理 后台',
    description: '管理后台'
  }
  @observable layout = {clientHeight: 600, scrollTop: 0, clientWidth: 800, header: 48}
  @action setLayout = (obj: any): void => {
    this.layout = {...this.layout, ...obj}
  }
  @observable myMenu:any = []
  @observable initDataLoading = false

  @action
  initData = async (): Promise<IResult> => {
    this.initDataLoading = true
    const menuData = await this.getMyMenu()
    this.initDataLoading = false
    return menuData
  }
  @action
  setMyMenu = (arr: any[]) => {
    console.log(arr, 'arr');
    
    // @ts-ignore
    this.myMenu = arr
  }
  @action
  clearMyMenu = () => {
    this.myMenu = []
  }

  @action
  getMyMenu = async (): Promise<any> => {
      const menuData = {code: 0, data: {moduleList: [{
        leader: "admin",
        name: "房源系统",
        path: "/house",
        navList: [{
          icon: "user",
          id: 1,
          navName: "用户信息",
          privType: 1,
          webUrl: "/house/user/list"
        },{
          icon: "sys",
          id: 1,
          navName: "房源管理",
          privType: 1,
          webUrl: "/house/operations/list"
        },{
          icon: "monitor",
          id: 1,
          navName: "房源广告管理",
          privType: 1,
          visible: true,
          webUrl:  "/house/adUpload/add"
        }
      ]
      }]}}
      const handlePrivilege = (priv: any): any => {
        const {navList, children, icon, code: id, name, navName, path, webUrl, privType = '1'} = priv;
        const _children = navList || children;
        if (String(privType) === '0') return null;
        let child: any[] = [];
        if (Array.isArray(_children) && _children.length) {
          child = _children.map(item => handlePrivilege(item)).filter(item => item);
        }
        return {id, icon, name: name || navName, path: path || webUrl, child: child.length > 0 ? child : ''};
      };
      const menu: any[] = [];
      menuData.data.moduleList.forEach((priv: any) => {
        const menuItem = handlePrivilege(priv);
        menuItem && menu.push(menuItem)
      });
      this.myMenu = menu
  }

  @computed
  get leftMenuMap() {
    const map: { [key: string]: any } = {}
    this.myMenu && this.myMenu.forEach((item: any) => {
      map[item.path] = item.child || []
    });
    return map
  }
}

export default new UI()
