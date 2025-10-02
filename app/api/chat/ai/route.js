
const MAX_TOKENS_LIMT = 5;
export const MAX_DURATION = 60; //seconds
import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY);

export async function POST(req) {
    try {
        const { userId } = getAuth(req)
        const { chatId, prompt } = await req.json();
        if (!userId) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }

        //connect to db
        await connectDB();
        const chats = await Chat.findOne({ _id: chatId, userId });

        const userPrompt = {
            role: "user",
            content: prompt,
            timestamp: Date.now(),
        }
        chats.messages.push(userPrompt);

        //call to gemini api
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Explain how AI works in a few words",
            config: {
                thinkingConfig: {
                    thinkingBudget: 0, // Disables thinking
                },
            }
        });
        console.log(response.text);

        //push response to messages
        const aiResponse = {
            role: "assistant",
            content: response.text,
            timestamp: Date.now(),
        };
        chats.messages.push(aiResponse);

        //save response to db
        chats.save();

        return NextResponse.json({ success: true, data: "send ai response" }, { status: 200 })
    } catch (err) {
        console.error(err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 })
    }
}