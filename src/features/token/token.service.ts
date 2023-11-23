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

  async setToken(email: string, type: TokenType = TokenType.RESET_PASSWORD) {
    // const user = await this.userService.getByEmail(email);
    // if (!user) {
    //   throw new HttpException(
    //     'The user with this email does not exist',
    //     HttpStatus.NOT_FOUND,
    //   );
    // }

    if (
      await this.tokenModel.findOne({
        email,
        type,
      })
    ) {
      await this.tokenModel.deleteOne({
        email,
        type,
      });
    }

    // Create a encrypted token and save
    const token = this.cryptService.makeCode(32);
    const hash = await this.cryptService.hash(token);

    await this.tokenModel.create({
      type,
      email,
      token: hash,
      createdAt: now(),
    });

    return token;
  }

  async validateToken(
    email: string,
    token: string,
    type: TokenType = TokenType.RESET_PASSWORD,
  ) {
    // Check token's validity
    const dbToken = await this.tokenModel.findOne({
      email,
      type,
    });

    if (!dbToken) {
      throw new HttpException(
        'Invalid or expired token',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (token !== dbToken.token) {
      throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
    }

    return dbToken;
  }
}
