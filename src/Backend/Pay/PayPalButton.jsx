import React, { useState, useEffect } from 'react';
import { db } from '../firebaseconfig';
import { doc, updateDoc, getDoc, collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const PayPalButton = ({ amount, postId, isFull }) => {
  const [transactionId, setTransactionId] = useState(null);
  const auth = getAuth(); // Obtener el usuario autenticado

  useEffect(() => {
    if (isFull) return; // No cargar el script si el cupo está lleno

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
        onApprove: async (data, actions) => {
          return actions.order.capture().then(async (details) => {
            alert(`Transacción completada por ${details.payer.name.given_name}. ID de transacción: ${details.id}`);

            setTransactionId(details.id);

            try {
              await saveTransactionDetails(details);
              alert('Detalles de la transacción agregados a la base de datos.');

              // Actualizar el estado del pago y el límite de personas
              await updatePaymentStatus(details.id, postId);
              await updatePostLimit(postId);
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

    return () => {
      document.body.removeChild(script);
    };
  }, [amount, postId, isFull]);

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

      await addDoc(collection(db, 'transactions'), transactionData);
      console.log('Detalles de la transacción guardados con éxito en Firebase');
    } catch (error) {
      console.error('Error al guardar los detalles de la transacción:', error);
    }
  };

  // Actualizar el límite de personas y reflejar la reservación en el post
  const updatePostLimit = async (postId) => {
    try {
      const postRef = doc(db, 'posts', postId);
      const postSnap = await getDoc(postRef);

      if (postSnap.exists()) {
        const postData = postSnap.data();
        const updatedLimit = postData.limit - 1;

        // Actualizar el límite de personas si aún hay espacio
        if (updatedLimit >= 0) {
          await updateDoc(postRef, {
            limit: updatedLimit,
            reserved: true, // Mostrar que hay una reservación
          });
          console.log('Límite de personas actualizado y reservación registrada.');
        } else {
          alert('No hay más espacios disponibles.');
        }
      }
    } catch (error) {
      console.error('Error al actualizar el límite de personas:', error);
    }
  };

  // Actualizar estado del pago en la colección "reservations"
  const updatePaymentStatus = async (transactionId, postId) => {
    try {
      const orderRef = doc(db, 'reservations', postId);
      await updateDoc(orderRef, {
        paymentStatus: 'confirmed',
        transactionId: transactionId
      });
    } catch (error) {
      console.error('Error al actualizar el estado del pago:', error);
    }
  };

  return (
    <div>
      <h2>Total a Pagar: ${amount.toFixed(2)}</h2>
      {!isFull ? <div id="paypal-button-container"></div> : <p><strong>El cupo está lleno</strong></p>}
    </div>
  );
};

export default PayPalButton;
