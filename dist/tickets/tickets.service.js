var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable } from '@nestjs/common';
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
    findAll() {
        return this.tickets;
    }
};
TicketsService = __decorate([
    Injectable()
], TicketsService);
export { TicketsService };
//# sourceMappingURL=tickets.service.js.map