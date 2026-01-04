import mongoose from "mongoose";
import { models } from "mongoose";

const { ObjectId } = mongoose.Types

const ClassSchema = new mongoose.Schema({
    className: { 
        type: String, 
        required: true 
    },   // e.g. JHS 2A
    level: { 
        type: String, 
        required: true 
    },       // e.g. JHS 2
    classTeacherId: { 
        type: ObjectId, 
        ref: "User" 
    },
    academicYear: { 
        type: String, 
        required: true 
    }
}, { timestamps: true });

const ClassRoom =  models.classroom || mongoose.model('Classroom',ClassSchema)

export default ClassRoom