import { Tickets } from './tickets.interface.js';
import { CreateTicketDto } from './dto/create-ticket.dto.js';
export declare class TicketsService {
    private readonly tickets;
    private nextTicketId;
    findAll(status?: Tickets['status'], priority?: Tickets['priority']): Tickets[];
    findOne(id: number): Tickets;
    create(createTicketDto: CreateTicketDto): Tickets;
}
