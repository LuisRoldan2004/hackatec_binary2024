import React, { useState, useEffect } from 'react';
import { db } from '../firebaseconfig'; 
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, addDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom'; 
import CommentsSection from './CommentsSection';
import { getAuth } from 'firebase/auth'; // Para obtener el nombre del usuario autenticado

const PostsList = () => {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState({});
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);

  const auth = getAuth(); // Obtener el usuario autenticado

  useEffect(() => {
    // Obtener publicaciones
    const postsCollection = collection(db, 'posts');
    const q = query(postsCollection, orderBy('timestamp', 'desc'));

    const unsubscribePosts = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsData);
      setFilteredPosts(postsData); // Inicialmente, muestra todas las publicaciones
      setLoading(false);
    });

    // Obtener usuarios
    const usersCollection = collection(db, 'users');
    const unsubscribeUsers = onSnapshot(usersCollection, (snapshot) => {
      const usersData = {};
      snapshot.docs.forEach(doc => {
        usersData[doc.id] = doc.data();
      });
      setUsers(usersData);
    });

    // Obtener comentarios
    const commentsCollection = collection(db, 'comments');
    const unsubscribeComments = onSnapshot(commentsCollection, (snapshot) => {
      const commentsData = {};
      snapshot.docs.forEach(doc => {
        const comment = doc.data();
        if (!commentsData[comment.postID]) {
          commentsData[comment.postID] = [];
        }
        commentsData[comment.postID].push(comment);
      });
      setComments(commentsData);
    });

    return () => {
      unsubscribePosts();
      unsubscribeUsers();
      unsubscribeComments();
    }; 
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const filtered = posts.filter(post =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPosts(filtered);
  };

  // Función para guardar los detalles en Firestore
  const saveTransactionData = async (postId, transactionId) => {
    try {
      const user = auth.currentUser;
      const transactionData = {
        transactionId: transactionId,
        userName: user ? user.displayName : 'Usuario desconocido',
        userId: user ? user.uid : 'N/A',
        postId: postId,
        timestamp: new Date().toISOString(),
      };

      // Guardar los detalles en una colección llamada "transactions"
      await addDoc(collection(db, 'transactions'), transactionData);
      console.log('Detalles de la transacción guardados con éxito.');
    } catch (error) {
      console.error('Error al guardar los detalles de la transacción:', error);
    }
  };

  const handleDeletePost = async (postId) => {
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar esta publicación?");
    if (!confirmDelete) return;

    try {
      // Simulación de un ID de transacción para fines de prueba
      const transactionId = `TRX-${Math.random().toString(36).substr(2, 9)}`;

      // Eliminar comentarios asociados
      const commentsToDelete = comments[postId] || [];
      for (const comment of commentsToDelete) {
        await deleteDoc(doc(db, 'comments', comment.id));
      }

      // Eliminar publicación
      await deleteDoc(doc(db, 'posts', postId));

      // Guardar los datos en la colección "transactions" después de eliminar
      await saveTransactionData(postId, transactionId);

      // Mostrar alerta de éxito
      alert("Publicación eliminada correctamente.");
    } catch (error) {
      console.error("Error al eliminar la publicación:", error);
      alert("Ocurrió un error al intentar eliminar la publicación.");
    }
  };

  if (loading) {
    return <div>Cargando publicaciones...</div>;
  }

  return (
    <div>
      <h2>Publicaciones Recientes</h2>
      <form onSubmit={handleSearchSubmit} style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Buscar por título" 
          value={searchTerm}
          onChange={handleSearchChange} 
          style={{ padding: '8px', width: 'calc(100% - 100px)' }}
        />
        <button 
          type="submit" 
          style={{ padding: '8px', width: '100px' }}
        >
          Buscar
        </button>
      </form>
      {filteredPosts.length > 0 ? (
        <ul>
          {filteredPosts.map((post) => {
            const user = users[post.userID] || {};
            const postComments = comments[post.id] || [];
            return (
              <li key={post.id} style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '8px', padding: '10px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  {user.userPhoto && (
                    <img
                      src={user.userPhoto}
                      alt={user.userName}
                      style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '10px' }}
                    />
                  )}
                  <div>
                    <p><strong>{user.userName || 'Usuario desconocido'}</strong></p>
                    <p><small>{new Date(post.timestamp).toLocaleString()}</small></p>
                  </div>
                </div>
                <Link to={`/post/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <h3>{post.title}</h3>
                </Link>
                <p>{post.description}</p>
                {post.imageURL && <img src={post.imageURL} alt={post.title} style={{ maxWidth: '100%' }} />}
                <CommentsSection postId={post.id} />
                <button onClick={() => handleDeletePost(post.id)} style={{ marginTop: '10px', padding: '8px', backgroundColor: 'red', color: 'white', border: 'none', borderRadius: '4px' }}>
                  Eliminar
                </button>
                <Link to={`/edit-post/${post.id}`} style={{ marginTop: '10px', padding: '8px', backgroundColor: 'blue', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
                  Editar
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No hay publicaciones disponibles.</p>
      )}
    </div>
  );
};

export default PostsList;
