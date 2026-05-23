import { Routes, Route, Navigate } from 'react-router-dom';
import ChatDebug from './pages/ChatDebug.jsx';
import VillageMap from './pages/VillageMap.jsx';
import SpaceDetail from './pages/SpaceDetail.jsx';

/**
 * MVP3 路由
 *   /              → 龙潭村地图（VillageMap）
 *   /space/:slug   → 空间详情（SpaceDetail）
 *   /chat          → 调试页（保留）
 */
export default function App() {
  return (
    <Routes>
      {/* MVP3: 地图主页 */}
      <Route path="/" element={<VillageMap />} />
      {/* MVP3: 空间详情 */}
      <Route path="/space/:slug" element={<SpaceDetail />} />
      {/* MVP1: 保留的对话调试页 */}
      <Route path="/chat" element={<ChatDebug />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
