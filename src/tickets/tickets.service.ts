import { Injectable, NotFoundException } from '@nestjs/common';
import { Tickets } from './tickets.interface.js';
import { CreateTicketDto } from './dto/create-ticket.dto.js';
import { UpdateTicketDto } from './dto/update-ticket.dto.js';

@Injectable()
export class TicketsService {
    private readonly tickets: Tickets[] = [
        {
            id: 1,
            subject: 'Ticket 1',
            description: 'Description 1',
            priority: 'low',
            createdAt: new Date().toISOString(),
            status: 'open',
        },
        {
            id: 2,
            subject: 'Ticket 2',
            description: 'Description 2',
            priority: 'medium',
            createdAt: new Date().toISOString(),
            status: 'closed',
        },
        {
            id: 3,
            subject: 'Ticket 3',
            description: 'Description 3',
            priority: 'high',
            createdAt: new Date().toISOString(),
            status: 'in_progress',
        },
    ];

    private nextTicketId = 4;

    findAll(status?:Tickets['status'], priority?:Tickets['priority']){
        let tickets = this.tickets;
        if (status) {
            tickets = tickets.filter(ticket => ticket.status === status);
        }
        if (priority) {
            tickets = tickets.filter(ticket => ticket.priority === priority);
        }
        return tickets;
    }

    findOne(id: number){
        const ticket = this.tickets.find(ticket => ticket.id === id);
        if (!ticket) {
            throw new NotFoundException(`Ticket with id ${id} not found`);
        }
        return ticket;
    }

    create(createTicketDto: CreateTicketDto){
        const ticket: Tickets = {
            id: this.nextTicketId++,
            subject: createTicketDto.subject,
            description: createTicketDto.description,
            status: 'open',
            priority: createTicketDto.priority,
            createdAt: new Date().toISOString(),
        }

        this.tickets.push(ticket);

        return ticket;
    }

    update(id: number, updateTicketDto: UpdateTicketDto){
        const ticket = this.findOne(id);
        if (!ticket) {
            throw new NotFoundException(`Ticket with id ${id} not found`);
        }
        
        Object.assign(ticket, updateTicketDto);
        
        return ticket;
    }
}
