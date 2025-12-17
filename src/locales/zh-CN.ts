// src/locales/lang/zh-CN.ts
export default {
    common: {
        cancel: '取消',
        confirm: '确认',
        save: '保存',
        description: '描述',
        pleaseEnter: '请输入',
        operationSuccess: '操作成功',
        operationFailed: '操作失败',
        action: '操作',
        edit: '编辑',
        delete: '删除',
        refresh: '刷新'
    },
    login: {
        title: 'ConAPI CMS',
        login: '登录',
        logout: '退出登录',
        username: '用户名',
        password: '密码',
        rememberMe: '记住我',
        forgotPassword: '忘记密码？',
        subtitle: '内容管理系统',
        or: '或者',
        noTenant: '还没有租户？',
        registerNow: '立即注册',
        registerTenant: '注册新租户',
        usernameRequired: '请输入用户名',
        passwordRequired: '请输入密码',
        invalidEmail: '请输入正确的邮箱地址',
        passwordMinLength: '密码长度不能少于6位',
        loginFailed: '登录失败',
        logoutSuccess: '已退出登录'
    },
    menu: {
        dashboard: '仪表板',
        media: '媒体库',
        schema: '内容管理',
        users: '用户管理'
    },
    dashboard: {
        title: '仪表板'
    },
    content: {
        title: '内容管理',
        collections: '内容类型',
        list: '内容列表',
        create: '创建内容',
        edit: '编辑内容'
    },
    media: {
        title: '媒体库',
        upload: '上传文件',
        searchPlaceholder: '搜索文件名',
        noAssets: '暂无媒体资源',
        fetchFailed: '获取资源列表失败',
        deleteConfirm: '确定要删除该资源吗？',
        deleteConfirmMulti: '确定要删除这 {count} 个资源吗？',
        deleteSuccess: '删除成功',
        deleteFailed: '删除失败',
        uploadSuccess: '上传成功',
        uploadFailed: '上传失败',
        noFilesSelected: '未选择任何文件',
        dropUpload: '将文件拖到此处',
        clickUpload: '点击上传',
        deleteSelected: '删除选中',
        clearSelection: '清空选择',
        assetDetail: '资源详情',
        preview: '预览',
        filename: '文件名',
        fileSize: '文件大小',
        dimensions: '尺寸',
        mimeType: 'MIME类型',
        uploadTime: '上传时间',
        altText: '替代文本',
        caption: '说明文字',
        altTextPlaceholder: '为视障用户提供图片内容的文字描述',
        captionPlaceholder: '用于显示在图片下方的描述性文字',
        searchFailed: '搜索资源失败',
        updateSuccess: '更新成功',
        updateFailed: '更新失败'
    },
    user: {
        title: '用户管理',
        createUser: '创建用户',
        editUser: '编辑用户',
        userList: '用户列表',
        searchPlaceholder: '搜索用户名或邮箱',
        userName: '姓名',
        userEmail: '邮箱',
        userRole: '角色',
        profile: '个人资料',
        changePassword: '修改密码',
        userPassword: '密码',
        roles: {
            super_admin: '超级管理员',
            admin: '管理员',
            developer: '开发者',
            editor: '编辑者',
            user: '普通用户'
        },
        oldPassword: '旧密码',
        newPassword: '新密码',
        confirmPassword: '确认密码',
        usernameRequired: '请输入用户名',
        emailRequired: '请输入邮箱',
        emailInvalid: '邮箱格式不正确',
        passwordRequired: '请输入密码',
        passwordMinLength: '密码长度至少6位',
        roleRequired: '请选择角色',
        passwordsDoNotMatch: '两次输入的密码不一致',
        passwordChangeSuccess: '密码修改成功',
        passwordChangeFailed: '密码修改失败',
        createSuccess: '用户创建成功',
        updateSuccess: '用户更新成功',
        deleteSuccess: '用户删除成功',
        deleteFailed: '用户删除失败',
        updateFailed: '用户更新失败',
        fetchFailed: '获取用户列表失败',
        deleteConfirmMsg: '确定要删除用户 {username} 吗？',
        resetPassword: '重置密码',
        resetPasswordSuccess: '密码重置成功',
        resetPasswordFailed: '密码重置失败',
        enterNewPassword: '请输入新密码',
        lastLoginAt: '最后登录时间',
        loginCount: '登录次数'
    },
    settings: {
        title: '系统设置',
        save: '保存',
        general: '基础设置',
        securityMenu: '安全设置',
        appearance: '外观设置',
        basic: {
            systemName: '系统名称',
            language: '语言',
            languageOptions: {
                zhCN: '简体中文',
                enUS: '英语'
            },
            timezone: '时区',
            timezoneOptions: {
                shanghai: '上海',
                tokyo: '东京',
                newYork: '纽约'
            },
            dataRetention: '数据保留时间'
        },
        security: {
            minPasswordLength: '最小密码长度',
            passwordComplexity: '密码复杂度要求',
            complexityOptions: {
                number: '数字',
                lowercase: '小写字母',
                uppercase: '大写字母',
                special: '特殊字符'
            },
            maxLoginAttempts: '最大登录尝试次数',
            sessionTimeout: '会话超时时间(分钟)',
            enable2FA: '启用双重认证'
        },
        notification: {
            title: '通知设置',
            emailEnabled: '启用邮件通知',
            smtpServer: 'SMTP服务器',
            smtpPort: 'SMTP端口',
            senderEmail: '发件人邮箱',
            smsEnabled: '启用短信通知',
            inAppNotification: '启用应用内通知',
            importantActionAlert: '重要操作提醒'
        },
        appearanceDetail: {
            pageAnimation: '页面动画',
            expandMenu: '展开菜单',
            showBreadcrumb: '显示面包屑导航'
        },
        saved: '设置已保存'
    }
}