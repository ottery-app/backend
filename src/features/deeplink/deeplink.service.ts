import { Injectable } from '@nestjs/common';

@Injectable()
export class DeeplinkService {
    constructor() {}

    createLink(path, props) {
        let root = `${process.env.CLIENT_WEB_APP_URL}${path}?`;

        Object.keys(props).forEach((key)=>{
            root = root += `${key}=${props[key]}&`;
        })

        return root;
    }
}