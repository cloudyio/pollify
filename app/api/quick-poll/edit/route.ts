import { MongoClient, ServerApiVersion } from "mongodb"

const uri = process.env.MONGO_URI as string;
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

export async function POST(request: Request) {
  const { pollID, adminID, description, options } = await request.json();

  if (!pollID || !adminID || !description || !Array.isArray(options) || options.length === 0) {
    return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400 });
  }

  const poll = await client.db("polly").collection("polls").findOne({ _id: pollID });

  if (!poll) {
    return new Response(JSON.stringify({ error: "Poll not found" }), { status: 404 });
  }

  if (poll.adminId !== adminID) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const formattedOptions = options.reduce((acc, option, index) => {
    acc[`${index + 1}`] = { text: option, votes: 0 }
    return acc
  }, {})

  const result = await client.db("polly").collection("polls").updateOne(
    { _id: pollID, adminId: adminID },
    { $set: { description, options: formattedOptions } }
  );

  if (result.modifiedCount === 0) {
    return new Response(JSON.stringify({ error: "Failed to update poll" }), { status: 500 });
  }

  return new Response(JSON.stringify({ message: "Poll updated successfully" }), { status: 200 });
}
