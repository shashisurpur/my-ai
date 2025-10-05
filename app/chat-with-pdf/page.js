"use client"
import React, { useState } from 'react'

const ChatWithPdf = () => {

    const [file, setFile] = useState(null);
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(false);

    const uploadPDF = async () => {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/chat-pdf/pdf-upload', {
            method: 'POST',
            body: formData,
        });

        const data = await res.json();
        console.log(data, 'datta')
        // if(data.success){
        //     alert(data.message)
        // }
        // alert(data.message);
    };

    const askQuestion = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/chat-pdf/ask-pdf', {
                method: 'POST',
                body: JSON.stringify({ question }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await res.json();
            console.log(data, 'answer')
            if (data.success) {
                setAnswer(data.data);
            } else {
                alert(data.error)
            }
            // setAnswer(data.answer);
            // setLoading(false);
        } catch (error) {
            console.log(error)
            alert(error)
        } finally {
            setLoading(false)
        }

    };


    return (
        <main className="p-6 max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">RAG PDF Chat (Gemini)</h1>

            <input type="file" onChange={e => setFile(e.target.files[0])} />
            <button onClick={uploadPDF} className="bg-blue-500 text-white px-4 py-2 mt-2">
                Upload PDF
            </button>

            <div className="mt-6">
                <input
                    type="text"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    placeholder="Ask a question"
                    className="border p-2 w-full"
                />
                <button onClick={askQuestion} className="bg-green-500 text-white px-4 py-2 mt-2">
                    {loading ? 'Thinking...' : 'Ask'}
                </button>
            </div>

            {answer && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                    <strong>Answer:</strong>
                    <p>{answer}</p>
                </div>
            )}
        </main>
    );

}

export default ChatWithPdf
