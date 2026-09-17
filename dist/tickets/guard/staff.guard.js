var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ForbiddenException, Injectable } from '@nestjs/common';
let StaffGuard = class StaffGuard {
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const staffKey = request.headers['x-staff-key'];
        if (staffKey !== "helpdesk-staff-secret") {
            throw new ForbiddenException("Staff access denied");
        }
        return true;
    }
};
StaffGuard = __decorate([
    Injectable()
], StaffGuard);
export { StaffGuard };
//# sourceMappingURL=staff.guard.js.map