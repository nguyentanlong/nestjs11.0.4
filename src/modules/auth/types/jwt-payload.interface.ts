import { Role } from "src/common/enums/enum.role";

export interface JwtPayload {
    id: string;
    role: Role;
}