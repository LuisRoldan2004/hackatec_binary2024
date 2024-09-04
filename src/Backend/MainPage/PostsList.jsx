import React, { useState, useEffect } from 'react';
import { db } from '../firebaseconfig'; // Asegúrate de que estas rutas sean correctas
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import CommentsSection from './CommentsSection'; // Asegúrate de que la ruta sea correcta
import { getAuth } from 'firebase/auth';

const PostsList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const auth = getAuth();

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

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
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
            <li key={post.id} style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '8px', padding: '10px', display: 'flex', alignItems: 'center' }}>
              {post.userPhoto && (
                <img
                  src={post.userPhoto}
                  alt={post.userName}
                  style={{ width: '50px', height: '50px', borderRadius: '50%', marginRight: '10px' }}
                />
              )}
              <div style={{ flex: 1 }}>
                <h3>{post.title}</h3>
                <p><strong>{post.userName}</strong></p>
                <p>{post.description}</p>
                {post.imageURL && <img src={post.imageURL} alt={post.title} style={{ maxWidth: '100%' }} />}
                <p><small>{new Date(post.timestamp).toLocaleString()}</small></p>
                {/* Agrega el componente de comentarios */}
                <CommentsSection postId={post.id} />
              </div>
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
