import { MongoClient, ServerApiVersion } from "mongodb"

const uri = process.env.MONGO_URI as string;
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

export async function POST(request: Request) {
  const { pollID, adminID, options } = await request.json();

  if (!pollID || !adminID || !Array.isArray(options) || options.length === 0) {
    return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400 });
  }

  const formattedOptions = options.reduce((acc, option, index) => {
    acc[`${index + 1}`] = { text: option, votes: 0 }
    return acc
  }, {})

  const result = await client.db("polly").collection("polls").updateOne(
    { _id: pollID, adminId: adminID },
    { $set: { options: formattedOptions } }
  );

  if (result.modifiedCount === 0) {
    return new Response(JSON.stringify({ error: "Poll not found or unauthorized" }), { status: 404 });
  }

  return new Response(JSON.stringify({ message: "Poll options updated successfully" }), { status: 200 });
}
