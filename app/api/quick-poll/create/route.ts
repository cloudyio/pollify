export const dynamic = 'force-static'
import { auth } from "./../../../../auth"
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb"

const uri = process.env.MONGO_URI as string;
const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });

function generateRandomId(length: number) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

async function generateUniquePollId() {
  let pollId;
  let exists = true;
  while (exists) {
    pollId = generateRandomId(5);
    const poll = await client.db("polly").collection("polls").findOne({ _id: new ObjectId(pollId) });
    if (!poll) {
      exists = false;
    }
  }
  return pollId;
}

export async function POST(request: Request) {
  let id = null
  const session = await auth()
  const { description, options, duration } = await request.json();

  if (session) {
    id = session?.user?.id
  }

  if (!description || !Array.isArray(options) || options.length === 0 || !duration) {
    return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400 });
  }

  const formattedOptions = options.reduce((acc, option, index) => {
    acc[`${index + 1}`] = { text: option, votes: 0 }
    return acc
  }, {})

  const pollId = await generateUniquePollId();
  const adminId = generateRandomId(8);
  const expirationDate = new Date(Date.now() + duration);

  await client.db("polly").collection("polls").insertOne({ 
    _id: new ObjectId(pollId), 
    description, 
    options: formattedOptions, 
    createdBy: id, 
    expiresAt: expirationDate, 
    adminId 
  });

  return new Response(JSON.stringify({ message: "Poll created successfully", pollId, adminId }), { status: 201 });
}