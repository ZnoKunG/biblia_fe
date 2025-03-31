import Record from "./record.model";

export default interface User {
    id: number;
    username: string;
    password: string;
    email: string;
    records: Record[];
}