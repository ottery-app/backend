import mongoose from "mongoose";
import { id, noId } from "@ottery/ottery-dto";

export function normalizeId(id: mongoose.Types.ObjectId | id) {
    if (id === noId) {
        id = "000000000000000000000000";
    }
    
    return new mongoose.Types.ObjectId(id);
}