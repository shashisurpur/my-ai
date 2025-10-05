import { NextResponse } from "next/server";
import { Document } from 'langchain/document';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import connectDB from "@/config/db";
import MongoosEmbedding from "@/models/Embeddings";

let vectorstores = null

export async function POST(req) {
    const formdata = await req.formData();

    const file = formdata.get('file');

    if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const blob = new Blob([buffer], { type: file.type || 'application/pdf' })
    const loader = new PDFLoader(blob);
    const doc = await loader.load()

    //split into chunks
    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 500, chunkOverlap: 50 });
    const splitDocs = await splitter.splitDocuments(doc);

    if (!Array.isArray(splitDocs)) {
        console.error('splitDocs is not an array:', splitDocs);
        return NextResponse.json({ error: 'Unexpected document format' }, { status: 500 });
    }

    //Generate embeddings using gemini
    const embiddings = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY
    })

    // vectorstores = await MemoryVectorStore.fromDocuments(docs, embiddings)
    await connectDB();
    const embeddingArray =[]

    for (const doc of splitDocs) {
        const vector = await embiddings.embedQuery(doc.pageContent);
        embeddingArray.push({
            text: doc.pageContent,
            embedding: vector,
        })
        // await MongoosEmbedding.create({
        //     text: doc.pageContent,
        //     embedding: vector,
        // });
    }


    return NextResponse.json({ success: true, message: "PDF processed and stored in memory" }, { status: 200 })
}

export { vectorstores }