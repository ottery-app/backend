import { Injectable } from '@nestjs/common';
import { User, UserDocument } from './user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpException, HttpStatus } from '@nestjs/common';
import { activationCode, email, id, password, role } from '@ottery/ottery-dto';
import { CreateUserDto } from './CreateUserDto';
import { CrudService } from 'src/features/interfaces/crud.service.inerface';
import { ImageFileService } from 'src/features/images/imageFile.service';

@Injectable()
export class UserService implements CrudService {
  constructor(
    private imageFileService: ImageFileService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {
    console.log(imageFileService);
  }

  /**
   * Creates a new user
   *
   * @param createUserDto A user DTO (data transfer object)
   * @returns a new user DTO
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    if (await this.getByEmail(createUserDto.email)) {
      throw new HttpException(
        'User already exists with this email',
        HttpStatus.CONFLICT,
      );
    } else {
      //make
      const createdUser = new this.userModel(createUserDto);
      createdUser.email = createdUser.email.toLowerCase();
      createdUser.roles.push(role.CARETAKER);
      createdUser.roles.push(role.GUARDIAN);

      //attach other pages
      //make data page
      // createdUser.data = (await this.dataService.create({
      //     id: createdUser._id,
      //     ref: User.name,
      // }))._id;

      return await createdUser.save();
    }
  }

  async update(userId: id, user: User): Promise<User> {
    return await new this.userModel(user).save();
  }

  /**
   * Activates a user's account by checking that their
   * activation code matches. Then marks their account as active
   */
  async activate(userId: id, code: activationCode): Promise<User> {
    const user = await this.get(userId);
    if (user.activated) {
      throw new HttpException('Already activated', HttpStatus.BAD_REQUEST);
    }

    if (user.activationCode !== code) {
      throw new HttpException('Incorrect code', HttpStatus.BAD_REQUEST);
    }

    user.activated = true;
    const updatedUser = new this.userModel(user);
    return await updatedUser.save();
  }

  //the next four methods can be refactored
  async getChildren(userId: id) {
    return (await this.get(userId)).children;
  }

  async getEventsFor(userId: id) {
    return (await this.get(userId)).events;
  }

  async getChatsFor(userId: id) {
    return (await this.get(userId)).chats;
  }

  async addEvent(userId: id, eventId: id) {
    const user = await this.userModel.findById(userId).exec();

    if (user.events.includes(eventId)) {
      throw new HttpException(
        'User already has access to this child.',
        HttpStatus.CONFLICT,
      );
    } else {
      if (user.events) {
        user.events.push(eventId);
      } else {
        user.events = [eventId];
      }
      return user.save();
    }
  }

  async addChild(userId: id, childId: id) {
    const user = await this.userModel.findById(userId).exec();
    if (user.children.includes(childId)) {
      throw new HttpException(
        'User already has access to this child.',
        HttpStatus.CONFLICT,
      );
    } else {
      if (user.children) {
        user.children.push(childId);
      } else {
        user.children = [childId];
      }
      return user.save();
    }
  }

  /**
   * Finds a user based on their ID in the database
   * @param userId The ID of the user in the DB
   * @returns the found user
   */
  async get(userId: id) {
    return await this.userModel.findById(userId).exec();
  }

  async getByEmail(email: email): Promise<User> {
    return await this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async getMany(ids: id[]) {
    return await this.userModel.find({ _id: { $in: ids } });
  }

  /**
   *
   * @param email
   * @param password
   * @returns updated user document
   */
  async setPasswordByEmail(
    email: email,
    password: password,
  ): Promise<UserDocument> {
    return this.userModel.findOneAndUpdate(
      { email },
      { $set: { password } },
      { new: true },
    );
  }

  // /**
  //  * this is used to keep track of social links for faster queries
  //  * @param userId the id of the user to add the link to
  //  * @param socialLinkId the id of the social link being added to the user
  //  * @returns the user document
  //  */
  // async addSocialLink(userId:id, socialLinkId: id) {
  //     const user = await this.get(userId);

  //     if (user.socialLinks) {
  //         user.socialLinks.push(socialLinkId);
  //     } else {
  //         user.socialLinks = [socialLinkId];
  //     }

  //     return await user.save();
  // }
}
