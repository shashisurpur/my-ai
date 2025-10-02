import { assets } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import { set } from "mongoose";
import Image from "next/image";
import React, { useState } from "react";
import toast from "react-hot-toast";

const PromptBox = ({ loading, setLoading }) => {
  const [prompt, setPrompt] = useState("");

  const { user, chats, setChats, activeChat, setActiveChat } = useAppContext();

  const handleSubmit = async(e) => {
    e.preventDefault();
    const trimmedPrompt = prompt.trim();
    if (!user) return toast.error("Please sign in to continue");
    if (loading) return toast.error("Please wait for the current response");
    if (!trimmedPrompt) return toast.error("Please enter a valid prompt");
    setPrompt("");
    setLoading(true);
    try {
      // Call the API or perform the action
      const userPrompt = {
        role: "user",
        content: trimmedPrompt,
        timeStamp: Date.now(),
      }

      setChats((prev) => prev.map((chat) => (chat._id === activeChat._id ? { ...chat, messages: [...chat.messages, userPrompt] } : chat)))

      setActiveChat((prev) => ({ ...prev, messages: [...prev.messages, userPrompt] }))


      const {data} = await axios.post('/api/chat/ai', {
        chatId: activeChat._id,
        prompt: trimmedPrompt,
      })

      if (data.success) {
        setChats((prev) => prev.map((chat) => (chat._id === activeChat._id ? { ...chat, messages: [...chat.messages, data.message] } : chat)))
        //display the AI message in typing animation
        const message = data.data.content;
        const messageTokens = message.split(' ')
        let assistantMessage = {
          role: "assistant",
          content: "",
          timeStamp: Date.now(),
        }

        setActiveChat((prev) => ({ ...prev, messages: [...prev.messages, assistantMessage] }))

        for (let i = 0; i < messageTokens.length; i++) {
          setTimeout(() => {
            assistantMessage.content = messageTokens.slice(0, i + 1).join(' ');
            setActiveChat((prev) => {
              const updatedMessages = [
                ...prev.messages.slice(0, -1),
                assistantMessage,
              ];
              return { ...prev, messages: updatedMessages };
            })
          }, i * 100);
        }

      }else{
        toast.error(data.message || "Failed to fetch response");
        setPrompt(trimmedPrompt);
      }
    } catch (error) {
      toast.error(error.message || "Failed to fetch response");
      setPrompt(trimmedPrompt);
    }finally {
      setLoading(false);
    }
  }

  return (
    <form
      className={`w-full ${activeChat?.messages.length > 0 ? "max-w-3xl" : "max-w-2xl"
        } bg-[#404045] p-4 rounded-3xl mt-4 transition-all`}
      onSubmit={handleSubmit}
    >
      <textarea
        className="outline-none w-full resize-none overflow-hidden break-words bg-transparent"
        rows={2}
        placeholder="Message DeepSeek"
        required
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <p className="flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition">
            <Image className="h-5" src={assets.deepthink_icon} alt="" />
            DeepThink (R1)
          </p>
          <p className="flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition">
            <Image className="h-5" src={assets.search_icon} alt="" />
            Search (R1)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Image className="w-4 cursor-pointer" src={assets.pin_icon} alt="" />
          <button
            className={`${prompt ? "bg-primary" : "bg-[#71717a]"
              } rounded-full p-2 cursor-pointer`}
          >
            <Image
              className="w-3.5 aspect-square"
              src={prompt ? assets.arrow_icon : assets.arrow_icon_dull}
              alt=""
            />
          </button>
        </div>
      </div>
    </form>
  );
};

export default PromptBox;
