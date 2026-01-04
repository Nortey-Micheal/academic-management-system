import mongoose, { models } from "mongoose";

const { ObjectId } = mongoose.Types

const StudentSchema = new mongoose.Schema({
    studentId: { 
        type: String, 
        unique: true, 
        required: true 
    },
    firstName: { 
        type: String, 
        required: true 
    },
    lastName: { 
        type: String, 
        required: true 
    },
    gender: { 
        type: String, 
        enum: ["Male", "Female"], 
        required: true 
    },
    dateOfBirth: { 
        type: Date, 
        required: true 
    },
    classId: { 
        type: ObjectId, 
        ref: "Class", 
        required: true 
    },
    guardianName: String,
    guardianPhone: String,
    status: { 
        type: String, 
        enum: ["Active", "Inactive"], 
        default: "Active" 
    }
}, { timestamps: true });

const Student = models.Student || mongoose.model('Student',StudentSchema)

export default Student