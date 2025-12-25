declare namespace NodeJS {
    interface ProcessEnv {
        AUDIT_DB_HOST: string;
        AUDIT_DB_PORT: string;
        AUDIT_DB_USERNAME: string;
        AUDIT_DB_PASSWORD: string;
        AUDIT_DB_DATABASE: string;
        // Các biến khác của main DB nếu cần
        DB_HOST?: string;
        DB_PORT?: string;
        DB_USERNAME?: string;
        DB_PASSWORD?: string;
        DB_DATABASE?: string;
    }
}