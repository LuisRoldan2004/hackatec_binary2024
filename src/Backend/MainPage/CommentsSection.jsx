import React, { useState, useEffect } from 'react';
import { db } from '../firebaseconfig'; 
import { collection, addDoc, doc, deleteDoc, updateDoc, onSnapshot, query, orderBy } from 'firebase/firestore'; 
import { getAuth } from 'firebase/auth';

const CommentsSection = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editComment, setEditComment] = useState({ id: '', text: '' });
  const auth = getAuth();

  useEffect(() => {
    const fetchComments = async () => {
      const commentsCollection = collection(db, 'posts', postId, 'comments');
      const q = query(commentsCollection, orderBy('timestamp', 'desc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const commentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setComments(commentsData);
      });

      return () => unsubscribe();
    };

    fetchComments();
  }, [postId]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !newComment.trim()) {
      alert('Debes estar autenticado y el comentario no puede estar vacío.');
      return;
    }

    try {
      const commentsCollection = collection(db, 'posts', postId, 'comments');
      await addDoc(commentsCollection, {
        text: newComment,
        timestamp: new Date().toISOString(),
        userId: user.uid,
        userName: user.displayName || 'Nombre desconocido',
        userPhoto: user.photoURL || 'URL de foto por defecto'
      });
      setNewComment('');
    } catch (error) {
      console.error('Error al agregar comentario:', error);
      alert('Error al agregar comentario.');
    }
  };

  const handleEditComment = async (e, id) => {
    e.preventDefault();
    if (!editComment.text.trim()) {
      alert('El comentario no puede estar vacío.');
      return;
    }

    try {
      const commentDoc = doc(db, 'posts', postId, 'comments', id);
      await updateDoc(commentDoc, { text: editComment.text });
      setEditComment({ id: '', text: '' });
    } catch (error) {
      console.error('Error al editar comentario:', error);
      alert('Error al editar comentario.');
    }
  };

  const handleDeleteComment = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este comentario?')) {
      try {
        const commentDoc = doc(db, 'posts', postId, 'comments', id);
        await deleteDoc(commentDoc);
        alert('Comentario eliminado exitosamente.');
      } catch (error) {
        console.error('Error al eliminar comentario:', error);
        alert('Error al eliminar comentario.');
      }
    }
  };

  return (
    <div>
      <h4>Comentarios:</h4>
      <form onSubmit={handleAddComment}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Escribe un comentario..."
          required
          style={{ width: '100%' }}
        />
        <button type="submit">Agregar Comentario</button>
      </form>

      {comments.length > 0 ? (
        <ul>
          {comments.map((comment) => (
            <li key={comment.id} style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
              <img
                src={comment.userPhoto}
                alt={comment.userName}
                style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}
              />
              <div>
                <p><strong>{comment.userName}</strong> <small>{new Date(comment.timestamp).toLocaleString()}</small></p>
                {editComment.id === comment.id ? (
                  <form onSubmit={(e) => handleEditComment(e, comment.id)}>
                    <textarea
                      value={editComment.text}
                      onChange={(e) => setEditComment({ ...editComment, text: e.target.value })}
                      required
                      style={{ width: '100%' }}
                    />
                    <button type="submit">Guardar Cambios</button>
                    <button type="button" onClick={() => setEditComment({ id: '', text: '' })}>Cancelar</button>
                  </form>
                ) : (
                  <>
                    <p>{comment.text}</p>
                    {auth.currentUser?.uid === comment.userId && (
                      <>
                        <button onClick={() => setEditComment({ id: comment.id, text: comment.text })}>Editar</button>
                        <button onClick={() => handleDeleteComment(comment.id)}>Eliminar</button>
                      </>
                    )}
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay comentarios disponibles.</p>
      )}
    </div>
  );
};

export default CommentsSection;
