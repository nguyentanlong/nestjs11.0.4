import * as bcrypt from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);  // hash password bằng bcrypt, salt round 10 chuẩn
}