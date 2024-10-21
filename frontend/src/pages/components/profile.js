import { useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/router';
import { AuthContext } from '@/context/authcontext';
import '@/styles/profile.module.css'
import Link from 'next/link';
import { user } from '@nextui-org/theme';


export default function Profile() {
  const { token, userId } = useContext(AuthContext)
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null); // State to hold the uploaded image URL
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false); // State to check if client-side rendering
  const [User, setUser] = useState('')
  const [userdetail, setUserDetail] = useState('')
  const [likedPosts, setLikedPosts] = useState([]);
  const [comment, setComment] = useState('')
  const [isfollower, setIsFollower] = useState(false)
  const router = useRouter()

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
          setUser(data.user.username)
          const newImageUrl = data.user.photo;
          setImageUrl(newImageUrl); // Update the image URL state
          setLikedPosts(data.user.likedPosts || [])
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
    const fetchPosts = async () => {
      const isClient = typeof window !== 'undefined';
      if (isClient) {
        const token = localStorage.getItem('token')
        if (!token) {
          alert('No token found. Please log in.');
        }
        const decode = jwtDecode(token)
        const userId = decode.id

        try {
          const res = await fetch(`https://backend-ibub.onrender.com/api/userposts/${userId}`, { // Use the user ID in the endpoint
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              authorization: `Bearer ${token}`
            },
          });
          if (res.ok) {
            const data = await res.json();
            setPosts(data); // Set the fetched posts
          } else {
            console.error('Failed to fetch posts:', res.status);
          }
        } catch (error) {
          console.error('Error fetching posts:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPosts();
  }, [isClient, likedPosts]);

  useEffect(() => {
    const fetchlikes = async () => {
      if (!token || !userId) {
        console.log("Token or userId is missing");
        return; // Exit early if token or userId is missing
      }
  
      try {
        const response = await fetch(`https://backend-ibub.onrender.com/api/user/${userId}/liked-posts`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
  
        if (response.ok) {
          // console.log(data); // Check if data is correct
          const userliked = data.map((post) => post._id); // Ensure you're returning the post._id
          setLikedPosts(userliked);
          // console.log(userliked);
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error("Error while fetching likes:", error);
      }
    };
    fetchlikes();
  }, [userId, token]);


  // Handle file input change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setFile(reader.result); // Base64 encoded image
    };

    if (selectedFile) {
      reader.readAsDataURL(selectedFile); // Read the image file as Base64
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert('Please select a file before uploading.');
      return;
    }

    setIsUploading(true); // Set uploading state to true

    try {
      const response = await fetch(`https://backend-ibub.onrender.com/api/profilepic`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`, // Add the token in the Authorization header
        },
        body: JSON.stringify({
          userId: userId,
          photo: file
        }), // Send Base64 encoded image
      });

      const data = await response.json();
      if (response.status === 401) {
        alert('You are not authorized to perform this action.');
      } else if (data.success) {
        alert('Profile image updated successfully!');
        setImageUrl(data.user.photo)
      } else {
        alert('Image upload failed: ' + data.message);
      }
    } catch (error) {
      alert('Error occurred during the upload: ' + error.error);
    } finally {
      setIsUploading(false); // Reset uploading state
      setFile(null);
    }
  };

  const handleLike = async (postId) => {

    try {
      const response = await fetch(`https://backend-ibub.onrender.com/api/like/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: userId,  // Replace with actual user ID
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setLikedPosts([...likedPosts, postId]); // Add postId to likedPosts
        console.log(data.message)
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error('Error liking the post:', error);
    }
  };

  const handleUnlike = async (postId) => {

    try {
      const response = await fetch(`https://backend-ibub.onrender.com/api/unlike/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: userId,  // Replace with actual user ID
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setLikedPosts(likedPosts.filter((id) => id !== postId)); // Remove postId from likedPosts
        console.log(data.message)
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error('Error unliking the post:', error);
    }
  };

  const isLiked = (postId) => likedPosts.includes(postId)

  const handlecomment = async (text, id) => {

    if (!token) {
      console.log('not token')
    }
    try {
      const res = await fetch(`https://backend-ibub.onrender.com/api/${id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          postId: id,
          text: text,
          userId: userId
        })
      })
      const data = await res.json()
      if (res.status == 200) {
        alert('Comment added successfully!');
        // Update the specific post's comments in the state without refetching all posts
        setPosts(posts.map(post => {
          if (post._id === id) {
            return { ...post, comments: [...post.comments, data.post.comments[data.post.comments.length - 1]] };
          }
          return post;
        }));
        setComment('');
      } else {
        console.log(data.error)
      }
    } catch (error) {
      console.log("error")
    }
  }

  return (
    <div className="styles.linkedin-profile">
    <div className="profile-pic">
      <div className="pic">
        {imageUrl ? (
          <img src={imageUrl} alt="Profile" width="200" height="200" />
        ) : (
          <p>No profile picture uploaded yet.</p>
        )}
      </div>
      <h1>{User}</h1>
    <Link href={`/user/notification`}>notification
    </Link>
    <hr></hr>
    </div>
    <form onSubmit={handleSubmit} className="profile-form">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={isUploading} // Disable input while uploading
        className="profile-image-upload"
      />
      <button type="submit" disabled={isUploading} className="profile-image-button">
        {isUploading ? 'Uploading...' : 'Upload'}
      </button>
    </form>
    
    <div className='follower-div'>
      <button >followers</button>
    </div>
    <p>{userdetail && Array.isArray(userdetail.followers) ? userdetail.followers.length : 0}</p>
    <hr className='profile-divider'></hr>
    <div className="profile-content">
      <div className="profile-details">
        <h1>Your Posts</h1>
        {posts.length === 0 ? (
          <p>No posts found.</p>
        ) : (
          <ul className="post-list">
            {posts.map((post) => (
              <li key={post._id} className="post-item">
                <h2>{post.title}</h2>
                <div className="post-image-container">
                  <img src={post.photo} alt={post.title} className="post-image" />
                </div>
                <div className="post-info">
                  <p>Price: {post.price}</p>
                  <p>Description: {post.description}</p>
                  <p>Author: {post.author}</p>
                  <p>Book Type: {post.book_type}</p>
                </div>
                <div className="post-actions">
                
                  <span
                    className="material-symbols-outlined like-button"
                    onClick={() =>
                      isLiked(post._id) ? (handleUnlike(post._id)) : (handleLike(post._id))
                    }
                    style={{ cursor: 'pointer', color: isLiked(post._id) ? 'blue' : 'black' }}
                  >thumb_up</span>
                  <p>{post.likes.length}</p>
                </div>
                <p>Commets</p>
                <div className="post-comments">
                  <input
                    type="text"
                    placeholder="Comment here"
                    value={comment}
                    onChange={(e) => { setComment(e.target.value) }}
                    required
                    className="comment-input"
                  />
                  <button type='submit' onClick={() => { handlecomment(comment, post._id) }} className="comment-button">Send</button>
                  <h1>{post?.comments?.length > 0 ? (
                    <ul className="comment-list">
                      {post.comments.map((comment) => (
                        <li key={comment._id} className="comment">
                          <p><strong>{comment.postedBy?.username || "Anonymous"}:</strong> {comment.comment}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No comments yet</p>
                  )}</h1>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  </div>
  );
}
