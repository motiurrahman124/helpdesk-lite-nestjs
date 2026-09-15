import { TicketsService } from './tickets.service.js';
export declare class TicketsController {
    private readonly ticketsService;
    constructor(ticketsService: TicketsService);
    findAll(): import("./tickets.interface.js").Tickets[];
}
