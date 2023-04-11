// import mongoose from 'mongoose';
// import { Test, TestingModule } from '@nestjs/testing';
// import { MongooseModule } from '@nestjs/mongoose';
// import { CryptService } from "../crypt/crypt.service";
// import { UserService } from "./user.service";
// import { User, UserSchema } from './user.schema';
// import { ConfigModule, ConfigService } from '@nestjs/config';
// import { HttpException } from '@nestjs/common';


// // Credit https://stackoverflow.com/questions/55143467/testing-mongoose-models-with-nestjs
// // for helping me work with the required userModel

// /**
//  * A test user object
//  */
// const testUser = {
//     email: 'test@gmail.com',
//     password: 'TestPassword',
//     firstName: 'TestFirstName',
//     lastName: 'TestLastName',
// };

// /**
//  * Tests the UserService functionality
//  */
// describe('UserService', () => {
//     let cryptService: CryptService;
//     let userService: UserService;

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
//               MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])//-------import model here
//             ],
//             providers: [CryptService, UserService]
//           }).compile()
//         cryptService = new CryptService();
//         userService = module.get<UserService>(UserService);
//     });

//     /**
//      * Delete test account from database and disconnect from the DB
//      */
//     afterAll(async () => {
//         userService.deleteTestAccount();
//         mongoose.disconnect();
//     });

//     // If test fails, try deleting test account if it already exists
//     /**
//      * Registers a new users with Ottery
//      */
//     test('create user account', async () => {
//         try {
//             let returnedTestUser = await userService.create(testUser);
//             expect(returnedTestUser.email).toBe(testUser.email.toLowerCase());
//         } catch (e) {
//             throw new Error('Account should not yet exist');
//         }
//     });

//     /**
//      * Attempts to register a duplicate user (user with an email
//      * that is already registered with Ottery)
//      */
//     test('duplicate user should not be created', async () => {
//         try {
//             await userService.create(testUser);
//             throw new Error('Account should already exist and not be able to be registered');
//         } catch (e) {
//             expect(e).toBeInstanceOf(HttpException);
//         }
//     });
    
//     /**
//      * Tests account activation functionality
//      */
//     test ('activate user', async () => {
//         // Invalid activation code
//         try {
//             const returnedTestUser = await (await userService.findOneByEmail(testUser.email));
//             await userService.activate(returnedTestUser._id, 'bad code');
//             throw new Error('Did not throw HttpException when invalid code given');
//         } catch (e) {
//             expect(e).toBeInstanceOf(HttpException);
//         }

//         // Valid activation code
//         try {
//             const returnedTestUser = await userService.findOneByEmail(testUser.email);
//             let activatedTestUser = await userService.activate(returnedTestUser._id, returnedTestUser.activationCode);
//             expect(activatedTestUser.activated).toBeTruthy();
//         } catch (e) {
//             throw new Error('Account should be activated');
//         }
//     })

//     /**
//      * Returns a list of a user's children (empty in this test)
//      */
//     test('get children for user', async () =>  {
//         try { 
//             const returnedChildren = await userService.getChildrenFor((await userService.findOneByEmail(testUser.email))._id);
//             expect(returnedChildren).toEqual([]);
//         } catch (e) {
//             throw new Error('Children for account should be empty');
//         }
//     });


// });

