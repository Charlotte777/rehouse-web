import request from './request';

export async function list(params: any) {
    return await request({url: `/userInfo/get`, params, method: 'get'}, {format: false, showErrs: {success: false, fail: true} });
}
