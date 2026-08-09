import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL || "";

export const sql = databaseUrl
  ? neon(databaseUrl)
  : (() => {
      const dummy = async () => [];
      return dummy;
    })() as any;


