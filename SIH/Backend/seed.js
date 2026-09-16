import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import serviceModel from "./src/models/service.model.js";

const services = [
  { name: "Tap & Pipe Leak Repair", category: "plumbing", description: "Fix leaking taps, pipes, and bathroom fittings.", startingPrice: 299 },
  { name: "Full Home Wiring Check", category: "electrical", description: "Switchboard, short-circuit fix, inverter repair.", startingPrice: 349 },
  { name: "Deep Home Cleaning", category: "cleaning", description: "Full apartment deep cleaning service.", startingPrice: 999 },
  { name: "Washing Machine Repair", category: "appliance", description: "Diagnose and repair washing machines and other appliances.", startingPrice: 399 },
  { name: "Custom Furniture Repair", category: "carpentry", description: "Furniture repair, fitting, and custom woodwork.", startingPrice: 499 },
  { name: "Interior Wall Painting", category: "painting", description: "Interior wall painting and touch-ups.", startingPrice: 1499 },
];

const run = async () => {
  await mongoose.connect(process.env.MONGO_DB_URI);
  console.log("Connected to MongoDB");

  for (const svc of services) {
    const exists = await serviceModel.findOne({ name: svc.name });
    if (!exists) {
      await serviceModel.create(svc);
      console.log(`Created: ${svc.name}`);
    } else {
      console.log(`Already exists: ${svc.name}`);
    }
  }

  await mongoose.disconnect();
  console.log("Done.");
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});