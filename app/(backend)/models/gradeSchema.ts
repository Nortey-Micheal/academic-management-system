import mongoose, { models } from "mongoose";

const { ObjectId } = mongoose.Types

const GradeSchema = new mongoose.Schema({
    studentId: { 
        type: ObjectId, 
        ref: "Student", 
        required: true 
    },
    assessmentId: { 
        type: ObjectId, 
        ref: "Assessment", 
        required: true 
    },
    score: { 
        type: Number, 
        required: true 
    },
    grade: { 
        type: String 
    },        // e.g. A, B, C
    remarks: String
}, { timestamps: true });

const Grade = models.Grade || mongoose.model('Grade',GradeSchema)

export default Grade