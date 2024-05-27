export class Usuario {
  id?:                    number;
  name?:                  string;
  lastName?:              string;
  email?:                 string;
  phoneNumber?:           string;
  address?:               string;
  password?:              string;
  enabled?:               boolean;
  accountNoExpired?:      boolean;
  accountNoLocked?:       boolean;
  credentialNoExpired?:   boolean;
  creationDate?:          Date;
  roles?:                 Role[];
  username?:              string;
  authorities?:           Authority[];
  dni?:                   string;
  accountNonExpired?:     boolean;
  accountNonLocked?:      boolean;
  credentialsNonExpired?: boolean;
}

export class Authority {
  authority?: string;
}

export class Role {
  id?:             number;
  name?:           string;
  permissionList?: PermissionList[];
}

export class PermissionList {
  id?:   number;
  name?: string;
}

export class LoginDto {
  username?: string;
  password?: string;
}
