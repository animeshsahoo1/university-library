import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import config  from "@/lib/config";

// Create an HTTP-based SQL client using Neon
// ✅ No persistent connection needed like pg.connect()
// ❗ This uses HTTPS under the hood — safe for serverless & edge
const sql = neon(config.env.databaseUrl);

// Initialize the Drizzle ORM with the HTTP SQL client
// ✅ This is your fully ready-to-use db instance
// ✅ No need for connectToDatabase(), pools, or lifecycle hooks
export const db = drizzle({ client: sql });


/*
!in projects where we used mongo or normal postgres, we had to connect to databse everytime we made a call
!to check for if a connection already exist and avoid multiple connections from same user.
!here we dont need to do that as neon statless server givs us a https endpoint where we can send all
!our request with help of drizzle, just like how in normal react fullstack project we deployed a backend and got its url.
*/
