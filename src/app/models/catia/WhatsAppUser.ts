export interface WhatsAppUser {
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
    idCarrera?:            null;
    nombreCarrera?:        null;
    ultimoSemestreActivo?: null;
    unidadAcademica?:      null;
    sede?:                 string;
    modalidad?:            null;
    curso?:                null;
    paralelo?:             null;
    nombreRol?:            string;
    unidadOrganizativa?:   string;
}

export interface UserTicket {
    id:                number;
    name:              string;
    status:            string;
}

