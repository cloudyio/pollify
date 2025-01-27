import { MongoClient, ServerApiVersion } from "mongodb"

const uri = process.env.MONGO_URI as string;
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

export async function POST(request: Request) {
  const { pollID, adminID } = await request.json();

  if (!pollID || !adminID) {
    return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400 });
  }

  const result = await client.db("polly").collection("polls").deleteOne({ _id: pollID, adminId: adminID });

  if (result.deletedCount === 0) {
    return new Response(JSON.stringify({ error: "Poll not found or unauthorized" }), { status: 404 });
  }

  return new Response(JSON.stringify({ message: "Poll deleted successfully" }), { status: 200 });
}
