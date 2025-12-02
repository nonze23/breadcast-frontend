// src/main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'; // 👈 1. 이 줄을 추가하세요.
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* 👈 2. App 컴포넌트를 감싸줍니다. */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
