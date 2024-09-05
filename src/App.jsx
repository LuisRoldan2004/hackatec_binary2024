import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './Backend/Login/Register';
import Login from './Backend/Login/Login';
import Welcome from'./Backend/Login/Welcome';
import ResetPassword from './Backend/Login/ResetPassword';
import Post from './Backend/MainPage/Post';
import PostsList from './Backend/MainPage/PostsList';
import PostDetail from './Backend/MainPage/PostDetail';


function App() {

  return (
    <Router>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/reset-password" element={<ResetPassword/>}/>
      <Route path="/post" element={<Post/>}/>
      <Route path='/postslist' element={<PostsList/>}/>
      <Route path="/post/:id" element={<PostDetail />} /> 
    </Routes>
  </Router>
);
}

export default App
