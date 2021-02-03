import request from './request';

export async function getImages() {
    return await request({url: `/images/room/getImages`, method: 'get'}, {format: false, showErrs: {success: false, fail: true} });
}

export async function add(data:any) {
    return await request({url: `/images/room/updateImages`, data, method: 'post'}, {format: false, showErrs: {success: false, fail: true} });
}

