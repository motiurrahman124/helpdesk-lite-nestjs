export interface Tickets {
    id: number;
    subject: string;
    description: string;
    priority: "low" | "medium" | "high";
    status: "open" | "closed" | "in_progress";
    createdAt: string;
}
