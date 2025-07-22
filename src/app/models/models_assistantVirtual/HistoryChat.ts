export interface HistoryChat {
    content: Content[];
    page:    Page;
}

export interface Content {
    inputTokens:        number;
    outputTokens:       number;
    totalTokens:        number;
    metadata:           string;
    model:              string;
    promptId:           string;
    promptVariables:    string;
    promptVersion:      string;
    responseId:         string;
    previousResponseId: null | string;
    createdAt:          Date;
    reasoning:          string;
    userMessage:        string;
    toolCalls:          any[];
    assistantMessage:   string;
}

export interface Page {
    size:          number;
    number:        number;
    totalElements: number;
    totalPages:    number;
}
