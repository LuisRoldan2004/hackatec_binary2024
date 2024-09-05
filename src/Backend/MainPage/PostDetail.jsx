import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseconfig';
import PayPalButton from '../Pay/PayPalButton';

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener detalles de la publicación
    const fetchPost = async () => {
      try {
        const postDoc = doc(db, 'posts', id);
        const postSnap = await getDoc(postDoc);
        if (postSnap.exists()) {
          setPost(postSnap.data());
        } else {
          console.log('No se encontró la publicación');
        }
      } catch (error) {
        console.error('Error al obtener la publicación:', error);
      } finally {
        setLoading(false);
      }
    };

    // Obtener el número de reservas
    const fetchReservations = () => {
      const reservationsCollection = collection(db, 'transactions');
      const q = query(reservationsCollection, where('postId', '==', id));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const reservationsData = snapshot.docs.map(doc => doc.data());
        setReservations(reservationsData);
      }, (error) => {
        console.error('Error al obtener las reservas:', error);
      });

      return () => unsubscribe(); // Cleanup cuando se desmonte el componente
    };

    fetchPost();
    fetchReservations();
  }, [id]);

  // Mostrar "Cargando" mientras los datos se obtienen
  if (loading) {
    return <div>Cargando...</div>;
  }

  // Verificar si no se encuentra la publicación
  if (!post) {
    return <div>No se encontró la publicación</div>;
  }

  // Obtener el número de reservas confirmadas
  const reservedCount = reservations.length;

  // Verificar si el cupo está lleno
  const maxPeople = post.maxPeople || 0;
  const isFull = maxPeople > 0 && reservedCount >= maxPeople;

  return (
    <div>
      <h1>{post.title}</h1>
      {post.imageURL && <img src={post.imageURL} alt={post.title} style={{ maxWidth: '100%' }} />}
      <p><strong>Descripción:</strong> {post.description}</p>
      <p><strong>Publicado por:</strong> {post.userName || 'Usuario desconocido'}</p>
      <p><strong>Precio:</strong> ${post.price}</p>
      <p><strong>Horario del Evento:</strong> {new Date(post.eventTime).toLocaleString()}</p>
      <p><strong>Ubicación:</strong> {post.location || 'No especificada'}</p>

      {/* Mostrar mensaje si el cupo está lleno */}
      {isFull ? (
        <p><strong>El cupo está lleno</strong></p>
      ) : (
        <>
          <p><strong>Límite de Personas:</strong> {maxPeople}</p>
          <p><strong>Número de Reservas:</strong> {reservedCount}</p>
        </>
      )}

      {/* Mostrar mensaje si no hay reservas aún */}
      {reservedCount === 0 && !isFull && <p>No hay reservas aún.</p>}

      {/* Botón de PayPal */}
      {!isFull && <PayPalButton amount={parseFloat(post.price)} postId={id} />}
    </div>
  );
};

export default PostDetail;
