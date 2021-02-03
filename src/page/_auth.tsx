import React, { Component } from 'react'
import { Route, Switch, withRouter, RouteComponentProps } from 'react-router-dom'
import { inject, observer } from 'mobx-react'
import { Spin } from 'antd'
import { SetSite } from '@heytea/heyyo'
import Login from '../page/login'
import Reset from '../page/reset'
import PasswordInit from '../page/passwordInit'
import routes from '../route/_index'
import UI, { IUI } from '../store/ui'
import Auth, { IAuth } from '../store/auth'

@inject('UI') @observer
class AuthPage extends Component<{ UI?: IUI } & RouteComponentProps> {

  UNSAFE_componentWillReceiveProps(nextProps: { UI?: IUI } & RouteComponentProps) {
    const newUrl = nextProps.location.pathname + nextProps.location.search
    const oldUrl = this.props.location.pathname + this.props.location.search
    if (newUrl !== oldUrl) {
      UI.setPageTitle('')
    }
  }

  render() {
    const { UI: { pageTitle, site } = UI } = this.props
    return (
      <div id="page">
        <Switch>
          <Route path="/login" component={Login}/>
          <Route path="/reset" component={Reset}/>
          <Route path="/passwordInit" component={PasswordInit}/>
          <Route path="/" component={IndexPage}/>
        </Switch>
        <SetSite pageTitle={pageTitle} site={site}/>
      </div>
    )
  }
}

interface IProps {
  UI?: IUI,
  Auth?: IAuth
}

@inject('UI', 'Auth') @observer
class IndexPage extends Component<IProps & RouteComponentProps> {
  constructor(props: IProps & RouteComponentProps) {
    super(props)
    this.checkAuth()
  }

  // handleUIInit(data: IResult) {
  //   if (data.code === codeUnauthorized) {
  //     const { Auth: { setReferrer } = Auth, location, history } = this.props
  //     const { pathname, search } = location
  //     setReferrer(pathname + search)
  //     history.replace('/login')
  //   }
  // }

  async checkAuth() {
    const { UI: { initData } = UI } = this.props
    await initData()
  }

  // UNSAFE_componentWillReceiveProps(props: RouteComponentProps) {
  //   const { location: { pathname, search } } = props
  //   const { pathname: oldPathname, search: oldSearch } = this.props.location
  //   pathname !== oldPathname && UI.setPageTitle('')
  //   ;(pathname + search !== oldPathname + oldSearch) && this.checkAuth()
  // }

  render() {
    const { Auth: { infoLoading } = Auth} = this.props
    if (infoLoading) {
      return (<div id="p-auth"><Spin tip="Loading..."/></div>)
    }
    return (
      <Switch>
        {routes.map(route => (
          <Route key={route.path} {...route}/>
        ))}
      </Switch>
    )
  }
}

export default withRouter(AuthPage)

