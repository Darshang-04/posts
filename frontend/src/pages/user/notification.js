import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/context/authcontext';

export default function Notification() {
  const { token, userId, userdetail, imageUrl } = useContext(AuthContext);
  const [status, setStatus] = useState('pending');
  const [sentUsers, setSentUsers] = useState([]); // To store details of users you received requests to
  const [requests, setRequests] = useState(userdetail?.receivedRequests || []);

  // Function to fetch user details based on IDs in sendRequests
  useEffect(() => {
    if (userdetail && userdetail.receivedRequests?.length > 0) {
      console.log('User details loaded:', userdetail);
      setRequests(userdetail.receivedRequests); // Set received requests from userdetail
      fetchUserDetails();
    } else {
      console.log('User detail not available or no received requests.');
    }
  }, [userdetail]);

  const fetchUserDetails = async () => {
    console.log(userdetail)
    if (!token || !userdetail?.receivedRequests?.length) {
      console.log('No token or sendRequests found');
      return;
    }
    console.log('Fetching user details for received requests:', userdetail.receivedRequests);


    try {
      const response = await fetch('https://backend-ibub.onrender.com/api/request/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userIds: userdetail.receivedRequests, // Array of user IDs from sendRequests
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSentUsers(data.users); // Assuming API returns an array of users
        console.log('Fetched user details successfully:', data.users);
      } else {
        console.log('Failed to fetch user details:', data);
      }
    } catch (error) {
      console.log('Error fetching user details:', error);
    }
  };

  // UseEffect to fetch the details of sent requests when component loads

  const acceptRequest = async (receivedid) => {
    console.log(receivedid)
    try {
      const response = await fetch('https://backend-ibub.onrender.com/api/accept-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId : userId,
          requesterId : receivedid,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setStatus('accepted');
        console.log('Request accepted:', data);

        // Update UI by removing the accepted request
        setRequests((prevRequests) => prevRequests.filter((id) => id !== receivedid));
      } else {
        console.log('Error accepting request:', data);
      }
    } catch (error) {
      console.error('Failed to accept request:', error);
    }
  }; 

  // Function to handle Reject Request
  const rejectRequest = async (receivedid) => {
    try {
      const response = await fetch('https://backend-ibub.onrender.com/api/reject-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId : userId,
          requesterId : receivedid,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setStatus('rejected');
        console.log('Request rejected:', data);

        // Update UI by removing the rejected request
        setRequests((prevRequests) => prevRequests.filter((id) => id !== receivedid));
      } else {
        console.log('Error rejecting request:', data);
      }
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  return (
    <div>
      <div className="pic">
        {imageUrl ? (
          <img src={imageUrl} alt="Profile" width="200" height="200" />
        ) : (
          <p>No profile picture uploaded yet.</p>
        )}
      </div>
      <h2>{userdetail?.username || 'No username'}</h2>

      {/* Display list of sent requests */}
      <div>
        <h3>Sent Requests:</h3>
        {sentUsers.length > 0 ? (
          <ul>
            {sentUsers.map((user) => (
              <li key={user._id}>
                <div>
                  <img src={user.photo} alt={user.username} width="50" height="50" />
                  <p>{user.username}</p>
                </div>
                <button onClick={() => acceptRequest(user._id)}>Accept</button>
                <br></br>
                <button onClick={() => rejectRequest(user._id)}>Reject</button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No sent requests or users found.</p>
        )}
      </div>
    </div>
  );
}
