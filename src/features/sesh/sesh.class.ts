import { token, id, role, time, email } from "ottery-dto";

export class Sesh {
    /** The ID of the session. Used elsewhere to identify the session itself */
    seshId: id;
    /** this is the id of the user that the sesh belongs to */
    userId: id;
    /** A token attached to the session??? */
    token: token;
    /** When the session began */
    start: time;
    /** If the user is logged in */
    loggedin: boolean; //?
    /** The email of the user */
    email: email;
    /** if the account is activated */
    activated: boolean;

    /** the current state that the program is in */
    state: role.GUARDIAN | role.CARETAKER;
    /** this is the current event that the user is a part of */
    event: id;

    constructor(seshId: id) {
        this.seshId = seshId;
        this.start = new Date().getTime();
        this.loggedin = false;
        this.token = undefined;
        this.activated = false;
        this.state = role.GUARDIAN;
        this.event = null;
    }
}