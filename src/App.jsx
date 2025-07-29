import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import IntroVideo from './components/IntroVideo'
import Home from './components/Home'
import Gallery from './components/Gallery'
import Workshops from './components/Workshops'
import Artists from './components/Artists'
import Contact from './components/Contact'
import About from './components/About'
import Events from './components/Events'
import ArtBlogs from './components/ArtBlogs'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<IntroVideo />} />
          <Route path="/home" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/workshops" element={<Workshops />} />
          <Route path="/artists" element={<Artists />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/events" element={<Events />} />
          <Route path="/artblogs" element={<ArtBlogs />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
