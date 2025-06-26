export interface ChatAssistenteVirtual {
    history?: History[];
}

export interface History {
    content?:   string;
    role?:      string;
    timestamp?: string;
}
