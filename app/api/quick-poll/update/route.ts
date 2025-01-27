import { MongoClient, ServerApiVersion } from "mongodb";
import { auth } from "./../../../../auth";

const uri = process.env.MONGO_URI as string;
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

export async function POST(request: Request) {
  const session = await auth();
  const { pollID, description, options, duration } = await request.json();

  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  if (!pollID || !description || !Array.isArray(options) || options.length === 0 || !duration) {
    return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400 });
  }

  const formattedOptions = options.reduce((acc, option, index) => {
    acc[`${index + 1}`] = { text: option, votes: 0 };
    return acc;
  }, {});

  const expirationDate = new Date(Date.now() + duration);

  const result = await client.db("polly").collection("polls").updateOne(
    { _id: pollID },
    {
      $set: {
        description,
        options: formattedOptions,
        expiresAt: expirationDate,
      },
    }
  );

  if (result.modifiedCount === 0) {
    return new Response(JSON.stringify({ error: "Poll not found or no changes made" }), { status: 404 });
  }

  const updatedPoll = await client.db("polly").collection("polls").findOne({ _id: pollID });

  return new Response(JSON.stringify({ message: "Poll updated successfully", poll: updatedPoll }), { status: 200 });
}
