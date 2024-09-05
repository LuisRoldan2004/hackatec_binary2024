import React from 'react';
import { useNavigate } from 'react-router-dom'; // Importa el hook useNavigate

const Welcome = () => {
  const navigate = useNavigate(); // Declara el hook useNavigate

  const goToReservations = () => {
    navigate('/myreservation'); // Navegar a la ruta /myreservation
  };

  const goToPost = () => {
    navigate('/postslist'); // Navegar a la ruta /myreservation
  };
  return (
    <div>
      <h2>Bienvenido</h2>
      <p>Has iniciado sesión correctamente.</p>
      <button onClick={goToReservations} style={{ padding: '10px 20px', marginTop: '20px' }}>
        Ver Mis Reservas
      </button>
      <button onClick={goToPost} style={{ padding: '10px 20px', marginTop: '20px' }}>
        Ver post
      </button>
    </div>
  );
};

export default Welcome;
