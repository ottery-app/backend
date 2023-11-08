import { noId, role } from "@ottery/ottery-dto";
import { CryptService } from "../crypt/crypt.service";
import { SeshService } from "./sesh.service";
import { isId } from "@ottery/ottery-dto";
import { User } from "../../user/user.schema";

//TODO the sesh service needs to be udpated. it assumes that most the info it needs will be
//passsed in and it does not update based on the users true state. It shoud have an UPDATE method
//which is used to update the sesh to the most recent user state... maybe. not sure its worth.
//may be better to combine sesh and auth into one service

describe('SeshService', () => {
    let seshService: SeshService;

    beforeEach(() => {
        seshService = new SeshService(new CryptService());
    });

    describe('create', () => {
        it('should return a newly activated sesh', async () => {
            const time = new Date().getTime();
            const sesh = seshService.create();

            expect(sesh.activated).toBe(false);
            expect(sesh.email).toBe(undefined);
            expect(sesh.event).toBe(noId);
            expect(sesh.loggedin).toBe(false);
            expect(isId(sesh.seshId)).toBe(true);
            expect(Math.abs(sesh.start - time) < 10).toBe(true);
            expect(sesh.state).toBe(role.GUARDIAN);
            expect(sesh.token).toBe(noId);
            expect(sesh.userId).toBe(noId);
        });
    });

    describe("activate", ()=> {
        it("activates the sesh when the user verrifies their email", ()=>{
            //TODO this info should be checked from the backend
            //not just updated via this
            //maybe just pass in the new user and then update the sesh info from that
            //so if the user was updated it would return a user
            //and then this could read from that
            let sesh = seshService.create();
            expect(sesh.activated).toBe(false);
            sesh = seshService.activate(sesh.seshId);
            expect(sesh.activated).toBe(true);
        })
    });

    describe("getSeshInfo", ()=> {
        it("gets the information about the sesh", ()=>{
            const sesh = seshService.create();
            const getSesh = seshService.getSeshInfo(sesh.seshId);
            expect(getSesh).toEqual(sesh);
        })
    });

    describe("isActivated", ()=>{
        it("checks if the session is active of not active", ()=>{
            const sesh = seshService.create();
            expect(seshService.isActivated(sesh.seshId)).toBe(false);
            seshService.activate(sesh.seshId);
            expect(seshService.isActivated(sesh.seshId)).toBe(true);
        });
    })

    describe("isCaretaker", ()=>{
        it("checks if the session is currently in the caretaker state", ()=>{
            const sesh = seshService.create();
            expect(seshService.isCaretaker(sesh.seshId)).toBe(false);
            seshService.switchState(sesh.seshId);
            expect(seshService.isCaretaker(sesh.seshId)).toBe(true);
        });
    });

    describe("isGuardian", ()=>{
        it("checks if the session is currently in the guardian state", ()=>{
            const sesh = seshService.create();
            expect(seshService.isGuardian(sesh.seshId)).toBe(true);
            seshService.switchState(sesh.seshId);
            expect(seshService.isGuardian(sesh.seshId)).toBe(false);
        });
    });

    describe("isLoggedIn", ()=>{
        it("checks if the session is logged in", ()=>{
            const sesh = seshService.create();
            expect(seshService.isLoggedin(sesh.seshId)).toBe(false);
            seshService.login(sesh.seshId, new User());
            expect(seshService.isLoggedin(sesh.seshId)).toBe(true);
        });
    });

    describe("login", ()=>{
        it("logs the sesh in", ()=>{
            //TODO this should be rethought
            //it needs to do more validation
            //to make sure the state was updated
            //correctly and that the user is in the allowed state
            let sesh = seshService.create();
            expect(seshService.getSeshInfo(sesh.seshId)).toBe(sesh);

            const user = new User();
            user.email = "email@gmail.com";
            user.activated = false;
            user._id = "id"

            let loggedin = seshService.login(sesh.seshId, user);
            expect(sesh.email).toBe("email@gmail.com");
            expect(sesh.userId).toBe("id");
            expect(seshService.getSeshInfo(sesh.seshId)).toBe(loggedin);
            expect(seshService.isLoggedin(sesh.seshId)).toBe(true);
            expect(seshService.isActivated(sesh.seshId)).toBe(false);
            expect(isId(sesh.token)).toBe(true);
        });
    });

    describe("logout", ()=>{
        it("removes the sesh. Generally used with logout", ()=>{
            let sesh = seshService.create();
            expect(seshService.getSeshInfo(sesh.seshId)).toBe(sesh);
            sesh = seshService.logout(sesh.seshId);
            expect(seshService.getSeshInfo(sesh.seshId)).toBe(undefined);
            expect(seshService.isLoggedin(sesh.userId)).toBe(false);
            expect(seshService.isActivated(sesh.userId)).toBe(false);
        });
    });

    describe("switch state", ()=>{
        it("registers the sesh which occurs when the user inputs validation code", ()=>{
            let sesh = seshService.create();
            let old = sesh.state;
            seshService.switchState(sesh.seshId);
            expect(old !== sesh.state).toBe(true);

            old = sesh.state;
            seshService.switchState(sesh.seshId);
            expect(old !== sesh.state).toBe(true);
        });
    });

    describe("validateSession", ()=>{
        it("makes sure that the autorization token is valid", ()=>{
            let sesh = seshService.create();
            seshService.login(sesh.seshId, new User());
            expect(seshService.validateSession(sesh.seshId, sesh.token)).toBe(true);
            expect(seshService.validateSession(sesh.seshId, "hamburger")).toBe(false);
        });
    });
});