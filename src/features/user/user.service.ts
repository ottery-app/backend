import { Injectable } from '@nestjs/common';
import { User, UserDocument } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CryptService } from '../crypt/crypt.service';
import { ACTIVATION_CODE_LENGTH } from '../crypt/crypt.types';
import { activationCode, email, id, role, UserDto } from '@ottery/ottery-dto';
import { DataService } from '../data/data.service';

@Injectable()
export class UserService {
    /**
     * States the needed service (cryptService) and injects a user model
     * 
     * @param cryptService the cryptographic service to be used
     * @param userModel a model of a user 'object'
     */
    constructor(
        private dataService: DataService,
        private cryptService: CryptService,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>
    ) {}

    /**
     * Creates a new user
     * 
     * @param createUserDto A user DTO (data transfer object)
     * @returns a new user DTO
     */
    async create(createUserDto: Partial<UserDto>): Promise<User> {
        if (await this.findOneByEmail(createUserDto.email)) {
            throw new HttpException("User already exists with this email", HttpStatus.CONFLICT);
        } else {
            //set defaults
            //pw was hashed in controller as the rule is the instant we get a pw we hash it
            createUserDto.activated = false;
            createUserDto.activationCode = this.cryptService.makeCode(ACTIVATION_CODE_LENGTH);

            //make
            const createdUser = new this.userModel(createUserDto);
            createdUser.email = createdUser.email.toLowerCase();
            createdUser.roles.push(role.CARETAKER);
            createdUser.roles.push(role.GUARDIAN);

            //attach other pages
            //make data page
            createdUser.data = (await this.dataService.create({
                id: createdUser._id,
                ref: User.name,
            }))._id;

            return await createdUser.save();
        }
    }

    /**
     * Updates a user
     * @param user The user data that will be updated
     * @returns the updated user
     */
    async save(user: User): Promise<User> {
        const updatedUser = new this.userModel(user);
        return await updatedUser.save();
    }

    /**
     * Activates a user's account by checking that their
     * activation code matches. Then marks their account as active
     * @param userId the ID of the user to activate
     * @param code the code to activate
     * @returns the updated user with the boolean value for activated set to true
     */
    async activate(userId: id, code: activationCode): Promise<User> {
        const user = await this.findOneById(userId);
        if (user.activated) {
            throw new HttpException("Already activated", HttpStatus.BAD_REQUEST);
        }

        if (user.activationCode !== code) {
            throw new HttpException("Incorrect code", HttpStatus.BAD_REQUEST);
        }

        user.activated = true;
        const updatedUser = new this.userModel(user);
        return await updatedUser.save();
    }

    //the next four methods can be refactored
    async getChildrenFor(userId: id) {
        return (await this.findOneById(userId)).children;
    }

    async getEventsFor(userId: id) {
        return (await this.findOneById(userId)).events;
    }

    async getChatsFor(userId: id) {
        return (await this.findOneById(userId)).chats
    }

    async addEventById(userId:id, eventId:id) {
        const user = await this.userModel.findById(userId).exec();

        if (user.events.includes(eventId)) {
            throw new HttpException("User already has access to this child.", HttpStatus.CONFLICT);
        } else {
            if (user.events) {
                user.events.push(eventId);
            } else {
                user.events = [eventId];
            }
            return user.save();
        };
    }

    async addChildById(userId:id, childId:id) {
        const user = await this.userModel.findById(userId).exec();
        if (user.children.includes(childId)) {
            throw new HttpException("User already has access to this child.", HttpStatus.CONFLICT);
        } else {
            if (user.children) {
                user.children.push(childId);
            } else {
                user.children = [childId];
            }
            return user.save();
        };
    }

    /**
     * Finds a user based on their ID in the database
     * @param userId The ID of the user in the DB
     * @returns the found user
     */
    async findOneById(userId:id) {
        return await this.userModel.findById(userId).exec();
    }

    async findManyById(ids: id[]) {
        return await this.userModel.find({'_id': { $in: ids }});
    }

    /**
     * Find a user with the given emil
     * 
     * @param email the email to find
     * @returns a User with the given email
     */
    async findOneByEmail(email: email): Promise<User> {
        return await this.userModel.findOne({ email: email.toLowerCase() }).exec();
    }

    /**
     * this is used to keep track of social links for faster queries
     * @param userId the id of the user to add the link to
     * @param socialLinkId the id of the social link being added to the user
     * @returns the user document
     */
    async addSocialLink(userId:id, socialLinkId: id) {
        const user = await this.findOneById(userId);

        if (user.socialLinks) {
            user.socialLinks.push(socialLinkId);
        } else {
            user.socialLinks = [socialLinkId];
        }


        return await user.save();
    }

    /**
     * TESTING ONLY
     */
    async deleteTestAccount() {
        return await this.userModel.findOneAndDelete({email: 'test@gmail.com'});
    }
}