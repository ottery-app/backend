import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '../user/user.schema';
import { SALT_ROUNDS } from './crypt.types';

@Injectable()
export class CryptService {
    constructor() {}

    /**
     * Hashes a password using bcrypt
     * @param pw the password to hash
     * @returns the hashed password
     */
    async hash(pw:string) {
        return await bcrypt.hash(pw, SALT_ROUNDS);
    }

    /**
     * Compares a submitted password with a hashed password
     * @param bodyPassword the password in the body of the request
     * @param userPassword the hashed password in the database
     * @returns true if the passwords match
     */
    async compare(bodyPassword:string, userPassword: string) {
        return await bcrypt.compare(bodyPassword, userPassword);
    }

    /**
     * Used to generate a random string of numbers and letters
     * 
     * @param length the length of the code to be made
     * @returns a 'random' string of chars and numbers
     */
    makeCode(length) {
        let result = '';
        let characters = 'ABCDEFGHJKMNPQRSTUVWXYZ123456789';
        let charactersLength = characters.length;
        for ( let i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    /**
     * Generates a random string used for session IDs
     * 
     * @returns a 32-character string
     */
    makeSeshId() {
        return this.makeCode(32);
    }

    /**
     * Generates a random string used for tokens
     * 
     * @param user a user
     * @returns a 32-character string
     */
    makeToken(user: User) {
        return this.makeCode(32); // NON SECURE - TEMPORARY OPTION FOR TESTING
        
        // https://docs.nestjs.com/security/authentication#implementing-passport-jwt
    }

}