'use client';
import {useState} from 'react'
import {registerUser, AuthError} from '@/lib/auth';
import {useRouter }from 'next/navigation';
// import {login} from '@/context/AuthContext';
const RegisterForm = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const[password, setPassword] = useState('');
    const[username, setUserName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async(e:React.FormEvent) =>{
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try{
            // api calling
            const response = await registerUser({username, email, password});

            // on success
            alert('Registration successful! Please log in.');
            router.push('/login/main');
        } catch (error) {
            const authError = error as AuthError;
            setError(authError.message);
        }
        finally{
            setIsLoading(false);
        }
    }
  return (
    <form onSubmit={handleSubmit} className="p-8 border rounded-lg shadow-xl bg-white space-y-6 max-w-md mx-auto">
      <h2 className="text-3xl font-extrabold text-center text-green-600">Create Account</h2>
      {/* UserName Input */}
    <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
        <input
          id="username"
          type="username"
          value={username}
          onChange={(e) => setUserName(e.target.value)}
          required
          placeholder="John Doe"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
        />
      </div>

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
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
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
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
        />
      </div>

      {/* Error Message */}
      {error && <p className="text-red-600 text-sm font-medium text-center">{error}</p>}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
      >
        {isLoading ? 'Creating Account...' : 'Register'}
      </button>
    </form>
  )
}

export default RegisterForm
