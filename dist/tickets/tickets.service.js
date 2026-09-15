var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable, NotFoundException } from '@nestjs/common';
let TicketsService = class TicketsService {
    tickets = [
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
    nextTicketId = 4;
    findAll(status, priority) {
        let tickets = this.tickets;
        if (status) {
            tickets = tickets.filter(ticket => ticket.status === status);
        }
        if (priority) {
            tickets = tickets.filter(ticket => ticket.priority === priority);
        }
        return tickets;
    }
    findOne(id) {
        const ticket = this.tickets.find(ticket => ticket.id === id);
        if (!ticket) {
            throw new NotFoundException(`Ticket with id ${id} not found`);
        }
        return ticket;
    }
    create(createTicketDto) {
        const ticket = {
            id: this.nextTicketId++,
            subject: createTicketDto.subject,
            description: createTicketDto.description,
            status: 'open',
            priority: createTicketDto.priority,
            createdAt: new Date().toISOString(),
        };
        this.tickets.push(ticket);
        return ticket;
    }
};
TicketsService = __decorate([
    Injectable()
], TicketsService);
export { TicketsService };
//# sourceMappingURL=tickets.service.js.map