import { IsOptional, IsIn } from "class-validator";
import { Tickets } from "../tickets.interface.js";

export class FilterTicketsQueryDto {
    @IsOptional()
    @IsIn(['open', 'closed', 'in_progress'])
    status?: Tickets['status'];

    @IsOptional()
    @IsIn(['low', 'medium', 'high'])
    priority?: Tickets['priority'];
}
