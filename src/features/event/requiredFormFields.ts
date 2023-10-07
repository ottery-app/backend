import { CustomFormFieldDto, classifyDto } from "@ottery/ottery-dto";
import { inputType } from "@ottery/ottery-dto/lib/types/input/input.enums";

const PFP = new CustomFormFieldDto();
PFP.label = "profile picture";
PFP.note = "This photo is required for security purposes",
PFP.optional = false;
PFP.permanent = true;
PFP.type = inputType.PICTURE;

const EMERGENCY_CONTACT = new CustomFormFieldDto();
EMERGENCY_CONTACT.label = "emergency contact",
EMERGENCY_CONTACT.note = "Who should be called in case of emergency",
EMERGENCY_CONTACT.optional = false;
EMERGENCY_CONTACT.permanent = true;
EMERGENCY_CONTACT.type = inputType.PHONE;

export const VOLENTEER_REQUIRED = [
    PFP,
    EMERGENCY_CONTACT,
];

export const ATTENDEE_REQUIRED = [
    PFP,
    EMERGENCY_CONTACT,
];
//incase things change I want to catch it on server start
//classifyDto(PFP, {throw: true});