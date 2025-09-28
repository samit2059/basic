'use client';
import {useState} from 'react'
import {loginUser, AuthError} from '@/lib/auth';
import {useRouter }from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
export default function LoginForm() {
    const router = useRouter();
     const { setAuthData } = useAuth(); 
    const [email, setEmail] = useState('');
    const[password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit  = async(e:React.FormEvent) =>{
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try{
            // api to backend for login wla
            const response = await loginUser({email, password});
            setAuthData(response);
            alert('Login successful!');
            // router.push('/');
        }
        catch(error){
            const authError = error as AuthError;
            setError(authError.message);
        }
        finally{
            setIsLoading(false);
        }
    }

    return (
         <form onSubmit={handleSubmit} className="p-8 border rounded-lg shadow-xl bg-white space-y-6 max-w-md mx-auto">
      <h2 className="text-3xl font-extrabold text-center text-blue-600">Sign In</h2>
      
      {/* Email Input */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="user@example.com"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Password Input */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Error Message */}
      {error && <p className="text-red-600 text-sm font-medium text-center">{error}</p>}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        {isLoading ? 'Processing...' : 'Log In'}
      </button>
    </form>
    )
}