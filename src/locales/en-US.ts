// src/locales/lang/en-US.ts
export default {
    common: {
        cancel: 'Cancel',
        confirm: 'Confirm',
        save: 'Save',
        description: 'Description',
        pleaseEnter: 'Please enter',
        operationSuccess: 'Operation successful',
        operationFailed: 'Operation failed',
        action: 'Action',
        edit: 'Edit',
        delete: 'Delete',
        refresh: 'Refresh'
    },
    login: {
        title: 'ConAPI CMS',
        login: 'Login',
        logout: 'Logout',
        username: 'Username',
        password: 'Password',
        rememberMe: 'Remember me',
        forgotPassword: 'Forgot password?',
        subtitle: 'Content Management System',
        or: 'Or',
        noTenant: 'No tenant yet?',
        registerNow: 'Register now',
        registerTenant: 'Register New Tenant',
        usernameRequired: 'Please enter username',
        passwordRequired: 'Please enter password',
        invalidEmail: 'Please enter a valid email address',
        passwordMinLength: 'Password cannot be less than 6 characters',
        loginFailed: 'Login failed',
        logoutSuccess: 'Logged out successfully'
    },
    menu: {
        dashboard: 'Dashboard',
        media: 'Media Library',
        schema: 'Content Management',
        users: 'User Management'
    },
    dashboard: {
        title: 'Dashboard'
    },
    content: {
        title: 'Content Management',
        collections: 'Content Types',
        list: 'Entry List',
        create: 'Create Entry',
        edit: 'Edit Entry'
    },
    media: {
        title: 'Media Library',
        upload: 'Upload File',
        searchPlaceholder: 'Search by filename',
        noAssets: 'No media assets available',
        fetchFailed: 'Failed to fetch assets',
        deleteConfirm: 'Are you sure you want to delete this asset?',
        deleteConfirmMulti: 'Are you sure you want to delete these {count} assets?',
        deleteSuccess: 'Asset deleted successfully',
        deleteFailed: 'Failed to delete asset',
        uploadSuccess: 'File uploaded successfully',
        uploadFailed: 'File upload failed',
        noFilesSelected: 'No files selected',
        dropUpload: 'Drop file here',
        clickUpload: 'or click to upload',
        deleteSelected: 'Delete Selected',
        clearSelection: 'Clear Selection',
        assetDetail: 'Asset Details',
        preview: 'Preview',
        filename: 'Filename',
        fileSize: 'File Size',
        dimensions: 'Dimensions',
        mimeType: 'MIME Type',
        uploadTime: 'Upload Time',
        altText: 'Alternative Text',
        caption: 'Caption',
        altTextPlaceholder: 'Text description of the image for visually impaired users',
        captionPlaceholder: 'Descriptive text displayed below the image',
        searchFailed: 'Failed to search assets',
        updateSuccess: 'Asset updated successfully',
        updateFailed: 'Failed to update asset'
    },
    user: {
        title: 'User Management',
        createUser: 'Create User',
        editUser: 'Edit User',
        userList: 'User List',
        searchPlaceholder: 'Search username or email',
        userName: 'User Name',
        userEmail: 'Email',
        userRole: 'Role',
        userStatus: 'Status',
        profile: 'Profile',
        changePassword: 'Change Password',
        userPassword: 'Password',
        active: 'Active',
        inactive: 'Inactive',
        roles: {
            super_admin: 'Super Admin',
            admin: 'Admin',
            developer: 'Developer',
            editor: 'Editor',
            user: 'User'
        },
        oldPassword: 'Old Password',
        newPassword: 'New Password',
        confirmPassword: 'Confirm Password',
        usernameRequired: 'Please enter username',
        emailRequired: 'Please enter email',
        emailInvalid: 'Invalid email format',
        passwordRequired: 'Please enter password',
        passwordMinLength: 'Password must be at least 6 characters',
        roleRequired: 'Please select a role',
        passwordsDoNotMatch: 'Passwords do not match',
        passwordChangeSuccess: 'Password changed successfully',
        passwordChangeFailed: 'Failed to change password',
        createSuccess: 'User created successfully',
        updateSuccess: 'User updated successfully',
        deleteSuccess: 'User deleted successfully',
        deleteFailed: 'Failed to delete user',
        updateFailed: 'Failed to update user',
        fetchFailed: 'Failed to fetch user list',
        deleteConfirmMsg: 'Are you sure you want to delete user {username}?',
        resetPassword: 'Reset Password',
        resetPasswordSuccess: 'Password reset successfully',
        resetPasswordFailed: 'Failed to reset password',
        enterNewPassword: 'Please enter new password'
    },
    settings: {
        title: 'System Settings',
        save: 'Save',
        general: 'General',
        securityMenu: 'Security',
        appearance: 'Appearance',
        basic: {
            systemName: 'System Name',
            language: 'Language',
            languageOptions: {
                zhCN: 'Chinese',
                enUS: 'English'
            },
            timezone: 'Timezone',
            timezoneOptions: {
                shanghai: 'Shanghai',
                tokyo: 'Tokyo',
                newYork: 'New York'
            },
            dataRetention: 'Data Retention'
        },
        security: {
            minPasswordLength: 'Minimum Password Length',
            passwordComplexity: 'Password Complexity Requirements',
            complexityOptions: {
                number: 'Number',
                lowercase: 'Lowercase Letter',
                uppercase: 'Uppercase Letter',
                special: 'Special Character'
            },
            maxLoginAttempts: 'Max Login Attempts',
            sessionTimeout: 'Session Timeout (minutes)',
            enable2FA: 'Enable Two-Factor Authentication'
        },
        notification: {
            title: 'Notification Settings',
            emailEnabled: 'Enable Email Notification',
            smtpServer: 'SMTP Server',
            smtpPort: 'SMTP Port',
            senderEmail: 'Sender Email',
            smsEnabled: 'Enable SMS Notification',
            inAppNotification: 'Enable In-App Notification',
            importantActionAlert: 'Important Action Alert'
        },
        appearanceDetail: {
            pageAnimation: 'Page Animation',
            expandMenu: 'Expand Menu',
            showBreadcrumb: 'Show Breadcrumb Navigation'
        },
        saved: 'Settings saved'
    }
}