import React, { useState } from 'react';
import { db, storage } from '../firebaseconfig'; // Asegúrate de que estas rutas sean correctas
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

const Post = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: null,
    eventTime: '',  // Nuevo campo para la hora del evento
    price: ''       // Nuevo campo para el precio
  });
  const [status, setStatus] = useState({ error: '', success: '' });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'file' ? files[0] : value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > MAX_IMAGE_SIZE) {
        alert('La imagen seleccionada es demasiado grande. Por favor, selecciona una imagen más pequeña.');
        e.target.value = null;
      } else {
        setFormData({ ...formData, image: file });
      }
    }
  };

  const uploadImage = async (image) => {
    const imageRef = ref(storage, `images/${image.name}`);
    try {
      await uploadBytes(imageRef, image);
      return await getDownloadURL(imageRef);
    } catch (error) {
      console.error('Error al subir la imagen:', error);
      throw new Error('Error al subir la imagen');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { title, description, image, eventTime, price } = formData;
    if (!title || !description || !image || !eventTime || !price) {
      setStatus({ error: 'Todos los campos son obligatorios.', success: '' });
      return;
    }

    try {
      const imageURL = await uploadImage(image);
      await addDoc(collection(db, 'posts'), {
        title,
        description,
        imageURL,
        eventTime,     // Añade el horario del evento
        price,         // Añade el precio
        timestamp: new Date().toISOString()
      });

      setStatus({ error: '', success: 'Publicación creada exitosamente.' });
      setFormData({ title: '', description: '', image: null, eventTime: '', price: '' });
    } catch (error) {
      setStatus({ error: error.message, success: '' });
    }
  };

  return (
    <div>
      <h1>Crear Publicación</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Título</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="eventTime">Horario del Evento</label>
          <input
            type="datetime-local"
            id="eventTime"
            name="eventTime"
            value={formData.eventTime}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="price">Precio</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="image">Imagen</label>
          <input
            type="file"
            id="image"
            name="image"
            onChange={handleImageChange}
            required
          />
        </div>
        {status.error && <div style={{ color: 'red' }}>{status.error}</div>}
        {status.success && <div style={{ color: 'green' }}>{status.success}</div>}
        <button type="submit">Crear Publicación</button>
      </form>
    </div>
  );
};

export default Post;
