// import mongoose, { mongo } from 'mongoose';
// import { Test, TestingModule } from '@nestjs/testing';
// import { MongooseModule } from '@nestjs/mongoose';
// import { CryptService } from "../crypt/crypt.service";
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { ChildService } from './child.service';
// import { Child, ChildSchema } from './child.schema';
// import { gender } from '../../types/gender.type';
// import { ImageDto } from '../image/image.dto';
// import { NotFoundException } from '@nestjs/common';

// /**
//  * A child object used for testing
//  */
// const testChild = {
//   // pfp: new ImageDto(), // difficult to replicate, so just giving it the DTO
//   pfp: new ImageDto(),
//   firstName: 'firstName',
//   middleName: null,
//   lastName: 'lastName',
//   dateOfBirth: new Date().getTime(),
//   gender: gender.MALE,
// };

// /** For working with the database entry of the child */
// let testDatabaseChild = null;

// /**
//  * Tests the UserService functionality
//  */
// describe('ChildService', () => {
//     let childService: ChildService;

//     /**
//      * Sets up DB connection and builds the user service
//      */
//     beforeAll(async () => {
//         const module: TestingModule = await Test.createTestingModule({
//             imports: [
//               ConfigModule.forRoot({
//                 isGlobal: true,
//                 cache: true
//               }),
//               MongooseModule.forRootAsync({
//                 imports: [ConfigModule],
//                 inject: [ConfigService],
//                 useFactory: (config: ConfigService) => ({
//                   uri: config.get<string>('MONGODB_URI_ADMIN'),
//                 })
//               }),
//               MongooseModule.forFeature([{ name: Child.name, schema: ChildSchema }])
//             ],
//             providers: [CryptService, ChildService]
//           }).compile()
//         childService = module.get<ChildService>(ChildService);
//     });

//     afterAll(async () => {
//       childService.deleteChild(testDatabaseChild);
//       mongoose.disconnect();
//     });

//     test('create child', async () => {
//       try {
//         testDatabaseChild = await childService.create(testChild);
//         console.log("TDC - create:", testDatabaseChild);
//         expect(testDatabaseChild.dateOfBirth).toBe(testChild.dateOfBirth);
//         expect(testDatabaseChild.firstName).toBe(testChild.firstName);
//         expect(testDatabaseChild.middleName).toBeNull();
//       } catch (e) {
//         throw new Error('Child was not created');
//       }
//     })

//     test('update child', async() => {
//       try {
//         testDatabaseChild.middleName = "middleName";
//         let returned = await childService.update(testDatabaseChild);
//         expect(returned.dateOfBirth).toBe(testDatabaseChild.dateOfBirth);
//         expect(returned.firstName).toBe(testDatabaseChild.firstName);
//         expect(returned.middleName).toBe('middleName');
//       } catch (e) {
//         throw new Error('Child was not updated');
//       }
//     })

//     test('find child by id', async () => {
//       try {
//         let returned = await childService.findOneById(testDatabaseChild._id);
//         expect(returned.firstName).toBe(testChild.firstName);
//       } catch (e) {
//         throw new Error('Child was not found by ID');
//       }
//     })

//     test('invalid find child by id', async () => {
//       try {
//         await childService.findOneById('000000000000');
//         throw new Error ('Invalid child ID should not have been found'); // might be able to fail if there is actually a child with an ID that is + 1 ID of test child
//       } catch (e) {
//         expect(e).toBeInstanceOf(NotFoundException);
//       }
//     })

//     test('invalid update child', async () => {
//       try {
//         testDatabaseChild._id = new mongoose.Types.ObjectId('000000000000');
//         const t = await childService.update(testDatabaseChild);
//         throw new Error('Null update was successful');
//       } catch (e) {
//         expect(e).toBeInstanceOf(NotFoundException);
//       }
//     })

// })