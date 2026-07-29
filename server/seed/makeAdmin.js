import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const email = process.argv[2];

if (!email) {
  console.log("Usage: npm run seed:admin -- youremail@example.com");
  process.exit(1);
}

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOneAndUpdate({ email }, { role: "admin" }, { new: true });
  if (!user) {
    console.log(`No user found with email: ${email}`);
  } else {
    console.log(`${user.name} (${user.email}) is now an admin.`);
  }
  await mongoose.disconnect();
  process.exit(0);
};

run();
