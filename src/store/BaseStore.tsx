import {computed, observable} from 'mobx';
import IStore, {IListFormConf, IListTable} from '@heytea/heyyo/dist/store/_i';
import {IResult} from '@heytea/heyyo/dist/unit/http';
import {cloneDeep} from 'lodash';
import { ICURD } from '@heytea/heyyo/dist/store/curd'
interface ICurd extends ICURD<any> {

}
export default class implements IStore {
  constructor() {
    return this.__init();
  }
  // componentWillMount = () => {
  //   const initDataFn = this[`${this.name}InitDataFn`]
  //     typeof initDataFn === 'function' &&
  //       initDataFn.call(this)
  // }
  getList = () => '';
  downBolb = (blob: any, name: string) => {
    var downloadElement = document.createElement('a')
    var href = window.URL.createObjectURL(blob)
    downloadElement.href = href
    downloadElement.download = name
    document.body.appendChild(downloadElement)
    downloadElement.click()
    document.body.removeChild(downloadElement)
    window.URL.revokeObjectURL(href)
  }
  dataFn = {}
  @observable listForm = {page: 1, size: 20};
  @observable listData: IResult = {code: '', data: '', msg: ''};
  @observable listLoading = false;
  @observable listFormConf: IListFormConf = {
    pageTitle: '',
    fields: []
  };
  @observable listTable: IListTable = {
    columns: []
  };

  //computed
  @computed get currentFormConf() {
    return this[`${this.name}FormConf`];
  }

  @computed get currentForm() {
    return this[`${this.name}Form`] || {};
  }

  //以下皆为扩展方法
  isObject = (data: any) => {
    return Object.prototype.toString.call(data) === '[object Object]';
  };
  isArray = (data: any) => {
    return Object.prototype.toString.call(data) === '[object Array]';
  };
  isNull = (data: any, emptyString: boolean = false) => emptyString ? [null, undefined, ''].includes(data) : [null, undefined].includes(data);
  getForm = (empty?: boolean) => {
    //empty 导出是否空的方法
    // use 字段主要用于某些需要检验的场景，或者需要展示的场景，而后端字段并不需要的字段
    const conf = this.currentFormConf;
    let form = {};
    const data = empty ? this.currentForm : {};
    const forEachFields = (fields: Array<any>) => {
      fields.forEach((item: any) => {
        const show = item.hasOwnProperty('show') ? (typeof item.show === 'function' ? item.show() : item.show) : true;
        const use = item.hasOwnProperty('use') ? (typeof item.use === 'function' ? item.use() : item.use) : true;//如果使用了use字段
        if (use && show) {
          (form[item.field] = data ? data[item.field] : '');
        }
      })
    };
    if (conf.blocks) {
      conf.blocks.forEach((item: any) => {
        if (item.fields) forEachFields(item.fields);
      });
    } else if (conf.fields) {
      forEachFields(conf.fields);
    }
    return cloneDeep(form);
  };
  changeForm = (valObj: any, resetType: number = 0) => {
    //resetType===0保留原有form，且不触发校验
    //resetType===1不保留原有form，触发校验
    //resetType===2保留原有form，触发校验
    const {name} = this
    if (+resetType === 0) return this[`${this.name}Form`] = {...this.currentForm, ...valObj};
    if (+resetType === 1) {this[`${this.name}Form`] = {}; this['setForm']({name, valObj});}
    if (+resetType === 2) {this['setForm']({name, valObj: {...this.currentForm, ...valObj}})}
  };
  autoOptimisedMethod = (conf: any) => {
    let blocks: any = [];
    const forEachFields = (fields: Array<any>) => Array.isArray(fields) ? fields.filter((item: any) => this.isObject(item)) : [];
    if (conf.blocks) {
      conf.blocks.forEach((item: any) => {
        this.isObject(item) && blocks.push({...item, fields: forEachFields(item.fields)})
      });
      conf.blocks = blocks;
      return conf;
    } else if (conf.fields) {
      conf.fields = forEachFields(conf.fields);
      return conf;
    }
    return conf;
  };
  //私有构造方法
  private __initMap = ['__addInitData', '__editInitData', '__detailInitData', '__listInitData'];
  @observable protected name = '';
  private __init = () => {
    const {__initMap} = this;
    return new Proxy(this, {
      get(target, p:any) {
        if (typeof p === 'string' && __initMap.includes(`__${p}`)) {
          const key = `__${p}`;
          target[key]();
        }
        return target[p];
      }
    })
  };
  /**ADD相关开始**/
  private __addInitData = (args?: any) => { //原有Store的数据，按照私有变量的方式书写，不会覆盖原来的数据，同时也可以自动执行 eg: [`__${key}`]
    this.name = 'add';
    this['addStatus'] = {submit: false, loading: false};
  };
  /**ADD相关结束**/

  /**EDIT相关开始**/
  private __editInitData = (args?: any) => { //原有Store的数据，按照私有变量的方式书写，不会覆盖原来的数据，同时也可以自动执行 eg: [`__${key}`]
    this.name = 'edit';
    this['editStatus'] = {submit: false, loading: false};
  };
  /**EDIT相关结束**/

  /**DETAIL相关开始**/
  private __detailInitData = (args?: any) => { //原有Store的数据，按照私有变量的方式书写，不会覆盖原来的数据，同时也可以自动执行 eg: [`__${key}`]
    this.name = 'detail';
  };
  /**DETAIL相关结束**/

  /**LIST相关开始**/
  private __listInitData = (args?: any) => { //原有Store的数据，按照私有变量的方式书写，不会覆盖原来的数据，同时也可以自动执行 eg: [`__${key}`]
    this.name = 'list';
  };
  /**LIST相关结束**/
}
