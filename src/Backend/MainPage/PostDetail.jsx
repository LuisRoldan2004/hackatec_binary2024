// src/pages/PostDetail.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseconfig';
import PayPalButton from '../Pay/PayPalButton';

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      const postDoc = doc(db, 'posts', id);
      const postSnap = await getDoc(postDoc);
      if (postSnap.exists()) {
        setPost(postSnap.data());
      } else {
        console.log('No se encontró la publicación');
      }
      setLoading(false);
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!post) {
    return <div>No se encontró la publicación</div>;
  }

  return (
    <div>
      <h1>{post.title}</h1>
      {post.imageURL && <img src={post.imageURL} alt={post.title} style={{ maxWidth: '100%' }} />}
      <p><strong>Descripción:</strong> {post.description}</p>
      <p><strong>Publicado por:</strong> {post.userName || 'Usuario desconocido'}</p>
      <p><strong>Precio:</strong> ${post.price}</p>
      <p><strong>Horario del Evento:</strong> {new Date(post.eventTime).toLocaleString()}</p>
      <PayPalButton amount={100} />
    </div>
  );
};

export default PostDetail;
