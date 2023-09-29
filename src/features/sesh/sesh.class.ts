import { token, id, role, time, email, noId } from "ottery-dto";

export class Sesh {
    /** this is the id of the user that the sesh belongs to */
    userId: id; //done
    /** A token attached to the session??? */
    token: token; //done
    /** When the session began */
    start: time; //done
    /** If the user is logged in */
    loggedin: boolean; //done
    /** The email of the user */
    email: email; //done
    /** if the account is activated */
    activated: boolean; //done

    /** the current state that the program is in */
    state: role.GUARDIAN | role.CARETAKER; //done
    /** this is the current event that the user is a part of */
    event: id; //done

    constructor() {
        this.start = new Date().getTime();
        this.loggedin = false;
        this.token = noId;
        this.activated = false;
        this.state = role.GUARDIAN;
        this.event = noId;
        this.userId = noId;
    }
}