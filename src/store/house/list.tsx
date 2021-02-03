import React from 'react';
import { observer } from 'mobx-react'
import BaseStore from '../BaseStore';
import { observable, computed } from 'mobx';
import Store from 'store'
import {Curd, Form} from '@heytea/heyyo/dist';
import {list, del, editDetail, add, edit} from '../../api/house';    
import { Button, Modal, Icon, Select, Upload, message, Input} from 'antd'
import { Link } from '@heytea/heyyo';


@Curd @Form
export default class extends BaseStore {
  dataFn = {list, del, editDetail, add, edit}
  @observable dict: any = {
    districtsData: [
      { id: 'all', name: '全部地区' },
      { id: '流沙西街道', name: '流沙西街道' },
      { id: '流沙南街道', name: '流沙南街道' },
      { id: '流沙北街道', name: '流沙北街道' },
      { id: '流沙东街道', name: '流沙东街道' },
    ],
    matchingTagOption: [
      { label: '冰箱', value: '冰箱' },
      { label: '洗衣机', value: '洗衣机' },
      { label: '独立淋浴间', value: '独立淋浴间' },
      { label: '榻榻米', value: '榻榻米' },
      { label: '沙发', value: '沙发' },
      { label: '台灯', value: '台灯' },
      { label: '全身镜', value: '全身镜' },
      { label: '衣柜', value: '衣柜' },
      { label: '茶几', value: '茶几' },
      { label: '多功能柜', value: '多功能柜' },
      { label: '音响', value: '音响' },
      { label: '自助快递柜', value: '自助快递柜' },
      { label: '公共办公空间', value: '公共办公空间' },
      { label: '投影', value: '投影' },
      { label: '空调', value: '空调' },
      { label: '橱柜', value: '橱柜' },
      { label: 'wifi', value: 'wifi' },
      { label: '电子锁', value: '电子锁' }
    ]
  }
  dfListForm = {
    page: 1,
    size: 10,
    districts: 'all',
    type: 1,
  }
  @observable listForm = { ...this.dfListForm }
  @observable listData: any = { code: '', msg: '', data: { records: [] } }

  @computed get listAddConf() {
    return [
      {
        name: '创建房源',
        url: '/house/operations/add'
      }
    ]
  }

  listRequestBeforeFn = (form: any) => {
    const { size, ...restForm } = form
    restForm.per_page = size;
    return restForm
  } 
  
  @computed get listFormConf () {
    return this.autoOptimisedMethod({
        pageTitle: '房源列表',
        fields: [
          {title: '地区选择', field: 'districts', data: 'districtsData', type: 'select', span: 8 },
        ]
    })
}
  @computed get listTable(): any {
    const conf = {
    dataKey: 'records',
    rowKey: 'id',
    scroll: { x: 'max-content' },
    columns: [
        { title: '房源id', dataIndex: 'id'},
        { title: '房源名称', dataIndex: 'name'},
        { title: '房源地址', dataIndex: 'address'},
        { title: '操作', dataIndex: 'handel', render: (text: any, record: any) => 
              <div>
                <Link href={`/house/operations/edit?id=${record.id}`}><Button style={{ marginRight: 8 }} size="small" type="primary">编辑</Button></Link>
                <Button type="danger" size="small" style={{ marginLeft: 8 }} onClick={() => {this.onDel( record)}}>删除</Button>
              </div>
        }
      ]
      }
      return conf
    }
   
    onDel = async(data: any) => {
      Modal.confirm({
        title: `你确定要删除房源: ${data.name}吗 ?`,
        onOk: () => new Promise(async (resolve, reject) => {
          const delData = await this.dataFn.del({id: data.id})
          if (delData === 0) {
            reject()
          } else {
            resolve()
          }
          this.getList()
        })
      })
    }

  //add
  dfAddForm = {
    address: '',
    contactPhone: '',
    contactWechat: '',
    districts: '',
    farAway: '',
    latitude: '',
    longitude: '',
    matchingTag: '',
    name: '',
    nearby: '',
    price: '',
    roomImages: [],
    roomTag: '',
  }

  dfAddErrs = {
  }

  @observable addForm = { ...this.dfAddForm }

  @observable addErrs = { ...this.dfAddErrs }

  @observable addStatus = {
    submit: false,
    loading: false
  }

  @observable addData = { code: '', msg: '', data: {} }

  @computed get addFormConf() {
    const imgprops = {
      action: 'https://www.mandaotec.cn/api/upload',
      accept: 'image/jpg,image/png',
      headers:  {token: `${Store.get('token')}` },
      name: 'file',
      showUploadList: false,
      fileList: this.fileList,
        beforeUpload: (file: any) => {
          const { type } = file;
          if (!['image/jpeg', 'image/png'].includes(type)) {
            message.error('图片格式不正确');
            return false;
          }
          const size: any = (file.size / 1024).toFixed(0);
          if (size > 2000) {
            message.error(`只能上传小于等于2m的图片，当前大小: ${size}k`);
            return false;
          }
          return true;
        },
        onChange: ({ file, fileList }: any) => {
          switch (file.status) {
            case 'uploading': 
              this.fileList.push(file);
              break
            case 'error':
              message.error('error: 上传失败！')
              break
            case 'done':
              if (file.response.code === 0) { 
                this.fileList.push(file);
                const addFormRoomImages:Array<any> = this.addForm.roomImages;
                addFormRoomImages.push(file.response.data)
                this.changeForm({roomImages: addFormRoomImages} ,2)
              }
              break
          }
        },
      };
      const conf: any = {
        pageTitle: '房源操作',
        fields: [
          { title: '房源名称', field: 'name', type: 'input', span: 24, rules: 'required' },
          { title: '房源价格', field: 'price', type: 'input', span: 24, rules: 'required', props: { suffix: "元" } },
          { title: '房源图片', field: 'roomImages', type: 'upload', span: 24, rules: 'required', 
          render: observer(() => {
            //@ts-ignore
            return <> 
              <Upload {...imgprops}>
                <Button><Icon type="upload"/> 上传 </Button>
              </Upload>
              <div style={{display: 'flex'}}>
                {this.addForm.roomImages.map((item: any,index: number) => 
                 <div style={{position: 'relative', marginRight: '10px', flex: 1}}>
                    <img alt='' style={{width: '200px'}} src={item} />
                    <Icon type="close" onClick={() => this.removeImg(index, 'add')}
                    style={{position: 'absolute', top: 0, right: 0, cursor: 'pointer', background: '#545454', color: '#fff'}}/>
                 </div>
               )}
              </div>
            </>
          })
          },
          { title: '配套设施', field: 'matchingTag', type: 'checkbox', data: 'matchingTagOption', span: 12, rules: 'required' },
          { title: '附近信息', field: 'nearby', type: 'input', span: 24},
          { title: '房源特点', field: 'roomTag', type: 'input', span: 24},
          { title: '房源地址', field: 'districts',  type: 'select', data: 'districtsData', span: 24},
          { title: '房源详情地址', field: 'address', type: 'input', span: 24, render: () => 
            <div>
              <span>广东省揭阳市普宁市</span>
              <Input style={{width: '300px', marginLeft: '10px'}} value={this.addForm.address} onChange={this.onChangeAddress} />
            </div>
          },
          { title: '管理人电话', field: 'contactPhone', type: 'input', span: 24, rules: 'required' },
          { title: '管理人微信', field: 'contactWechat', type: 'input', span: 24},
        ]
      }
      return conf
  }

  removeImg = (index:number, name:string) => {
    this[`${name}Form`].roomImages.splice(index, 1);
  }

  onDistrictsChange = (districts: any) => {
    this.changeForm({districts}, 0)
  }

  onChangeAddress = (e: any) => {
    this.changeForm({address: e.target.value}, 0)
  }

  addAfterFn = ({ addData, history }: any) => {
    if (addData.code === 0) {
      history.goBack()
    }
  }

  addRequestBeforeFn = (form: any) => {
    const {address, roomImages, ...restform} = form;
    restform.address = `广东省揭阳市普宁市${address}`;
    restform.roomImages = roomImages.join(',')
    return restform
  }

  //upload
  handleChange = () => {}

  @observable fileList:Array<any>= []

  //edit
  @observable editForm = { ...this.dfAddForm }
  @observable editErrs = { ...this.dfAddErrs }

  @observable editDetailForm = { id: '' }
  @observable editStatus = {
    submit: false,
    loading: false
  }
  @observable editDetailLoading: boolean = false
  @observable editDetailData = { code: '', msg: '', data: {} }
  @observable editData = { code: 0, msg: '', data: {} }

  // editSetFormBeforeFn = ({ data }: { data: any }) => {
  //   data.data.roomImages = data.data.roomImages[0];
  //   return {data}
  // }

  @observable detailData: any = { code: '', data: {}, msg: '' };
  @observable detailLoading = false;
  @computed get editFormConf() {
    const imgprops = {
        action: 'https://www.mandaotec.cn/api/upload',
        accept: 'image/jpg,image/png',
        headers: { token: `${Store.get('token')}` },
        name: 'file',
        showUploadList: false,
        fileList: this.fileList,
        beforeUpload: (file: any) => {
          const { type } = file;
          if (!['image/jpeg', 'image/png'].includes(type)) {
            message.error('图片格式不正确');
            return false;
          }
          const size: any = (file.size / 1024).toFixed(0);
          if (size > 2000) {
            message.error(`只能上传小于等于2000k的图片，当前大小: ${size}k`);
            return false;
          }
          return true;
        },
        onChange: ({ file, fileList }: any) => {
          switch (file.status) {
            case 'uploading': 
              this.fileList.push(file);
              break
            case 'error':
              message.error('error: 上传失败！')
              break
            case 'done':
              if (file.response.code === 0) { 
                this.fileList.push(file);
                const addFormRoomImages:Array<any> = this.editForm.roomImages;
                addFormRoomImages.push(file.response.data)
                this.changeForm({roomImages: addFormRoomImages} ,2)
              }
              break
          }
        },
      };
      const conf: any = {
        pageTitle: '房源操作',
        fields: [
          { title: '房源名称', field: 'name', type: 'input', span: 24, rules: 'required' },
          { title: '房源价格', field: 'price', type: 'input', span: 24, rules: 'required', props: { suffix: "元" } },
          { title: '房源图片', field: 'roomImages', type: 'upload', span: 24, rules: 'required', 
          render: observer(() => {
            //@ts-ignore
            return <> 
              <Upload {...imgprops}>
                <Button><Icon type="upload"/> 上传 </Button>
              </Upload>
              <div style={{display: 'flex'}}>
                {this.editForm.roomImages.map((item: any,index: number) => 
                 <div style={{position: 'relative', marginRight: '10px', flex: 1}}>
                    <img alt='' style={{width: '200px'}} src={item} />
                    <Icon type="close" onClick={() => this.removeImg(index, 'edit')}
                    style={{position: 'absolute', top: 0, right: 0, cursor: 'pointer', background: '#545454', color: '#fff'}}/>
                 </div>
               )}
              </div>
            </>
          })
          },
          { title: '配套设施', field: 'matchingTag', type: 'checkbox', data: 'matchingTagOption', span: 20, rules: 'required' },
          { title: '附近信息', field: 'nearby', type: 'input', span: 24},
          { title: '房源特点', field: 'roomTag', type: 'input', span: 24},
          { title: '房源地址', field: 'districts',  type: 'select', data: 'districtsData', span: 24},
          { title: '房源详情地址', field: 'address', type: 'input', span: 24, props: {style: {width: '400px'}}},
          { title: '管理人电话', field: 'contactPhone', type: 'input', span: 24, rules: 'required' },
          { title: '管理人微信', field: 'contactWechat', type: 'input', span: 24},
        ]
      }
      return conf
  }

  editRequestBeforeFn = (form: any) => {
    const { roomImages, ...restform} = form;
    restform.roomImages = roomImages.join(',')
    return restform
  }

  editAfterFn = ({ editData, history }: any) => {
    if (editData.code === 0) {
      history.goBack()
    }
  }
}
