import React, { useState, useEffect } from 'react';
import { db } from '../firebaseconfig'; 
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; // Importa el hook useNavigate

const MyReservation = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const navigate = useNavigate(); // Declara el hook useNavigate

  useEffect(() => {
    const fetchTransactions = async () => {
      const user = auth.currentUser;
      if (!user) {
        alert('Debes estar autenticado para ver tus transacciones.');
        return;
      }

      const userId = user.uid;
      const transactionsCollection = collection(db, 'transactions');
      const q = query(transactionsCollection, where('userId', '==', userId));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const transactionsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTransactions(transactionsData);
        setLoading(false);
      });

      return () => unsubscribe(); // Cleanup cuando se desmonte el componente
    };

    fetchTransactions();
  }, [auth]);

  const goToWelcome = () => {
    navigate('/welcome'); // Navegar a la ruta /welcome
  };

  if (loading) {
    return <div>Cargando transacciones...</div>;
  }

  return (
    <div>
      <h2>Mis Transacciones</h2>
      <button onClick={goToWelcome} style={{ padding: '10px 20px', marginBottom: '20px' }}>
        Volver
      </button>
      {transactions.length > 0 ? (
        <ul>
          {transactions.map((transaction) => (
            <li key={transaction.id} style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '8px', padding: '10px' }}>
              <h3>Transacción ID: {transaction.transactionId}</h3>
              <p><strong>Nombre del Usuario:</strong> {transaction.userName}</p>
              <p><strong>Fecha de la Transacción:</strong> {new Date(transaction.transactionDate).toLocaleString()}</p>
              <p><strong>Monto:</strong> ${transaction.amount}</p>
              <p><strong>ID de la Publicación:</strong> {transaction.postId}</p>
              <p><strong>Título del Post:</strong> {transaction.postTitle}</p>
              {transaction.imageURL && (
                <img src={transaction.imageURL} alt={`Imagen de la transacción ${transaction.transactionId}`} style={{ maxWidth: '100%', marginTop: '10px' }} />
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No tienes transacciones.</p>
      )}
    </div>
  );
};

export default MyReservation;
