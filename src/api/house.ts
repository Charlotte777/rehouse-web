import request from './request';

export async function list(params: any) {
    return await request({url: `/roomInfo/listPage`, params, method: 'get'}, {format: false, showErrs: {success: false, fail: true} });
}

export async function del(params: any) {
    return await request({url: `/roomInfo/del`, params, method: 'get'}, {format: false, showErrs: {success: false, fail: true} });
}

export async function add(data: any) {
    data.matchingTag = data.matchingTag.split('/').join(',')
    return await request({url: `/roomInfo/save`, data, method: 'post'}, {format: false, showErrs: {success: false, fail: true} });
}

export async function editDetail(params: any) {
    return await request({url: `/roomInfo/getInfo`, params, method: 'get'}, {format: false, showErrs: {success: false, fail: true} });
}

export async function edit(data: any) {
    data.matchingTag = data.matchingTag.join(',');
    return await request({url: `/roomInfo/update`, data, method: 'post'}, {format: false, showErrs: {success: false, fail: true} });
}