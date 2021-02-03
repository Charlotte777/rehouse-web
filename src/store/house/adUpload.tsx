import React from 'react';
import {Curd, Form} from '@heytea/heyyo/dist';
import {getImages, add} from '../../api/upload'; 
import { observer } from 'mobx-react'
import BaseStore from '../BaseStore';
import { observable, computed } from 'mobx';
import { Button, Icon, Upload, message} from 'antd'
import Store from 'store'

@Curd @Form
export default class extends BaseStore {
    dataFn = {
        getImages, add
    }
    @observable dict: any = {
        addInitData: {}
    }

    addInitData = () => {
        this.getCurrenImg()
    };
   
    dfAddForm = { 
        bgImages: '',
        wheelImages: ''
    }
   
    dfAddErrs = {
    }

    @observable addForm:any = { ...this.dfAddForm }

    @observable addErrs = { ...this.dfAddErrs }

    @observable addStatus = {
        submit: false,
        loading: false
    }

    @observable addData = { code: '', msg: '', data: {} }


    @observable fileList:Array<any>= []
    @observable adFileList:Array<any>= []

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
                    this.dict.addInitData.bgImages = file.response.data;
                    this.changeForm({bgImages: file.response.data} ,2)
                }else{
                    message.error('error: 上传失败！')
                  }
                  break
              }
            },
        }
        const adImgprops = {
            action: 'https://www.mandaotec.cn/api/upload',
            accept: 'image/jpg,image/png',
            headers:  {token: `${Store.get('token')}` },
            name: 'file',
            showUploadList: false,
            fileList: this.adFileList,
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
                  this.adFileList.push(file);
                  break
                case 'error':
                  message.error('error: 上传失败！')
                  break
                case 'done':
                  if (file.response.code === 0) {
                    this.adFileList.push(file);
                    this.dict.addInitData.wheelImages.push(file.response.data)
                    this.changeForm({wheelImages: {...this.dict.addInitData.wheelImages}} ,2)
                  }else{
                    message.error('error: 上传失败！')
                  }
                  break
              }
            },
        }
        const {bgImages, wheelImages} = this.dict.addInitData;
        const conf: any = {
            pageTitle: '房源广告管理',
            fields: [
                { title: '房源背景图', field: 'bgImages', type: 'upload', span: 24, 
                render: observer(() => {
                  //@ts-ignore
                  return <> 
                    <Upload {...imgprops}>
                      <Button><Icon type="upload"/> 上传 </Button>
                    </Upload>
                    <div><img alt='' style={{width: '100px'}} src={bgImages} /></div>
                  </>
                })
                },
                { title: '房源轮播广告', field: 'wheelImages', type: 'upload', span: 24, 
                render: observer(() => {
                  //@ts-ignore
                  return <> 
                    <Upload {...adImgprops}>
                      <Button><Icon type="upload"/> 上传 </Button>
                    </Upload>
                    <div style={{display: 'flex'}}>
                        {(wheelImages || []).map((item: any, index:number) => 
                        <div style={{position: 'relative', marginRight: '10px', flex: 1}}>
                            <img alt='' style={{width: '120px'}} src={item} />
                            <Icon type="close" onClick={() => this.removeAd(index)}
                    style={{position: 'absolute', top: 0, right: 0, cursor: 'pointer', background: '#545454', color: '#fff'}}/>
                        </div>
                        )}
                    </div>
                  </>
                })
                },
            ]
        }
        return conf
    }

    removeAd = (index:number) => {
        this.dict.addInitData.wheelImages.splice(index, 1);
        this.adFileList.splice(index, 1);
    }

    getCurrenImg = async() => {
        const result:any = await this.dataFn.getImages()
        if(result.code === 0){
            const {data} = result
            this.fileList.push({url: data.bgImages, uid: 1});
            (data.wheelImages || []).forEach((item:any, index:number) => {
                this.adFileList.push({uid: index, url: item});
            })
            this.dict.addInitData = data
        }

    }

    addRequestBeforeFn = (form: any) => {
        const {bgImages, wheelImages} = this.dict.addInitData;
        form.bgImages = bgImages;
        form.wheelImages = wheelImages;
        return {
            bgImages,
            wheelImages,
            id: 1
        }
    };

    addAfterFn = ({ addData, history }: any) => {
        history.replace(`/house/operations/list`);
    }
    
}