import React, {Component} from 'react'
import {LeftSider, JumpToOne, RenderRoute} from '@heytea/heyyo'
import P404 from '../page/p404'
import HouseList from '../store/house/list';
import AdUpload from '../store/house/adUpload';
import User from '../store/house/user';

const routerConf = {
  rootPath: '/house',
  'p404': P404,
  routers: [
    { path: '', exact: true, component: JumpToOne },
    { path: 'operations', store: HouseList, pages: { list: {}, add: {}, edit: {}} },
    { path: 'adUpload', store: AdUpload, pages: {add: {}} },
    { path: 'user', store: User, pages: {list: {}} },
  ]
}

export default class Boss extends Component {
  render() {
    return <LeftSider><RenderRoute {...routerConf}/></LeftSider>
  }
}

