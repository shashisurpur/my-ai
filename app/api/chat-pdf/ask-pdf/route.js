import { NextResponse } from "next/server";
import { vectorstores } from "../pdf-upload/route";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import connectDB from "@/config/db";
import MongoosEmbedding from "@/models/Embeddings";

function cosineSimilarity(a, b) {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dot / (magA * magB);
}

export async function POST(req) {
    const { question } = await req.json();

    // if (!vectorstores) return NextResponse.json({ success: false, error: 'No Pdf data found.Upload first' }, { status: 400 });

    // const retreiver = vectorstores.asRetriever();

    // const relavantDocs = await retreiver.getRelevantDocuments(question);
    // const context = relavantDocs.map((doc) => doc.pageContent).join('\n\n');

    const embiddings = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY
    })
    const questionEmbedding = await embiddings.embedQuery(question);
    await connectDB();
    const allDocs = await MongoosEmbedding.find({});

    // Rank by similarity
    const docsWithScores = allDocs.map(doc => {
        return {
            ...doc._doc,
            score: cosineSimilarity(questionEmbedding, doc.embedding),
        };
    });

    // Top 3 similar chunks
    const topChunks = docsWithScores
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

    const context = topChunks.map(doc => doc.text).join('\n\n');

    const model = new ChatGoogleGenerativeAI({
        model: "gemini-2.5-flash",
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
        temperature: 0.4
    })

    const result = await model.invoke([
        { role: 'system', content: 'Use the provided context to answer the question' },
        { role: 'user', content: `Context: ${context}\n\nQuestion: ${question}` }
    ])

    return NextResponse.json({ success: true, data: result.content }, { status: 200 })
}