import request from './request'

export const documentApi = {
    // 获取API文档
    getDocumentation() {
        return request.get('/rest/document')
    }
}