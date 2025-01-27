export const dynamic = 'force-static'
import { auth } from "./../../../../auth"
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb"

const uri = process.env.MONGO_URI as string;
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

export async function POST(request: Request) {
  const { pollID } = await request.json();

  if (!pollID) {
    return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400 });
  }

  const poll = await client.db("polly").collection("polls").findOne({ _id: pollID });

  if (!poll) {
    return new Response(JSON.stringify({ error: "Poll not found" }), { status: 404 });
  }

  return new Response(JSON.stringify({ poll }), { status: 200 });
}