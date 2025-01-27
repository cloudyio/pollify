import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGO_URI as string;
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

export async function POST(request: Request) {
    const { pollID, optionID } = await request.json();

    if (!pollID || !optionID) {
        return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400 });
    }

    const poll = await client.db("polly").collection("polls").findOne({ _id: pollID });

    if (!poll) {
        return new Response(JSON.stringify({ error: "Poll not found" }), { status: 404 });
    }

    const updateResult = await client.db("polly").collection("polls").updateOne(
        { _id: pollID, [`options.${optionID}`]: { $exists: true } },
        { $inc: { [`options.${optionID}.votes`]: 1 } }
    );

    if (updateResult.modifiedCount === 0) {
        return new Response(JSON.stringify({ error: "Failed to update vote" }), { status: 500 });
    }

    return new Response(JSON.stringify({ message: "Vote updated successfully" }), { status: 200 });
}
