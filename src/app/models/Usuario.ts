export interface Usuario {
  createdBy?:             null | string;
  createdDate?:           Date | null;
  lastModifiedBy?:        null | string;
  lastModifiedDate?:      Date | null;
  id:                    number;
  name:                  string;
  lastName:              string;
  email:                 string;
  phoneNumber:           string;
  address:               string;
  dni:                   string;
  password?:              string;
  enabled:               boolean;
  accountNonExpired:     boolean;
  accountNonLocked:      boolean;
  credentialsNonExpired: boolean;
  roles:                 Role[];    // Para GET
  rolesIds?:             number[];  // Para POST
  accountExpiryDate:     Date | null;
  authorities:           Authority[];
  username:              string;
}

export interface Authority {
  createdBy?:             null | string;
  createdDate?:           Date | null;
  lastModifiedBy?:        null | string;
  lastModifiedDate?:      Date | null;
  id:   number | null;
  name: string;
}

export interface Role {
  createdBy?:             null | string;
  createdDate?:           Date | null;
  lastModifiedBy?:        null | string;
  lastModifiedDate?:      Date | null;
  id:                    number;
  name:                   string;
  permissionList:         Authority[];  // Para GET
  permissionsIds?:        number[];     // Para POST
}

export class LoginDto {
  username?: string;
  password?: string;
}
