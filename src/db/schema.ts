import mongoose, { InferSchemaType } from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
    id: String,
    username: String,
    data: Object,
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;

export type UserType = InferSchemaType<typeof userSchema>;
