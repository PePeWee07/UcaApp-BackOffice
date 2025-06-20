export interface UserProfile {
    id:                    number;
    name?:                  string;
    lastName?:              string;
    email?:                 string;
    phoneNumber?:           string;
    address?:               string;
    dni?:                   string;
    enabled?:               boolean;
    accountNonExpired?:     boolean;
    accountNonLocked?:      boolean;
    credentialsNonExpired?: boolean;
    roles?:                 Role[];
    accountExpiryDate?:     null;
    authorities?:           Authority[];
    username?:              string;
}

export interface Authority {
    name?: string;
}

export interface Role {
    id?:             number;
    name?:           string;
    permissionList?: PermissionList[];
}

export interface PermissionList {
    id:   number;
    name: string;
}
