import React, {Component} from 'react'
import {RouteComponentProps} from 'react-router'
import {observer, inject} from 'mobx-react'
import {Button} from 'antd'
import Auth, {IAuth} from '../store/auth'
import {IUI} from '../store/ui'
import {Full, EditForm, Link} from '@heytea/heyyo'
import './passwordInit.less'

@inject('Auth', 'UI') @observer
class App extends Component<{ Auth: IAuth, UI: IUI } & RouteComponentProps> {
  submit = async () => {
    const {Auth: {passwordInit}, history: {replace}} = this.props
    const logData = await passwordInit()
    if (logData.code === 0) {
      replace('/login')
    }
  }

  componentDidMount() {
    const {UI} = this.props
    UI && UI.setPageTitle('初始化密码')
  }

  render() {
    const {Auth: {passwordInitStatus: {submit, loading}}} = this.props
    return (
      <Full className='l-passwordInit'>
        <div id="p-passwordInit">
          <div className="m-passwordInit-box">
            <h1 className="u-title">初始化密码</h1>
            <EditForm Store={Auth} name='passwordInit' onSubmit={this.submit}>
              <Button htmlType="submit" loading={loading} type="primary" block disabled={!submit}>初始化密码</Button>
              <div className="u-link-box">
                <Link href="/login" className="login">登录</Link>
              </div>
            </EditForm>
          </div>
        </div>
      </Full>
    )
  }
}

export default App
