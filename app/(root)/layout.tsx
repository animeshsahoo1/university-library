import { authOptions } from '@/auth';
import Header from '@/components/Header'
import { redirect } from 'next/navigation';
import React, { ReactNode } from 'react'
import { auth } from '../api/auth/[...nextauth]/route';

const layout = async({children} : {children: ReactNode}) => {
  const session= await auth();
    console.log("session: ", session);
    if(!session){
      redirect("/sign-in");
    }
  return (
    <main className="root-container">
      <div className="mx-auto max-w-7xl">
        <Header/>

        <div className="mt-20 pb-20">{children}</div>
      </div>
    </main>
  )
}

export default layout
