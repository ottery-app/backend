import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Sesh, SeshDocument } from './sesh.schema';
import { CryptService } from '../../crypt/crypt.service';
import { User } from 'src/features/core/user/user.schema';
import { role, id, token, noId } from '@ottery/ottery-dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sesh as InitSesh } from './sesh.class';

@Injectable()
export class SeshService {
  /**
   * Construct a new map of sessions
   */
  constructor(
    private cryptService: CryptService,
    @InjectModel(Sesh.name) private seshModel: Model<SeshDocument>,
  ) {}

  /**
   * Compares a session token to the token in the header
   * @param seshId the session ID
   * @param token the token in the header
   * @returns true if tokens match
   */
  async safelyGet(seshId: token, token: token) {
    const sesh = await this.getSeshInfo(seshId);

    if (!sesh || sesh.token !== token) {
      //wrong token to log out with
      throw new HttpException('Unauthorizesd session', HttpStatus.UNAUTHORIZED);
    }

    return sesh;
  }

  /**
   *
   * @param seshId the session ID
   * @returns information about the session
   */
  async getSeshInfo(seshId: id) {
    return await this.seshModel.findById(seshId);
  }

  /**
   * Starts/activates a session by adding it to the map of active sessions
   *
   * @returns information about the session
   */
  async create() {
    const newSesh = new this.seshModel(new InitSesh());
    return await newSesh.save();
  }

  /**
   * Ends a session by removing is from the map of active sessions
   *
   * @param seshId the session ID to end
   * @returns true if deleted
   */
  private async killSesh(seshId: id) {
    return await this.seshModel.deleteOne({ _id: seshId });
  }

  async switchState(sesh: SeshDocument, eventId?: id) {
    console.log("switching");
    sesh.state = sesh.state === role.GUARDIAN ? role.CARETAKER : role.GUARDIAN;

    if (sesh.event === eventId) {
      sesh.event = noId;
    } else {
      sesh.event = eventId;
    }

    console.log("saving sesh");
    const seshRes = await sesh.save();
    console.log("saved sesh");
    return seshRes;
  }

  async logout(sesh: SeshDocument) {
    sesh.activated = false;
    sesh.loggedin = false;
    await this.killSesh(sesh._id);
    return sesh;
  }

  async login(session: SeshDocument, user: User) {
    session.userId = user._id;
    session.email = user.email;
    session.activated = user.activated;
    session.loggedin = true;
    session.token = this.cryptService.makeToken(user);
    return await session.save();
  }

  async activate(sesh: SeshDocument) {
    sesh.activated = true;
    return await sesh.save();
  }

  async isLoggedin(sesh: SeshDocument) {
    return sesh.loggedin || false;
  }

  async isActivated(sesh: SeshDocument) {
    return sesh.activated || false;
  }

  async isCaretaker(sesh: SeshDocument) {
    return sesh.state === role.CARETAKER || false;
  }

  async isGuardian(sesh: SeshDocument) {
    return sesh.state === role.GUARDIAN || false;
  }

  async usersAtEvent(eventId: id) {
    return (await this.seshModel.find({event: eventId})).map(sesh=>sesh.userId);
  }
}
