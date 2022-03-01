import { getSession } from "next-auth/react"
import { useEffect, useState } from "react"

export default function Home() {
  const [userSession, setSession] = useState({"loading": true})

  useEffect(() => {
    
    const session = async () =>{
      return await getSession()
    }
    session().then(sessionUser => {
      if(userSession.loading){
        setSession(sessionUser?.user)
      }
    })

  }, [userSession])



  return (
    <div className="container flex items-center p-4 mx-auto min-h-screen justify-center">
      <main>
        <h1>Welcome home {userSession?.first_name}</h1>
        <h1>{process.env.NEXT_PUBLIC_API_URL}</h1>
        <h1 className="font-mono text-xl code">
          Welcome to <span className="text-purple-700">Nextjs</span>, <span className="text-indigo-700">TailwindCSS</span> and <span className="text-gray-700">TypeScript</span>
        </h1>
      </main>
    </div>
  )
}
