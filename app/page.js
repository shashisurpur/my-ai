"use client";

import { assets } from "@/assets/assets";
import Message from "@/components/Message";
import PromptBox from "@/components/PromptBox";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [expand, setExpand] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar expand={expand} setExpand={setExpand} />
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8 bg-[#292a2d] text-white relative">
        <div className="md:hidden absolute px-4 top-6 flex items-center justify-between w-full">
          <Image
            onClick={() => (expand ? setExpand(false) : setExpand(true))}
            className="rotate-180"
            alt=""
            src={assets.menu_icon}
          />
          <Image className=" opacity-70" alt="" src={assets.chat_icon} />
        </div>
        {messages.length !== 0 ? (
          <>
            <div className="flex items-center gap-3">
              <Image src={assets.logo_icon} alt="" className="h-16" />
              <p className="text-2xl font-medium">Hi I am DeepSeek</p>
            </div>
            <p className="text-sm mt-2">How can I help you?</p>
          </>
        ) : (
          <div>
            <Message role={"ai"} content={"what is js"} />
          </div>
        )}

        {/* Prompt Box */}
        <PromptBox loading={loading} setLoading={setLoading} />
        <p className="text-xs bottom-1 absolute text-gray-500">
          AI-generated, for reference only
        </p>
      </div>
    </div>
  );
}
