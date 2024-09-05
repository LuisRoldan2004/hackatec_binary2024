// src/pages/MyReservations.js
import React, { useState, useEffect } from 'react';
import { db } from '../firebaseconfig'; 
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const MyReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      const userId = 'user-id-placeholder'; // Obtén el ID del usuario autenticado
      const reservationsCollection = collection(db, 'reservations');
      const q = query(reservationsCollection, where('userId', '==', userId));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const reservationsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReservations(reservationsData);
        setLoading(false);
      });

      return () => unsubscribe(); // Cleanup cuando se desmonte el componente
    };

    fetchReservations();
  }, []);

  if (loading) {
    return <div>Cargando reservas...</div>;
  }

  return (
    <div>
      <h2>Mis Reservas</h2>
      {reservations.length > 0 ? (
        <ul>
          {reservations.map((reservation) => (
            <li key={reservation.id} style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '8px', padding: '10px' }}>
              <h3>Reserva ID: {reservation.id}</h3>
              <p><strong>Estado del Pago:</strong> {reservation.paymentStatus}</p>
              <p><strong>Fecha y Hora:</strong> {new Date(reservation.timestamp).toLocaleString()}</p>
              <p><strong>Dirección:</strong> {reservation.address}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No tienes reservas.</p>
      )}
    </div>
  );
};

export default MyReservations;
