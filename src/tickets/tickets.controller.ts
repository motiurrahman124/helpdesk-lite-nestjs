import { Controller, Get } from '@nestjs/common';
import { TicketsService } from './tickets.service.js';

@Controller('tickets')
export class TicketsController {
    // private readonly ticketsService = new TicketsService();
    constructor(private readonly ticketsService: TicketsService){}
    
    @Get()
    findAll() {
        return this.ticketsService.findAll();
    }
}