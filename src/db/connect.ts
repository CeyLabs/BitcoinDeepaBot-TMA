import mongoose from "mongoose";

const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
    } catch (e) {
        throw new Error(`Error connecting to database: ${e}`);
    }
};

export default connect;
