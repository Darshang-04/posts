// pages/user/[id].js
import { useRouter } from 'next/router';
import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '@/context/authcontext';
import Connection from '../components/connection';


export default function UserProfile() {
  const { token, userId } = useContext(AuthContext)
  const router = useRouter();
  const { id } = router.query; // Get the user ID from the route
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [comment, setComment] = useState('')
  const [isfollower, setIsFollower] = useState(false)
  const [userDetail, setUserDetail] = useState(null);

  useEffect(() => {
    if (id) {
      // Fetch the user data by ID
      const fetchUser = async () => {
        try {
          const res = await fetch(`https://backend-ibub.onrender.com/api/profile/${id}`,{
            method:"GET",
            headers:{
              Authorization: `Bearer ${token}`
            }
          }); // Adjust this API call to your backend
          const data = await res.json();
          if (res.ok) {
            setUser(data.user);
            setPosts(data.posts)
            // console.log(data.user)
            // console.log(data.posts)
          } else {
            console.log(data.error);
          }
        } catch (error) {
          console.log(error);
        }
      };
      fetchUser();
    }
  }, [id, likedPosts]);

  useEffect(() => {
    if(id){
    const checkFollowerstatus = async () => {
      if (!token || !userId) {
        console.log("Token or userId is missing");
        return; // Exit early if token or userId is missing
      }
  
      try {
        const response = await fetch(`https://backend-ibub.onrender.com/api/isfollowing/${userId}/${id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
  
        if (response.ok) {
          // console.log(data); // Check if data is correct
          setIsFollower(data.isfollower);
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error("Error while fetching followers:", error);
      }
    };
    checkFollowerstatus();
  }
  }, [userId, id, token]);


  if (!user) return <p>Loading...</p>;

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
        // alert('Comment added successfully!');
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

  const follow = async()=>{
    try{
      const res = await fetch('https://backend-ibub.onrender.com/api/follower',{
        method: "PUT",
        headers:{
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`
        },
        body:JSON.stringify({
          followId: id,
          userId: userId
        })
      })
      const data = await res.json()
      if(res.ok){
        setIsFollower(true)
        console.log(data)
      }else{
        console.log("not followered")
      }
    }catch(error){
      console.log(error)
    }
  }

  const unfollow = async()=>{
    try{
      const res = await fetch('https://backend-ibub.onrender.com/api/unfollower',{
        method: "PUT",
        headers:{
          'Content-Type': 'application/json',
          authorization: `Bearer ${token}`
        },
        body:JSON.stringify({
          unfollowId: id,
          userId: userId
        })
      })
      const data = await res.json()
      if(res.ok){
        setIsFollower(false)
        console.log(data)
      }else{
        console.log("not followered")
      }
    }catch(error){
      console.log(error)
    }
  }

  return (
    <div>
      <h2>Upload Profile Picture</h2>
      <div className='profile-pic'>
        <div className='pic'>
          {user.photo ? (
            <img src={user.photo} alt="Profile" width={200} height={200} />
          ) : (
            <p>No profile picture uploaded yet.</p>
          )}
        </div>
        <h1>{user.username}</h1>
        <Connection ></Connection>
      </div>
      <div className='follower-div'>
      {isfollower ? (
        <button onClick={unfollow}>Unfollow</button>
      ) : (
        <button onClick={follow}>Follow</button>
      )}
    </div>
      <hr></hr>


      <div className='container'>
        <div className='profile_detail'>
          <h1>Your Posts</h1>
          {posts.length === 0 ? (
            <p>No posts found.</p>
          ) : (
            posts.map((post) => (
              <div key={post._id}>
                <h2>{post.title}</h2>
                <img src={post.photo} alt={post.title} />
                <p>Price: {post.price}</p>
                <p>Description: {post.description}</p>
                <p>Author: {post.author}</p>
                <p>Book Type: {post.book_type}</p>
                <span
                  className="material-symbols-outlined"
                  onClick={() =>
                    isLiked(post._id) ? handleUnlike(post._id) : handleLike(post._id)
                  }
                  style={{ cursor: 'pointer', color: isLiked(post._id) ? 'blue' : 'black' }}
                >thumb_up</span>
                <p>{post.likes.length}</p>
                <input
                  type="text"
                  placeholder="Comment here"
                  value={comment}
                  onChange={(e) => { setComment(e.target.value) }}
                  required
                />
                <button type='submit' onClick={() => { handlecomment(comment, post._id) }}>sent</button>
                <h1>{post?.comments?.length > 0 ? (
                  post.comments.map((comment) => (
                    <div key={comment._id}>
                      <p><strong>{comment.postedBy?.username || "Anonymous"}:</strong> {comment.comment}</p>
                    </div>
                  ))
                ) : (
                  <p>No comments yet</p>
                )}</h1>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
