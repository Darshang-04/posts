import React from 'react';
import { useState } from 'react';

export default function Comments({ item, toggleComments, handleComment }) {
    const [newComment, setNewComment] = useState('');  // Local state for the new comment

  const handleSubmit = (e) => {
    e.preventDefault();
    handleComment(newComment, item._id);  // Use the handleComment function from props
    setNewComment('');  // Clear the input after submission
  };
    
  if (!item) {
    return <div>Loading...</div>; // Handle case when item is not yet available
  }


  return (
    
    <div className='post-comments' style={{ width: '100vw', minHeight: '100vh', position: 'fixed', top: '0', backgroundColor: 'rgba(17, 13, 13, 0.4)', zIndex: 1000 }}>
        <button onClick={() => toggleComments(item._id)} style={{position: 'relative', top: '10px', left: '90%'}}>
        <span className="material-symbols-outlined"> Close</span>
      </button>
      <div className='comments' style={{ backgroundColor: 'white', padding: '10px', borderRadius: '8px', margin: '20px auto', maxWidth: '800px', minHeight: '600px',display: 'flex', justifyContent: 'space-between' }}>
        
        <div className='post-image'>
          <img src={item.photo} alt={item.title} style={{ width: '100%', borderRadius: '8px' }} />
        </div>
        <div className='' style={{width:'100%'}}>
        <div className='profile-pic'>
          <div className='pic'>
            <img src={item.postedBy.photo} alt={item.postedBy.name} style={{ width: '50px', borderRadius: '50%' }} />
          </div>
          <p>Posted by: {item.postedBy.name}</p>
        </div>

        <h3>Comments:</h3>
        <div className='all-comments'>
          {item.comments.length > 0 ? (
            item.comments.map((comment, index) => (
              <div key={index} className='comment'>
                <p>{comment.comment}</p>
                <p><strong>By:</strong> {comment.postedBy.username}</p> {/* Assuming postedBy has a name */}
              </div>
            ))
          ) : (
            <p>No comments yet.</p>
          )}
        </div>
        <div className='' style={{position: 'absolute', top:'83%', }}>
        <form>
          <input
            type="text"
            placeholder="Add a comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button type="submit" onClick={handleSubmit}>Send</button>
        </form>
        </div>
        </div>
      </div>
    </div>
  );
}