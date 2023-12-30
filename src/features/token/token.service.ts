import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, now } from 'mongoose';

import { Token, TokenDocument, TokenType } from './token.schema';
import { CryptService } from '../crypt/crypt.service';

@Injectable()
export class TokenService {
  constructor(
    @InjectModel(Token.name)
    private tokenModel: Model<TokenDocument>,
    private cryptService: CryptService,
  ) {}

  async setToken(key: string, type: TokenType = TokenType.RESET_PASSWORD) {
    // const user = await this.userService.getByEmail(email);
    // if (!user) {
    //   throw new HttpException(
    //     'The user with this email does not exist',
    //     HttpStatus.NOT_FOUND,
    //   );
    // }

    if (
      await this.tokenModel.findOne({
        key,
        type,
      })
    ) {
      await this.tokenModel.deleteOne({
        key,
        type,
      });
    }

    // Create a encrypted token and save
    const token = this.cryptService.makeCode(32);
    const hash = await this.cryptService.hash(token);

    console.log("DELETING  TOKEN");

    await this.tokenModel.create({
      type,
      key,
      token: hash,
      createdAt: now(),
    });

    return token;
  }

  async validateToken(
    key: string,
    token: string,
    type: TokenType = TokenType.RESET_PASSWORD,
    deltoken: boolean,
  ) {
    console.log("VALIDATING TOKEN")
    // Check token's validity
    const dbToken = await this.tokenModel.findOne({
      key,
      type,
    });

    console.log("FOUND TOKEN")

    if (!dbToken) {
      console.log("NO TOKEN")
      throw new HttpException(
        'Invalid or expired token',
        HttpStatus.BAD_REQUEST,
      );
    }


    const isEqual = await this.cryptService.compare(token, dbToken.token)
    if (isEqual === false) {
      console.log("TOKEN IS NOT VALID")
      throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
    } else {
      if (deltoken) {
        console.log("DELETING TOKEN")
        await dbToken.deleteOne();
      }
      console.log("SUCCESS")
      return isEqual;
    }
  }
}
