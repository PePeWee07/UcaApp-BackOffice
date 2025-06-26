export interface WhatsAppUserList {
    content?: Content[];
    page?:    Page;
}

export interface Content {
    id?:                 number;
    whatsappPhone?:      string;
    threadId?:           string;
    limitQuestions?:     number;
    firstInteraction?:   Date;
    lastInteraction?:    Date;
    nextResetDate?:      null;
    conversationState?:  string;
    limitStrike?:        number;
    block?:              boolean;
    blockingReason?:     null;
    validQuestionCount?: number;
    identificacion?:     string;
    chatSessions?:       ChatSession[];
    erpUser?:            ERPUser;
    userTickets:         UserTicket[];
}

export interface ChatSession {
    id?:            number;
    whatsappPhone?: string;
    messageCount?:  number;
    startTime?:     Date;
    endTime?:       Date;
}

export interface ERPUser {
    codigoErp?:          string;
    tipoIdentificacion?: string;
    identificacion?:     string;
    nombres?:            string;
    apellidos?:          string;
    numeroCelular?:      string;
    emailInstitucional?: string;
    emailPersonal?:      string;
    sexo?:               string;
    rolesUsuario?:       RolesUsuario[];
}

export interface RolesUsuario {
    tipoRol?:     string;
    detallesRol?: DetallesRol[];
}

export interface DetallesRol {
    idCarrera?:            null | string;
    nombreCarrera?:        null | string;
    ultimoSemestreActivo?: null | string;
    unidadAcademica?:      null | string;
    sede?:                 string;
    modalidad?:            null | string;
    curso?:                null | string;
    paralelo?:             null | string;
    nombreRol?:            null | string;
    unidadOrganizativa?:   null | string;
}

export interface Page {
    size?:          number;
    number?:        number;
    totalElements?: number;
    totalPages?:    number;
}

export interface UserTicket {
    id:                number;
    name:              string;
    status:            string;
}
