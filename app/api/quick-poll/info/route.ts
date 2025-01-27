export const dynamic = 'force-static'
import { MongoClient, ServerApiVersion } from "mongodb"

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

  const results = await client.db("polly").collection("votes").find({ pollID }).toArray();
  const voteCounts = results.reduce((acc, vote) => {
    acc[vote.optionID] = (acc[vote.optionID] || 0) + 1;
    return acc;
  }, {});

  const { adminId, ...pollData } = poll; // Remove adminId from the poll data

  return new Response(JSON.stringify({ poll: { ...pollData, results: voteCounts } }), { status: 200 });
}