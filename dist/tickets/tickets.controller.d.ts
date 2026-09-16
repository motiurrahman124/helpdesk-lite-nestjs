import { TicketsService } from './tickets.service.js';
import { Tickets } from './tickets.interface.js';
import { CreateTicketDto } from './dto/create-ticket.dto.js';
import { FilterTicketsQueryDto } from './dto/filter-tickets-query.dto.js';
import { UpdateTicketDto } from './dto/update-ticket.dto.js';
export declare class TicketsController {
    private readonly ticketsService;
    constructor(ticketsService: TicketsService);
    findAll(filterTicketsQueryDto: FilterTicketsQueryDto): Tickets[];
    findOne(id: number): Tickets;
    create(createTicketDto: CreateTicketDto): Tickets;
    update(id: number, updateTicketDto: UpdateTicketDto): Tickets;
}
