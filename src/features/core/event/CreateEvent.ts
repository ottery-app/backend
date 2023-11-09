import { CreateEventDto, id } from "@ottery/ottery-dto"

export interface CreateEvent extends CreateEventDto {
    leadManager: id,
}