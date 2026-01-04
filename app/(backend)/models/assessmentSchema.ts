import mongoose, { models } from "mongoose";

const { ObjectId } = mongoose.Types

const AssessmentSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    }, // e.g. Mid-Term Test
    subject: { 
        type: String, 
        required: true 
    },
    classId: { 
        type: ObjectId, 
        ref: "Class", 
        required: true 
    },
    type: {
        type: String,
        enum: ["Quiz", "Assignment", "Test", "Exam"],
        required: true
    },
    totalMarks: { 
        type: Number, 
        required: true 
    },
    date: { 
        type: Date, 
        required: true 
    }
}, { timestamps: true });

const Assessment = models.assessment || mongoose.model('Assessment', AssessmentSchema)

export default Assessment