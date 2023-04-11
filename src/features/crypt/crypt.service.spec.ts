// import { CryptService } from "./crypt.service";
// import { Test, TestingModule } from '@nestjs/testing';
// import { MongooseModule } from '@nestjs/mongoose';
// import { ConfigModule, ConfigService } from '@nestjs/config';

// describe('CryptService', () => {
//     let cryptService: CryptService;
//     cryptService = new CryptService();

//     const password = 'thisisapassword';

//     test('hash and compare', async() => {
//         try {
//             let hashedPassword = await cryptService.hash(password);
//             expect(hashedPassword).not.toBe(password);
//             expect(cryptService.compare(password, hashedPassword)).toBeTruthy;
//         } catch (e) {
//             throw new Error('Passwords did not match');
//         }
//     })

//     test ('hash and compare invalid (different password)', async () => {
//         try {
//             let hashedPassword = await cryptService.hash(password);
//             expect(cryptService.compare('incorrectPassword', hashedPassword)).toBeFalsy;
//         } catch (e) {
//             throw new Error('Password matched or unknown error');
//         }
//     })

//     test ('hash and compare invalid (different hash)', async () => {
//         try {
//             let diffHashedPassword = await cryptService.hash('differentPassword');
//             expect(cryptService.compare(password, diffHashedPassword)).toBeFalsy;

//         } catch (e) {
//             throw new Error('Password matched or unknown error');
//         }
//     })

//     test('make code of length', async () => {
//         let code = cryptService.makeCode(12);
//         expect(code.length).toEqual(12);
//     })
// })