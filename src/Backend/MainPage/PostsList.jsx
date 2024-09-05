import React, { useState, useEffect } from 'react';
import { db } from '../firebaseconfig'; 
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom'; // Importa Link para la navegación
import { getAuth } from 'firebase/auth'; // Para obtener el usuario autenticado
import CommentsSection from './CommentsSection';

const PostsList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const auth = getAuth(); // Inicializa la autenticación
  const user = auth.currentUser; // Obtiene el usuario autenticado

  useEffect(() => {
    const postsCollection = collection(db, 'posts');
    const q = query(postsCollection, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postsData);
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup cuando se desmonte el componente
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filtrar las publicaciones excluyendo las del usuario autenticado
  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    post.userEmail !== user.email // Filtrar las publicaciones del propio usuario
  );

  if (loading) {
    return <div>Cargando publicaciones...</div>;
  }

  return (
    <div>
      <h2>Publicaciones Recientes</h2>
      <input 
        type="text" 
        placeholder="Buscar por título" 
        value={searchTerm}
        onChange={handleSearchChange} 
        style={{ marginBottom: '20px', padding: '8px', width: '100%' }}
      />
      {filteredPosts.length > 0 ? (
        <ul>
          {filteredPosts.map((post) => (
            <li key={post.id} style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '8px', padding: '10px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                {post.userPhoto && (
                  <img
                    src={post.userPhoto}
                    alt={post.userName}
                    style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '10px' }}
                  />
                )}
                <div>
                  <p><strong>{post.userName || 'Usuario desconocido'}</strong></p>
                  <p><small>{new Date(post.timestamp).toLocaleString()}</small></p>
                </div>
              </div>
              <Link to={`/post/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <h3>{post.title}</h3>
              </Link>
              <p>{post.description}</p>
              {post.imageURL && <img src={post.imageURL} alt={post.title} style={{ maxWidth: '100%' }} />}
              <p><strong>Publicado por: {post.userName || 'Usuario desconocido'}</strong></p> {/* Aquí se imprime el nombre del usuario */}
              <CommentsSection postId={post.id} />
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay publicaciones disponibles.</p>
      )}
    </div>
  );
};

export default PostsList;
