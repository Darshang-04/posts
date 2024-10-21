import { useState } from 'react';
import { jwtDecode } from 'jwt-decode';

const CreatePostForm = () => {
  const [title, setTitle] = useState('');
  const [photo, setPhoto] = useState(null);
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('');
  const [bookType, setBookType] = useState('');

  const handlePhotoChange = (e) => {
    setPhoto(e.target.files[0]); // Store the file locally
  };

  const uploadImage = async () => {
    if (!photo) return null;

    const formData = new FormData();
    formData.append('file', photo);
    formData.append('upload_preset', 'userposts'); // Replace with your Cloudinary preset

    const res = await fetch('https://api.cloudinary.com/v1_1/okcloud/image/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    return data.secure_url; // Return the Cloudinary URL
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    if (token) {
      const decoded = jwtDecode(token);
      const userId = decoded.id;

      // First, upload the image and get the URL
      const photoUrl = await uploadImage();

      // Once the image is uploaded, use the URL to create the post
      const postData = {
        title,
        photo: photoUrl, // Use the Cloudinary URL
        price,
        description,
        author,
        book_type: bookType,
        postedBy: userId // Use the user ID from the token
      };

      const res = await fetch('https://backend-ibub.onrender.com/api/userposts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(postData),
      });

      if (res.ok) {
        alert('Post created successfully!');
        // Reset the form or handle success as needed
        setTitle('');
        setPhoto(null); // Reset photo (optional, since it's an input field)
        setPrice('');
        setDescription('');
        setAuthor('');
        setBookType('');
      }else if(!token){
        alert(res.error)
      }else {
        const error = await res.json();
        alert(`Error: ${error.message}`);
      }
    }else{
      alert("Your are not authorized user!! plz loggin first")
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input type="file" accept="image/*" onChange={handlePhotoChange} required />
      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Author"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        required
      />
      <select value={bookType} onChange={(e) => setBookType(e.target.value)}>
          <option value="Science Fiction">Science Fiction</option>
          <option value="Adventure">Adventure</option>
          <option value="Romance">Romance</option>
          <option value="Horror">Horror</option>
          <option value="Art & Photography">Art & Photography</option>
          <option value="Children">Children</option>
          <option value="Other">Other</option>
        </select>
      <button type="submit">Create Post</button>
    </form>
  );
};

export default CreatePostForm;
