import { TicketsService } from './tickets.service.js';
import { Tickets } from './tickets.interface.js';
export declare class TicketsController {
    private readonly ticketsService;
    constructor(ticketsService: TicketsService);
    findAll(status?: Tickets['status'], priority?: Tickets['priority']): Tickets[];
    findOne(id: number): Tickets;
    create(payload: any): Tickets;
}
