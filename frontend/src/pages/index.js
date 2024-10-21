import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/context/authcontext';
import Link from 'next/link';
import Comments from './components/comments'; // Make sure this is the correct path

export default function Home() {
  const { token, userId } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [comment, setComment] = useState('');
  const [activePostId, setActivePostId] = useState(null); // Track which comments to sho

  useEffect(() => {
    allposts();
  }, [likedPosts]);

  const allposts = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log("missing token");
    }

    try {
      const res = await fetch(`https://backend-ibub.onrender.com/api/allposts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`
        },
      });
      const data = await res.json();
      if (res.ok) {
        setPosts(data);
        // console.log(data);
      } else {
        console.log(data.error);
      }
    } catch (error) {
      console.log(error);
    }
  };

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
          console.log(data); // Check if data is correct
          const userliked = data.map((post) => post._id); // Ensure you're returning the post._id
          setLikedPosts(userliked);
          console.log(userliked);
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error("Error while fetching likes:", error);
      }
    };
    fetchlikes();
  }, [userId, token]);
  

  const handleLike = async (postId) => {
    try {
      const response = await fetch(`https://backend-ibub.onrender.com/api/like/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: userId,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setLikedPosts([...likedPosts, postId]);
        console.log(data.message);
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
          userId: userId,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setLikedPosts(likedPosts.filter((id) => id !== postId));
        console.log(data.message);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error('Error unliking the post:', error);
    }
  };

  const isLiked = (postId) => likedPosts.includes(postId);

  const handleComment = async (text, id) => {
    if (!token) {
      console.log('not token');
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
      });
      const data = await res.json();
      if (res.status === 200) {
        alert('Comment added successfully!');

        socket.emit('newComment', {
          postId: id,
          comment: data.post.comments[data.post.comments.length - 1] // Sending the new comment
        });
        setPosts(posts.map(post => {
          if (post._id === id) {
            return { ...post, comments: [...post.comments, data.post.comments[data.post.comments.length - 1]] };
          }
          return post;
        }));
        setComment('');
      } else {
        console.log(data.error);
      }
    } catch (error) {
      console.log("error");
    }
  };

  const toggleComments = (postId) => {
    setActivePostId((prevId) => (prevId === postId ? null : postId)); // Close if already open
  };


  return (
    <div className="container">
      <h1>Posts</h1>
      <hr></hr>
      <div className="posts" style={{ position: 'relative', padding: '0 20px' }}>
        {posts.map((post) => (
          <div key={post._id} className="post">
            <div className='profile-pic'>
              <img src={post.postedBy.photo} style={{ width: '100px', borderRadius: '50%' }}></img>
            </div>
            <h2>
              <Link href={`/user/${post.postedBy._id}`}>{post.postedBy.name}</Link>
            </h2>
            <hr></hr>
            <h2>{post.title}</h2>
            <img src={post.photo} alt={post.title} style={{ width: '300px', height: '300px', objectFit: 'cover' }} />
            <p>{post.description}</p>
            <p>Price: ${post.price}</p>
            <span
              className="material-symbols-outlined"
              onClick={() =>
                isLiked(post._id) ? handleUnlike(post._id) : handleLike(post._id)
              }
              style={{ cursor: 'pointer', color: isLiked(post._id) ? 'blue' : 'black' }}
            >thumb_up</span>
            <p>{post.likes.length}</p>
            <p onClick={() => toggleComments(post._id)} style={{ cursor: 'pointer' }}>Comments</p>
            {activePostId=== post._id && <Comments postId={post._id} item={post} toggleComments={toggleComments} handleComment={handleComment}/>} {/* Render comments if toggled */}
            <input
              type="text"
              placeholder="Comment here"
              value={comment}
              onChange={(e) => { setComment(e.target.value) }}
              required
            />
            <button type='submit' onClick={() => { handleComment(comment, post._id) }}>Send</button>
            <hr></hr>
          </div>
        ))}
      </div>
    </div>
  );
}
