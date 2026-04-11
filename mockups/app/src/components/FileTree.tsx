import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Folder,
  FilePlus,
  FolderPlus,
  GitBranch } from
'lucide-react';
// Helper components for file icons
const ReactIcon = () =>
<span className="text-[#4F8EF7] text-[12px] leading-none select-none">
    ⚛
  </span>;

const CssIcon = () =>
<span className="text-[#7C3AED]/70 text-[12px] leading-none font-bold select-none">
    #
  </span>;

const JsonIcon = () =>
<span className="text-[#10B981]/60 text-[10px] leading-none font-bold select-none">
    {'{ }'}
  </span>;

type FileNode = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  fileType?: 'tsx' | 'css' | 'json' | 'ts';
  children?: FileNode[];
};
const initialTree: FileNode = {
  id: 'root',
  name: 'clara-code',
  type: 'folder',
  children: [
  {
    id: 'src',
    name: 'src',
    type: 'folder',
    children: [
    {
      id: 'app',
      name: 'app',
      type: 'folder',
      children: [
      {
        id: 'page.tsx',
        name: 'page.tsx',
        type: 'file',
        fileType: 'tsx'
      },
      {
        id: 'layout.tsx',
        name: 'layout.tsx',
        type: 'file',
        fileType: 'tsx'
      },
      {
        id: 'globals.css',
        name: 'globals.css',
        type: 'file',
        fileType: 'css'
      }]

    },
    {
      id: 'components',
      name: 'components',
      type: 'folder',
      children: []
    },
    {
      id: 'lib',
      name: 'lib',
      type: 'folder',
      children: []
    }]

  },
  {
    id: 'package.json',
    name: 'package.json',
    type: 'file',
    fileType: 'json'
  },
  {
    id: 'tsconfig.json',
    name: 'tsconfig.json',
    type: 'file',
    fileType: 'json'
  }]

};
export function FileTree() {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(['root', 'src', 'app'])
  );
  const [activeFile, setActiveFile] = useState<string>('page.tsx');
  const toggleFolder = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedFolders(newExpanded);
  };
  const getFileIcon = (type?: string) => {
    switch (type) {
      case 'tsx':
        return <ReactIcon />;
      case 'css':
        return <CssIcon />;
      case 'json':
        return <JsonIcon />;
      default:
        return (
          <span className="text-white/30 text-[10px] leading-none select-none">
            📄
          </span>);

    }
  };
  const renderNode = (node: FileNode, depth: number = 0) => {
    const isExpanded = expandedFolders.has(node.id);
    const isActive = activeFile === node.id;
    const paddingLeft = `${depth * 16 + 8}px`; // pl-4 roughly equals 16px
    if (node.type === 'folder') {
      return (
        <div key={node.id}>
          <div
            className="flex items-center h-7 rounded-md hover:bg-white/5 cursor-pointer gap-1.5 transition-colors duration-100 group"
            style={{
              paddingLeft,
              paddingRight: '8px'
            }}
            onClick={(e) => toggleFolder(node.id, e)}>
            
            <div className="w-3 h-3 flex items-center justify-center text-white/30 group-hover:text-white/50 transition-colors">
              {isExpanded ?
              <ChevronDown size={12} /> :

              <ChevronRight size={12} />
              }
            </div>
            <Folder
              size={14}
              className={
              depth === 0 ? 'text-[#4F8EF7]/60' : 'text-[#4F8EF7]/50'
              } />
            
            <span
              className={`text-[12px] font-mono ${depth === 0 ? 'text-white/70' : 'text-white/60'} group-hover:text-white/80 transition-colors truncate`}>
              
              {node.name}
            </span>
          </div>
          {isExpanded && node.children &&
          <div>
              {node.children.map((child) => renderNode(child, depth + 1))}
            </div>
          }
        </div>);

    }
    return (
      <div
        key={node.id}
        className={`flex items-center h-7 rounded-md cursor-pointer gap-1.5 transition-colors duration-100 group
          ${isActive ? 'bg-[#7C3AED]/10 border border-[#7C3AED]/15' : 'hover:bg-white/5 border border-transparent'}`}
        style={{
          paddingLeft: `${depth * 16 + 24}px`,
          paddingRight: '8px'
        }}
        onClick={() => setActiveFile(node.id)}>
        
        <div className="w-3.5 h-3.5 flex items-center justify-center flex-shrink-0">
          {getFileIcon(node.fileType)}
        </div>
        <span
          className={`text-[12px] font-mono truncate ${isActive ? 'text-white' : 'text-white/50 group-hover:text-white/80'}`}>
          
          {node.name}
        </span>
      </div>);

  };
  return (
    <div className="h-full w-52 bg-[#090D12] border-r border-white/6 flex flex-col flex-shrink-0 select-none">
      {/* PANEL HEADER */}
      <div className="h-10 flex items-center justify-between px-3 border-b border-white/5 flex-shrink-0">
        <span className="text-[10px] text-white/25 tracking-[0.15em] uppercase font-medium">
          Explorer
        </span>
        <div className="flex gap-1">
          <button className="w-5 h-5 flex items-center justify-center text-white/25 hover:text-white/60 transition-colors rounded">
            <FilePlus size={13} />
          </button>
          <button className="w-5 h-5 flex items-center justify-center text-white/25 hover:text-white/60 transition-colors rounded">
            <FolderPlus size={13} />
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="px-2 pt-2 pb-1 flex-shrink-0">
        <input
          type="text"
          placeholder="Search files..."
          className="w-full bg-[#0D1117] border border-white/6 rounded-md px-2.5 py-1.5 text-[11px] text-white/70 placeholder:text-white/20 font-mono focus:outline-none focus:border-[#7C3AED]/30 transition-colors" />
        
      </div>

      {/* FILE TREE */}
      <div className="flex-1 overflow-y-auto px-1 py-1 no-scrollbar">
        {renderNode(initialTree)}
      </div>

      {/* BOTTOM SECTION */}
      <div className="flex-shrink-0 border-t border-white/5 p-2 flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-[#10B981]/60 hover:text-[#10B981] transition-colors cursor-pointer">
          <GitBranch size={10} />
          <span className="text-[10px] font-mono">main</span>
        </div>
        <div className="text-yellow-500/50 text-[10px] font-mono hover:text-yellow-500/80 transition-colors cursor-pointer">
          ● 3 changes
        </div>
      </div>
    </div>);

}