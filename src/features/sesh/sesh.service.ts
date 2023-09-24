import { HttpCode, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Sesh } from './sesh.class';
import { CryptService } from '../crypt/crypt.service';
import { User } from '../user/user.schema';
import { role, id, token } from 'ottery-dto';

@Injectable()
export class SeshService {
    /** A map of session and their IDs */
    private sessions: Map<id, Sesh>;

    /**
     * Construct a new map of sessions
     */
    constructor(
        private cryptService: CryptService,
    ) {
        this.sessions = new Map<id, Sesh>();
    }

    /**
     * Compares a session token to the token in the header
     * @param seshId the session ID
     * @param token the token in the header
     * @returns true if tokens match
     */
    validateSession(seshId: id, token: token) {
        const sesh = this.getSeshInfo(seshId);

        if (!sesh) {
            return false;
        }

        if (sesh.token !== token) { //wrong token to log out with
            return false;
        }

        return true;
    }

    /**
     * 
     * @param seshId the session ID
     * @returns information about the session
     */
    getSeshInfo(seshId: id): Sesh {
        return this.sessions.get(seshId);
    }

    /**
     * Starts/activates a session by adding it to the map of active sessions
     * 
     * @returns information about the session
     */
    activateSesh() {
        const seshId = this.cryptService.makeSeshId();
        this.sessions.set(seshId, new Sesh(seshId));
        return this.sessions.get(seshId);
    }

    /**
     * Ends a session by removing is from the map of active sessions
     * 
     * @param seshId the session ID to end
     * @returns true if deleted
     */
    killSesh(seshId: id): boolean {
        return this.sessions.delete(seshId);
    }

    switchState(seshId: id, eventId?: id): Sesh {
        const sesh = this.getSeshInfo(seshId);
        sesh.state = (sesh.state === role.GUARDIAN) ? role.CARETAKER : role.GUARDIAN;
        sesh.event = eventId;
        return sesh;
    }

    logout(seshId: id): Sesh {
        let sesh = this.getSeshInfo(seshId);
        sesh.activated = false;
        sesh.loggedin = false;
        this.killSesh(seshId);
        return sesh;
    }

    login(seshId: id, user: User): Sesh {
        const session = this.getSeshInfo(seshId);
        session.userId = user._id;
        session.email = user.email;
        session.activated = user.activated;
        session.loggedin = true;
        session.token = this.cryptService.makeToken(user);
        return session;
    }

    activate(seshId: id) {
        this.getSeshInfo(seshId).activated = true;
        return this.getSeshInfo(seshId);
    }

    register(seshId: id, user: User): Sesh {
        const sesh = this.getSeshInfo(seshId);
        sesh.userId = user._id;
        sesh.token = this.cryptService.makeToken(user);
        sesh.email = user.email;
        sesh.loggedin = true;
        return sesh;
    }

    isLoggedin(seshId: id) {
        return this.getSeshInfo(seshId).loggedin;
    }

    isActivated(seshId: id) {
        return this.getSeshInfo(seshId).activated;
    }

    isCaretaker(seshId: id) {
        return this.getSeshInfo(seshId).state === role.GUARDIAN;
    }

    isGuardian(seshId: id) {
        return this.getSeshInfo(seshId).state === role.CARETAKER;
    }
}