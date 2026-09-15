import { Controller, Get, Param, ParseIntPipe, Query, Post, Body } from '@nestjs/common';
import { TicketsService } from './tickets.service.js';
import { Tickets } from './tickets.interface.js';

@Controller('tickets')
export class TicketsController {
    // private readonly ticketsService = new TicketsService();
    constructor(private readonly ticketsService: TicketsService){}

    @Get()
    findAll(@Query('status') status?:Tickets['status'], @Query('priority') priority?:Tickets['priority']) {
        return this.ticketsService.findAll(status, priority);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number){
        return this.ticketsService.findOne(id);
    }

    @Post()
    create(@Body() payload: any){
        return this.ticketsService.create(payload);
    }
}