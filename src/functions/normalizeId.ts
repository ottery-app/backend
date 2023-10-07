import mongoose from "mongoose";
import { id } from "@ottery/ottery-dto";

export function normalizeId(id: mongoose.Types.ObjectId | id) {
    return new mongoose.Types.ObjectId(id);
}