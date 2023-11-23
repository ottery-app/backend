import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { CryptService } from '../crypt/crypt.service';
import { SeshService } from './sesh/sesh.service';

@Injectable()
export class AuthService implements OnApplicationBootstrap {
  crypt: CryptService;
  sesh: SeshService;

  constructor(
    private cryptService: CryptService,
    private seshService: SeshService,
  ) {}

  onApplicationBootstrap() {
    this.crypt = this.cryptService;
    this.sesh = this.seshService;
  }
}
