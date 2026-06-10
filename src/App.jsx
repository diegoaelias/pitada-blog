import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import PostEditor from './pages/admin/PostEditor'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public blog */}
        <Route path="/" element={<Blog />} />
        <Route path="/:slug" element={<BlogPost />} />

        {/* Admin CMS (protected) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="novo" element={<PostEditor />} />
          <Route path="editar/:id" element={<PostEditor />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
