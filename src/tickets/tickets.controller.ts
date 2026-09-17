import { Controller, Get, Param, ParseIntPipe, Query, Post, Body, Patch, UseGuards } from '@nestjs/common';
import { TicketsService } from './tickets.service.js';
import { CreateTicketDto } from './dto/create-ticket.dto.js';
import { FilterTicketsQueryDto } from './dto/filter-tickets-query.dto.js';
import { UpdateTicketDto } from './dto/update-ticket.dto.js';
import { StaffGuard } from './guard/staff.guard.js';

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

    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number, 
        @Body() updateTicketDto: UpdateTicketDto,
    ){
        return this.ticketsService.update(id, updateTicketDto);
    }

    @UseGuards(StaffGuard)
    @Patch(':id/close')
    closeTicket(@Param('id', ParseIntPipe) id: number){
        return this.ticketsService.closeTicket(id);
    }
}