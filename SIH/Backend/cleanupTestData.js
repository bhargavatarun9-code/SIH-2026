import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import userModel from "./src/models/user.model.js";
import professionalProfileModel from "./src/models/professionalProfile.model.js";

const run = async () => {
  await mongoose.connect(process.env.MONGO_DB_URI);
  console.log("Connected to MongoDB");

  const testUsers = await userModel.find({ name: /slave/i });
  console.log(`Found ${testUsers.length} test user(s) named "slave"`);

  for (const user of testUsers) {
    const profile = await professionalProfileModel.findOneAndDelete({ user: user._id });
    if (profile) console.log(`Deleted profile for: ${user.name} (${user.email})`);
    await userModel.findByIdAndDelete(user._id);
    console.log(`Deleted user: ${user.name} (${user.email})`);
  }

  await mongoose.disconnect();
  console.log("Done.");
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});