import mongoose, { models } from "mongoose";

const { ObjectId } = mongoose.Types

const AttendanceSchema = new mongoose.Schema({
    studentId: { 
        type: ObjectId, 
        ref: "Student", 
        required: true 
    },
    classId: { 
        type: ObjectId, 
        ref: "Class", 
        required: true 
    },
    date: { 
        type: Date, 
        required: true 
    },
    status: {
        type: String,
        enum: ["Present", "Absent", "Late"],
        required: true
    },
    recordedBy: { 
        type: ObjectId, 
        ref: "User" 
    }
}, { timestamps: true });

const Attendance = models.Attendance || mongoose.model('Attendance', AttendanceSchema)

export default Attendance