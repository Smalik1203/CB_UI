import {createContext, useContext, useEffect, useState} from 'react'
import {supabase} from './config/supabaseClient'

const AuthContext = createContext()
export function AuthContextProvider({children}){
    const [user, setUser ]= useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(()=>{
        supabase.auth.getUser().then(({data:{user}}) => {
            setUser(user);
            setLoading(false);
        });
  // Listen for authentication state changes, we use onAuthStateChange to listen for changes in the authentication state which is a hook that listens for changes in the authentication state which means that when the user is logged in or logged out, the user state will be updated and the loading state will be set to false  
        const {data:listener} = supabase.auth.onAuthStateChange((_event, session)=>{
            setUser(session?.user ?? null);
            setLoading(false);
        });
        // here we are 
        return () => listener.subscription.unsubscribe();

    },[]);

     return (
        <AuthContext.Provider value={{user, loading}}>
            {children}
        </AuthContext.Provider>
    )
}
export function useAuth(){
    return useContext(AuthContext);
}
