import React from 'react';
import BaseStore from '../BaseStore';
import { observable, computed } from 'mobx';
import {Curd, Form} from '@heytea/heyyo/dist';
import {list} from '../../api/user';


@Curd @Form
export default class extends BaseStore {
  dataFn = {list}

  dfListForm = {
    page: 1,
    size: 20
  }
  @observable listForm = { ...this.dfListForm }
  @observable listData: any = { code: '', msg: '', data: { records: [] } }


  listFormConf = {
    pageTitle: '用户信息',
    isSearch: false,
    isReset: false,
    fields: []
  }
  @computed get listTable(): any {
    const conf = {
    dataKey: 'records',
    rowKey: 'id',
    scroll: { x: 'max-content' },
    columns: [
        { title: '用户id', dataIndex: 'id'},
        { title: '房源id', dataIndex: 'roomId'},
        { title: '性别', dataIndex: 'wechatInfo'},
        { title: '手机号', dataIndex: 'mobile'},
        { title: '创建时间', dataIndex: 'createdAt'},
        { title: '更新时间', dataIndex: 'updatedAt'},
      ]
      }
      return conf
    }
}