export interface Accion {
    event_id:          number;
    schema_name:       string;
    table_name:        string;
    relid:             number;
    session_user_name: string;
    action_tstamp_tx:  Date;
    action_tstamp_stm: Date;
    action_tstamp_clk: Date;
    transaction_id:    number;
    application_name:  string;
    client_addr?:       ClientAddr | null;
    client_port?:       number | null;
    client_query?:      string;
    action?:            string;
    row_data?:          RowData;
    changed_fields?:    ChangedFields | null;
    statement_only?:    boolean;
}

export interface ChangedFields {
    key?:  string | Date;
    last_modified_date?:  Date;
    enabled?:             string;
}

export interface ClientAddr {
    type:  string;
    value: string;
    null:  boolean;
}

export interface RowData {
    name?:                    string;
    last_modified_date?:      Date | null;
    id?:                      string;
    created_date?:            Date | null;
    last_modified_by?:        string | null;
    created_by?:              string | null;
    role_id?:                 string;
    permission_id?:           string;
    account_non_locked?:      string;
    address?:                 string;
    last_name?:               string;
    enabled?:                 string;
    account_expiry_date?:     string | null;
    password?:                string;
    account_non_expired?:     string;
    credentials_non_expired?: string;
    phone_number?:            string;
    dni?:                     string;
    email?:                   string;
    user_id?:                 string;
    revoked_at?:              Date;
    token?:                   string;
}
