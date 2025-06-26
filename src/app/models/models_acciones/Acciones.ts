export interface Acciones {
    content:          Content[];
    pageable:         Pageable;
    totalPages:       number;
    totalElements:    number;
    last:             boolean;
    size:             number;
    number:           number;
    sort:             Sort;
    first:            boolean;
    numberOfElements: number;
    empty:            boolean;
}

export interface Content {
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
    client_addr:       null;
    client_port:       null;
    client_query:      string;
    action:            string;
    row_data:          RowData;
    changed_fields:    null;
    statement_only:    boolean;
}

export interface RowData {
    role_id: string;
    user_id: string;
}

export interface Pageable {
    pageNumber: number;
    pageSize:   number;
    sort:       Sort;
    offset:     number;
    paged:      boolean;
    unpaged:    boolean;
}

export interface Sort {
    empty:    boolean;
    sorted:   boolean;
    unsorted: boolean;
}
