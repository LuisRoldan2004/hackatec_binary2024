import React, { useState, useEffect } from 'react';
import { db } from '../firebaseconfig'; 
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';

const EditPost = () => {
  const { postId } = useParams();
  const [post, setPost] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      const postDoc = doc(db, 'posts', postId);
      const postSnapshot = await getDoc(postDoc);
      if (postSnapshot.exists()) {
        setPost(postSnapshot.data());
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const handleChange = (e) => {
    setPost({ ...post, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, post);
    navigate(`/post/${postId}`);
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div>
      <h2>Editar Publicación</h2>
      <form onSubmit={handleUpdate}>
        <div>
          <label>Título:</label>
          <input type="text" name="title" value={post.title || ''} onChange={handleChange} />
        </div>
        <div>
          <label>Descripción:</label>
          <textarea name="description" value={post.description || ''} onChange={handleChange} />
        </div>
        <div>
          <label>URL de Imagen:</label>
          <input type="text" name="imageURL" value={post.imageURL || ''} onChange={handleChange} />
        </div>
        <div>
          <label>Fecha del Evento:</label>
          <input type="datetime-local" name="eventTime" value={post.eventTime || ''} onChange={handleChange} />
        </div>
        <button type="submit">Actualizar</button>
      </form>
    </div>
  );
};

export default EditPost;
