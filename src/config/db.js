import dotenv from "dotenv";
import { MongoClient, GridFSBucket } from "mongodb";

dotenv.config();

const uri = process.env.DATABASE_URL;
const client = new MongoClient(uri);

export const connectDataBase = async () => {
  try {
    console.log("Conectando ao banco de dados...");
    console.log("URI:", uri);
    console.log("Client:", client);
    await client.connect();
  } catch (error) {
    console.error("erro:", error);
    process.exit(1);
  }
};

export const getDataBase = () => client.db("Lists");

export const getGridFSBucket = () => {
  return new GridFSBucket(getDataBase(), { bucketName: "uploads" });
};
