// context/AuthContext.js
import { createContext, useState, useEffect } from 'react';
import {jwtDecode} from 'jwt-decode';
import { useRouter } from 'next/router';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userdetail, setUserDetail] = useState('')
  const [imageUrl, setImageUrl] = useState(null);
  const [isClient, setIsClient] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setIsClient(true); // Set client-side rendering flag
    const fetchprofile = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        console.log("missing token")
      }
      try {
        const decode = jwtDecode(token)
        const userId = decode.id

        const res = await fetch(`https://backend-ibub.onrender.com/api/profilepic/${userId}`, { // Use the user ID in the endpoint
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
        });
        const data = await res.json();
        if (data.success) {
          setUserDetail(data.user)
          const newImageUrl = data.user.photo;
          // console.log(newImageUrl)
          setImageUrl(newImageUrl); // Update the image URL state
          // console.log(likedPosts)
        } else {
          console.log('Image is not uploaded ' + data.message)
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        router.push('/auth/signin');
      }
    }

    fetchprofile()
  }, []);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      try {
        const decoded = jwtDecode(savedToken);
        const userId = decoded.id;
        setToken(savedToken);
        setUserId(userId);
      } catch (error) {
        console.error('Error decoding token:', error);
        router.push('/auth/signin');
      }
    } else {
      router.push('/auth/signin');
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Show a loading state while retrieving the token
  }

  return (
    <AuthContext.Provider value={{ token, userId, userdetail, imageUrl }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
