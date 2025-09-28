import { jwtDecode } from 'jwt-decode';
import axios, {AxiosError} from "axios";

const TOKEN_KEY = 'blog_auth_token';

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const isTokenValid = (token: string): boolean => {
  try {
    const decoded: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    return false;
  }
};

export const isAuthenticated = (): boolean => {
  const token = getToken();
  return token !== null && isTokenValid(token);
};

export const getAuthHeaders = (): { Authorization?: string } => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// define the shape for login and regiser
export type UserCredentials = {
  email: string;
  password:string;
  username:string;
}

// for success response
export type AuthResponse = {
  token:string;
  user:{
    id:string;
    email:string;
    username:string;
  }
}

// for error
export type AuthError = {
  message:string;
  statusCode:number;
};

export type BackendErrorResponse ={
  message:string;
}

// 1/ regristration function
export async function registerUser(
  credentials: UserCredentials,
):Promise<AuthResponse>{
  try{
  const response = await axios.post<AuthResponse>("https://egov-backend.vercel.app/api/users/register",credentials
    // {
    // method:'POST',
    // headers:{
    //   'Content-Type':'application/json',
    // },
    // body:JSON.stringify(credentials),
  // }
);

//   const data = await response.json();

//   if(!response.ok){
//     throw{
//       message: data.message || 'regristration failed',
//       statusCode: response.status,
//     } as AuthError;
//   }

//   return data as AuthResponse;
// }
return response.data;
}
catch(error){
    if(axios.isAxiosError(error)){
      const AxiosError = error as AxiosError<BackendErrorResponse>;

      const backendMessage = AxiosError.response?.data?.message || 'Registeration failed'

      throw new Error(backendMessage);
    }
    throw new Error('An unknown error occured');
  }
}
// 1/ Login function
// export async function loginUser(
//   credentials: UserCredentials,
// ):Promise<AuthResponse>{
//   const response = await fetch("login",{
//     method:'POST',
//     headers:{
//       'Content-Type':'application/json',
//     },
//     body:JSON.stringify(credentials),
//   });

//   const data = await response.json();

//   if(!response.ok){
//     throw{
//       message: data.message || 'login failed. Checkout email and password',
//       statusCode: response.status,
//     } as AuthError;
//   }

//   return data as AuthResponse;
// }
// }

// 1/ Login function
type LoginCredentials = Omit<UserCredentials, 'username'>; 

export async function loginUser(
  credentials: LoginCredentials,
):Promise<AuthResponse>{
  try{
  const response = await axios.post<AuthResponse>("https://egov-backend.vercel.app/api/users/login",credentials
    // {
    // method:'POST',
    // headers:{
    //   'Content-Type':'application/json',
    // },
    // body:JSON.stringify(credentials),
  // }
);

//   const data = await response.json();

//   if(!response.ok){
//     throw{
//       message: data.message || 'regristration failed',
//       statusCode: response.status,
//     } as AuthError;
//   }

//   return data as AuthResponse;
// }
return response.data;
}
catch(error){
    if(axios.isAxiosError(error)){
      const AxiosError = error as AxiosError<BackendErrorResponse>;

      const backendMessage = AxiosError.response?.data?.message || 'Login failed !!'

      throw new Error(backendMessage);
    }
    throw new Error('An unknown error occured');
  }
}