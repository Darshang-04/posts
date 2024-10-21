import React, { useState, useContext } from 'react'
import { useRouter } from 'next/router';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from '@/context/authcontext';

export default function Connection() {
    const router = useRouter()
    const { token, userId } = useContext(AuthContext)
    const [status, setStatus] = useState('pending')
    const { id } = router.query;

    const sendRequest = async () => {
        if (!token || !userId) {
          console.log("token is missing");
          return;
        }
      
        try {
          console.log(userId, id);
          const response = await fetch(`https://backend-ibub.onrender.com/api/send-request`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json", // Set content-type header
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              senderId: userId,
              receiverId: id
            }),
          });
      
          const data = await response.json();
          if (response.ok) {
            setStatus('sent');
            console.log("Request sent successfully");
          } else {
            console.log("Request not sent", data);
          }
        } catch (error) {
          console.log("Error:", error);
        }
      };
      

  return (
    <div>
        <button onClick={sendRequest} disabled={status === 'sent'}>
      {status === 'sent' ? 'Request Sent' : 'Send Request'}
    </button>
    </div>
  )
}
