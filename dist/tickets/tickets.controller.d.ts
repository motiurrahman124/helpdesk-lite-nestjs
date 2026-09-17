import { TicketsService } from './tickets.service.js';
import { CreateTicketDto } from './dto/create-ticket.dto.js';
import { FilterTicketsQueryDto } from './dto/filter-tickets-query.dto.js';
import { UpdateTicketDto } from './dto/update-ticket.dto.js';
export declare class TicketsController {
    private readonly ticketsService;
    constructor(ticketsService: TicketsService);
    findAll(filterTicketsQueryDto: FilterTicketsQueryDto): import("./tickets.interface.js").Tickets[];
    findOne(id: number): import("./tickets.interface.js").Tickets;
    create(createTicketDto: CreateTicketDto): import("./tickets.interface.js").Tickets;
    update(id: number, updateTicketDto: UpdateTicketDto): import("./tickets.interface.js").Tickets;
    closeTicket(id: number): import("./tickets.interface.js").Tickets;
}
