import React, {ComponentType} from 'react'
import {Loading} from '@heytea/heyyo'
import Loadable from 'react-loadable'
import IndexPage from '../page/index'
import P404 from '../page/p404'

const loading = () => <Loading isCenter={true}/>
type UIProps = ComponentType<any>;
const router: Array<{ exact?: boolean | undefined, path: string, component: UIProps }> = [
  {exact: true, path: '/', component: IndexPage},
  {path: '/house', component: Loadable({loader: () => import('./house'), loading})},
  {path: '*', component: P404}
]
export default router
