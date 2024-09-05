import React, { useState, useEffect } from 'react';
import { db } from '../firebaseconfig';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const PayPalButton = ({ amount, postId }) => {
  const [transactionId, setTransactionId] = useState(null);
  const auth = getAuth(); // Obtener el usuario autenticado

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=AUEfkaVadFgi_PnZEaxJXcJ1x9SsMRphqaskGkLbTCKr7AMsxAhhiNKhxco8Ea8lRe6cURSdSlTuDNYz&currency=USD`;
    script.addEventListener('load', () => {
      window.paypal.Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: amount.toFixed(2),
              },
            }],
          });
        },
        onApprove: (data, actions) => {
          return actions.order.capture().then(async (details) => {
            // Mostrar alerta con nombre del pagador e ID de la transacción
            alert(`Transacción completada por ${details.payer.name.given_name}. ID de transacción: ${details.id}`);

            setTransactionId(details.id); // Guarda el ID de la transacción

            try {
              // Guardar los detalles de la transacción en Firestore
              await saveTransactionDetails(details);
              
              // Mostrar alerta de éxito después de guardar los detalles
              alert('Detalles de la transacción agregados a la base de datos.');

              // Actualizar estado del pago en la colección "reservations"
              await updatePaymentStatus(details.id, postId);
            } catch (error) {
              console.error('Error al guardar los detalles de la transacción:', error);
              alert('Ocurrió un error al guardar los detalles de la transacción.');
            }
          });
        },
        onError: (err) => {
          console.error('Error en la transacción:', err);
        }
      }).render('#paypal-button-container');
    });

    document.body.appendChild(script);

    // Limpiar el script cuando el componente se desmonte
    return () => {
      document.body.removeChild(script);
    };
  }, [amount, postId]);

  // Guardar detalles de la transacción en Firestore
  const saveTransactionDetails = async (details) => {
    try {
      const user = auth.currentUser;
      const transactionData = {
        transactionId: details.id || 'N/A',
        userName: user ? user.displayName || 'Usuario desconocido' : 'Usuario desconocido',
        userId: user ? user.uid || 'N/A' : 'N/A',
        transactionDate: new Date().toISOString(),
        amount: amount ? amount.toFixed(2) : '0.00',
        postId: postId || 'N/A'
      };

      // Crear un nuevo documento en la colección "transactions"
      await addDoc(collection(db, 'transactions'), transactionData);

      console.log('Detalles de la transacción guardados con éxito en Firebase');
    } catch (error) {
      console.error('Error al guardar los detalles de la transacción:', error);
    }
  };

  // Actualizar estado del pago en la colección "reservations"
  const updatePaymentStatus = async (transactionId, postId) => {
    try {
      const orderRef = doc(db, 'reservations', postId);
      await setDoc(orderRef, {
        paymentStatus: 'confirmed',
        transactionId: transactionId
      }, { merge: true });

      console.log('Estado del pago actualizado en la base de datos');
    } catch (error) {
      console.error('Error al actualizar el estado del pago:', error);
    }
  };

  return (
    <div>
      <h2>Total a Pagar: ${amount.toFixed(2)}</h2>
      <div id="paypal-button-container"></div>
    </div>
  );
};

export default PayPalButton;
