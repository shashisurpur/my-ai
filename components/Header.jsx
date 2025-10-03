import { assets } from '@/assets/assets'
import { useAppContext } from '@/context/AppContext';
import Image from 'next/image'
import React, { useEffect } from 'react'

const Header = ({ expand, setExpand }) => {

      const { freeRequests,user } = useAppContext();
    
     

    return (
        <div className="absolute px-4 top-6 flex items-center justify-between md:justify-center w-full">
            <div className="md:hidden">
                <Image
                    onClick={() => (expand ? setExpand(false) : setExpand(true))}
                    className="rotate-180"
                    alt=""
                    src={assets.menu_icon}
                />
            </div>

            <h2 className="text-lg font-semibold text-white">
                Ask anything 
                {!user  && <span>({freeRequests}/5)</span>}
                
            </h2>
            <div className="md:hidden ">
                <Image className=" opacity-70" alt="" src={assets.chat_icon} />
            </div>

        </div>
    )
}

export default Header
