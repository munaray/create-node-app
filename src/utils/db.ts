import fs from "fs";

export const mongoDBConfig = (useTypescript: boolean) => {
  fs.writeFileSync(
    useTypescript ? "src/utils/db.ts" : "src/utils/db.js",
    `
import mongoose from "mongoose";
import "dotenv/config";

const dbUrl: string = process.env.MONGODB_URL || "";

const connectDB = async () => {
  try {
    await mongoose.connect(dbUrl).then((data) => {
      console.log(\`Database connected to \${data.connection.host}\`);
      });
  } catch (error: any) {
    console.log(error.message);
    setTimeout(connectDB, 5000);
  }
};

export default connectDB;
`
  );
};
