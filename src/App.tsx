import React, { useEffect } from 'react';
import { ConfigProvider } from 'antd';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import Sidebar from './components/Sidebar';
import PropertyPanel from './components/PropertyPanel';
import LineEditor from './components/LineEditor';
import StyleCustomizer from './components/StyleCustomizer';
import { builtinThemes } from './theme/themes';

export default function App() {
  const uiFlavor = localStorage.getItem('uiFlavor') || 'minimal';
  const themeObj = (builtinThemes as any)[uiFlavor] || builtinThemes.minimal;
  useEffect(() => {
    const root = document.documentElement;
    Object.entries(themeObj.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  }, [uiFlavor]);

  return (
    <ConfigProvider
      theme={{
        token: { colorPrimary: themeObj.antToken?.colorPrimary || '#2563eb' }
      }}
    >
      <div className="app">
        <Toolbar />
        <Canvas />
        <Sidebar />
        <PropertyPanel />
        <LineEditor />
        <StyleCustomizer />
      </div>
    </ConfigProvider>
  );
}
