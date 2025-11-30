import { UserRole } from "@prisma/client"

export type IJwtPayload ={
    email : string,
    role: UserRole
}