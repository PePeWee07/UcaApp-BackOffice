export interface Roles {
    id:             number;
    name:           string;
    permissionList?: PermissionList[];
}

export interface PermissionList {
    id:   number;
    name: string;
}
