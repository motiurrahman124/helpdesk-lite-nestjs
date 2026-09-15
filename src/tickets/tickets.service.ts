import { Injectable } from '@nestjs/common';
import { Tickets } from './tickets.interface.js';

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

    findAll(){
        return this.tickets;
    }
}
