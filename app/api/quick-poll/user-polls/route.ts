import { auth } from "./../../../../auth"
import { MongoClient, ServerApiVersion } from "mongodb"

const uri = process.env.MONGO_URI as string;
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const imageUrl = session?.user?.image;
  let userId = null;
  if (imageUrl) {
    const urlParts = imageUrl.split('/');
    userId = urlParts[urlParts.length - 1].split('?')[0];
  }

  if (!userId) {
    return new Response(JSON.stringify({ error: "User ID not found" }), { status: 400 });
  }

  const polls = await client.db("polly").collection("polls").find({ createdBy: userId }).toArray();

  return new Response(JSON.stringify({ polls }), { status: 200 });
}
