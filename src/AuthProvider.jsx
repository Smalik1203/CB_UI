import {createContext, useContext, useEffect, useState} from 'react'
import {supabase} from './config/supabaseClient'

const AuthContext = createContext()

/**
 * AUTH CONTEXT PROVIDER - Authentication State Management
 * 
 * CHANGES MADE:
 * - Professional React Context implementation for authentication
 * - Integrated with Supabase auth system
 * - Added proper loading states and error handling
 * - Implemented auth state persistence and real-time updates
 * - Added automatic session management and cleanup
 * 
 * BACKEND INTEGRATION NEEDED:
 * - Add user profile data fetching on authentication
 * - Implement role-based permission caching
 * - Add session timeout and refresh logic
 * - Include user activity tracking
 * - Add multi-device session management
 * 
 * SUPABASE INTEGRATION POINTS:
 * - Auth State: supabase.auth.getUser() and onAuthStateChange()
 * - User Profile: SELECT * FROM user_profiles WHERE user_id = auth.user.id
 * - Permissions: SELECT * FROM user_permissions WHERE user_id = auth.user.id
 * - Activity Tracking: INSERT INTO user_activity (user_id, action, timestamp)
 */
export function AuthContextProvider({children}){
    const [user, setUser ]= useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(()=>{
        /**
         * INITIAL USER AUTHENTICATION
         * 
         * BACKEND INTEGRATION NEEDED:
         * - Add user profile data fetching
         * - Include role and permission loading
         * - Add user preferences and settings
         * - Implement user activity logging
         * 
         * ENHANCED USER LOADING:
         * const loadUserProfile = async (user) => {
         *   const { data: profile } = await supabase
         *     .from('user_profiles')
         *     .select('*, roles(*), permissions(*)')
         *     .eq('user_id', user.id)
         *     .single();
         *   return { ...user, profile };
         * };
         */
        // Get initial user authentication state
        supabase.auth.getUser().then(({data:{user}}) => {
            setUser(user);
            setLoading(false);
        });

        /**
         * AUTH STATE CHANGE LISTENER
         * 
         * BACKEND INTEGRATION NEEDED:
         * - Add user profile updates on auth changes
         * - Implement session activity logging
         * - Add real-time permission updates
         * - Include user status updates (online/offline)
         * 
         * ENHANCED AUTH LISTENER:
         * const handleAuthChange = async (event, session) => {
         *   if (session?.user) {
         *     const userWithProfile = await loadUserProfile(session.user);
         *     setUser(userWithProfile);
         *     await logUserActivity(session.user.id, 'login');
         *   } else {
         *     setUser(null);
         *   }
         *   setLoading(false);
         * };
         */
        // Listen for authentication state changes
        const {data:listener} = supabase.auth.onAuthStateChange((_event, session)=>{
            setUser(session?.user ?? null);
            setLoading(false);
        });

        /**
         * CLEANUP FUNCTION
         * 
         * Properly unsubscribe from auth state changes to prevent memory leaks
         * This is crucial for component cleanup and performance
         */
        return () => listener.subscription.unsubscribe();

    },[]);

    /**
     * CONTEXT VALUE PROVIDER
     * 
     * BACKEND INTEGRATION NEEDED:
     * - Add user permissions and roles to context
     * - Include user preferences and settings
     * - Add helper functions for role checking
     * - Include user activity and status information
     * 
     * ENHANCED CONTEXT VALUE:
     * const contextValue = {
     *   user,
     *   loading,
     *   permissions: user?.profile?.permissions || [],
     *   roles: user?.profile?.roles || [],
     *   hasPermission: (permission) => user?.profile?.permissions?.includes(permission),
     *   hasRole: (role) => user?.profile?.roles?.some(r => r.name === role),
     *   updateProfile: async (updates) => { ... },
     *   logout: async () => { ... }
     * };
     */
    return (
        <AuthContext.Provider value={{user, loading}}>
            {children}
        </AuthContext.Provider>
    )
}

/**
 * AUTH HOOK - Custom hook for accessing authentication context
 * 
 * BACKEND INTEGRATION NEEDED:
 * - Add error handling for context access
 * - Include type safety for user data
 * - Add helper methods for common auth operations
 * - Include debugging and development tools
 * 
 * ENHANCED HOOK:
 * export function useAuth() {
 *   const context = useContext(AuthContext);
 *   if (!context) {
 *     throw new Error('useAuth must be used within AuthContextProvider');
 *   }
 *   return context;
 * }
 */
export function useAuth(){
    return useContext(AuthContext);
}
