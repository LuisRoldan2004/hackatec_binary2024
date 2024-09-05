import React, { useState, useEffect } from 'react';

const PayPalButton = ({ amount }) => {
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
          return actions.order.capture().then((details) => {
            alert(`Transacción completada por ${details.payer.name.given_name}`);

            // Aquí puedes guardar los detalles en la base de datos si lo deseas
            saveOrderToDatabase(details);
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
  }, [amount]);

  const saveOrderToDatabase = (details) => {
    // Aquí agregas la lógica para guardar en la BD, como Firebase, MongoDB, etc.
    console.log('Guardar en la BD:', {
      amount,
      transactionDetails: details,
    });
  };

  return (
    <div>
      <h2>Total a Pagar: {amount.toFixed(2)}</h2>
      <div id="paypal-button-container"></div>
    </div>
  );
};

export default PayPalButton;
