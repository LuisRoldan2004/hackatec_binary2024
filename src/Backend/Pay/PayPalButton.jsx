// src/components/Pay/PayPalButton.js
import React, { useState, useEffect } from 'react';
import { db } from '../firebaseconfig'; 
import { doc, setDoc } from 'firebase/firestore';

const PayPalButton = ({ amount, postId }) => {
  const [transactionId, setTransactionId] = useState(null);

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
            // Alerta para mostrar el nombre del pagador y el estado de la transacción
            alert(`Transacción completada por ${details.payer.name.given_name}. ID de transacción: ${details.id}`);
            setTransactionId(details.id); // Guarda el ID de la transacción

            // Actualiza la base de datos con el estado del pago
            await updatePaymentStatus(details.id, postId);
          });
        },
        onError: (err) => {
          console.error('Error en la transacción:', err);
        }
      }).render('#paypal-button-container');
    });

    document.body.appendChild(script);

    // Limpia el script cuando el componente se desmonte
    return () => {
      document.body.removeChild(script);
    };
  }, [amount, postId]);

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
