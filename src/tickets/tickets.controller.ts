import { Controller, Get, Param, ParseIntPipe, Query, Post, Body } from '@nestjs/common';
import { TicketsService } from './tickets.service.js';
import { Tickets } from './tickets.interface.js';
import { CreateTicketDto } from './dto/create-ticket.dto.js';
import { FilterTicketsQueryDto } from './dto/filter-tickets-query.dto.js';

@Controller('tickets')
export class TicketsController {
    // private readonly ticketsService = new TicketsService();
    constructor(private readonly ticketsService: TicketsService){}

    @Get()
    findAll(@Query() filterTicketsQueryDto: FilterTicketsQueryDto) {
        return this.ticketsService.findAll(filterTicketsQueryDto.status, filterTicketsQueryDto.priority);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number){
        return this.ticketsService.findOne(id);
    }

    @Post()
    create(@Body() createTicketDto: CreateTicketDto){
        return this.ticketsService.create(createTicketDto);
    }
}