export const dynamic = 'force-static'
import { MongoClient, ServerApiVersion } from "mongodb"

interface Poll {
  _id: string;
  adminId: string;
  title: string;
  options: Array<{ id: string; text: string }>;
}

interface Vote {
  _id: string;
  pollID: string;
  optionID: string;
}

interface VoteCounts {
  [key: string]: number;
}

const uri = process.env.MONGO_URI as string;
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

export async function POST(request: Request) {
  const { pollID, adminID } = await request.json();

  if (!pollID) {
    return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400 });
  }

  const poll = await client.db("polly").collection<Poll>("polls").findOne({ _id: pollID });

  if (!poll) {
    return new Response(JSON.stringify({ error: "Poll not found" }), { status: 404 });
  }

  if (adminID && poll.adminId !== adminID) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const results = await client.db("polly").collection<Vote>("votes").find({ pollID }).toArray();
  const voteCounts: VoteCounts = results.reduce((acc, vote) => {
    acc[vote.optionID] = (acc[vote.optionID] || 0) + 1;
    return acc;
  }, {} as VoteCounts);

  const { adminId, ...pollData } = poll;

  return new Response(JSON.stringify({ poll: { ...pollData, results: voteCounts } }), { status: 200 });
}