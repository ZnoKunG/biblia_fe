import User from "./user.model";

export default interface Record {
    bookID: number;
    userID: number;
    status: string;
    curr_progress: number;
    curr_chapter: number;
    created_at: Date;
    started_date: Date;
    update_date: Date;
    stop_date: Date;
    finish_date: Date;
    user: User; 
}