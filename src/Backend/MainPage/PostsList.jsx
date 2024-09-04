import React, { useState, useEffect } from 'react';
import { db } from '../firebaseconfig'; // Asegúrate de que estas rutas sean correctas
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

const PostsList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');

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
    setSearchInput(e.target.value);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      setSearchTerm(searchInput);
    }
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
        value={searchInput}
        onChange={handleSearchChange}
        onKeyDown={handleSearchKeyDown}
        style={{ marginBottom: '20px', padding: '8px', width: '100%' }}
      />
      {filteredPosts.length > 0 ? (
        <ul>
          {filteredPosts.map((post) => (
            <li key={post.id} style={{ marginBottom: '20px' }}>
              <h3>{post.title}</h3>
              <p>{post.description}</p>
              {post.imageURL && <img src={post.imageURL} alt={post.title} style={{ maxWidth: '100%' }} />}
              <p><small>{new Date(post.timestamp).toLocaleString()}</small></p>
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
