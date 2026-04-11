import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
const ACTIVE_LINE = 5;
const DIFF_LINES = [10, 11, 12, 13, 14];
type Tab = {
  name: string;
  icon: 'tsx' | 'css' | 'json';
  active: boolean;
};
const tabs: Tab[] = [
{
  name: 'page.tsx',
  icon: 'tsx',
  active: true
},
{
  name: 'layout.tsx',
  icon: 'tsx',
  active: false
}];

const ReactIcon = ({ dim }: {dim?: boolean;}) =>
<span
  className={`text-[11px] leading-none select-none ${dim ? 'text-[#4F8EF7]/40' : 'text-[#4F8EF7]'}`}>
  
    ⚛
  </span>;

// Syntax color helpers
const Kw = ({ children }: {children: React.ReactNode;}) =>
<span className="text-[#7C3AED] font-medium">{children}</span>;

const Tp = ({ children }: {children: React.ReactNode;}) =>
<span className="text-[#4F8EF7]">{children}</span>;

const Str = ({ children }: {children: React.ReactNode;}) =>
<span className="text-[#10B981]">{children}</span>;

const Tag = ({ children }: {children: React.ReactNode;}) =>
<span className="text-red-400/80">{children}</span>;

const Attr = ({ children }: {children: React.ReactNode;}) =>
<span className="text-yellow-400/70">{children}</span>;

const Id = ({ children }: {children: React.ReactNode;}) =>
<span className="text-white/85">{children}</span>;

const Punc = ({ children }: {children: React.ReactNode;}) =>
<span className="text-white/45">{children}</span>;

function BlinkingCursor() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const interval = setInterval(() => setVisible((v) => !v), 530);
    return () => clearInterval(interval);
  }, []);
  return (
    <span
      className="inline-block w-[1.5px] bg-white ml-[1px] align-middle"
      style={{
        height: '1.1em',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.08s'
      }} />);


}
type CodeLine = {
  num: number;
  indent: number;
  content: React.ReactNode;
};
const codeLines: CodeLine[] = [
{
  num: 1,
  indent: 0,
  content:
  <>
        <Kw>import</Kw> <Kw>type</Kw> <Punc>{'{'}</Punc> <Tp>Metadata</Tp>{' '}
        <Punc>{'}'}</Punc> <Kw>from</Kw> <Str>'next'</Str>
      </>

},
{
  num: 2,
  indent: 0,
  content: null
},
{
  num: 3,
  indent: 0,
  content:
  <>
        <Kw>export</Kw> <Kw>const</Kw> <Id>metadata</Id>
        <Punc>:</Punc> <Tp>Metadata</Tp> <Punc>=</Punc> <Punc>{'{'}</Punc>
      </>

},
{
  num: 4,
  indent: 2,
  content:
  <>
        <Id>title</Id>
        <Punc>:</Punc> <Str>'Clara Code — Voice-First Coding'</Str>
        <Punc>,</Punc>
      </>

},
{
  num: 5,
  indent: 2,
  content:
  <>
        <Id>description</Id>
        <Punc>:</Punc> <Str>'Code with your voice.'</Str>
        <Punc>,</Punc>
        <BlinkingCursor />
      </>

},
{
  num: 6,
  indent: 0,
  content:
  <>
        <Punc>{'}'}</Punc>
      </>

},
{
  num: 7,
  indent: 0,
  content: null
},
{
  num: 8,
  indent: 0,
  content:
  <>
        <Kw>export</Kw> <Kw>default</Kw> <Kw>function</Kw> <Id>Home</Id>
        <Punc>{'()'}</Punc> <Punc>{'{'}</Punc>
      </>

},
{
  num: 9,
  indent: 2,
  content:
  <>
        <Kw>return</Kw> <Punc>{'('}</Punc>
      </>

},
{
  num: 10,
  indent: 4,
  content:
  <>
        <Tag>{'<'}</Tag>
        <Tag>main</Tag> <Attr>className</Attr>
        <Punc>=</Punc>
        <Str>"min-h-screen bg-[#0D1117]"</Str>
        <Tag>{'>'}</Tag>
      </>

},
{
  num: 11,
  indent: 6,
  content:
  <>
        <Tag>{'<'}</Tag>
        <Tag>Hero</Tag> <Tag>{'/>'}</Tag>
      </>

},
{
  num: 12,
  indent: 6,
  content:
  <>
        <Tag>{'<'}</Tag>
        <Tag>Features</Tag> <Tag>{'/>'}</Tag>
      </>

},
{
  num: 13,
  indent: 6,
  content:
  <>
        <Tag>{'<'}</Tag>
        <Tag>Pricing</Tag> <Tag>{'/>'}</Tag>
      </>

},
{
  num: 14,
  indent: 4,
  content:
  <>
        <Tag>{'</'}</Tag>
        <Tag>main</Tag>
        <Tag>{'>'}</Tag>
      </>

},
{
  num: 15,
  indent: 2,
  content:
  <>
        <Punc>{')'}</Punc>
      </>

},
{
  num: 16,
  indent: 0,
  content:
  <>
        <Punc>{'}'}</Punc>
      </>

}];

export function CodeEditor() {
  return (
    <div className="h-full flex flex-col bg-[#0D1117] overflow-hidden">
      {/* TAB BAR */}
      <div className="h-9 flex items-center border-b border-white/6 bg-[#0A0E14] px-2 gap-1 overflow-x-auto flex-shrink-0 no-scrollbar">
        {tabs.map((tab) =>
        <div
          key={tab.name}
          className={`flex items-center gap-2 px-3 py-1.5 text-[12px] font-mono cursor-pointer flex-shrink-0 transition-colors
              ${tab.active ? 'rounded-t-md bg-[#0D1117] border-t border-l border-r border-white/8 border-b-0 text-white -mb-[1px] relative z-10' : 'text-white/40 hover:text-white/60'}`}>
          
            <ReactIcon dim={!tab.active} />
            <span>{tab.name}</span>
            {tab.active &&
          <button className="ml-2 text-white/30 hover:text-white text-[10px] leading-none transition-colors">
                <X size={10} />
              </button>
          }
          </div>
        )}
      </div>

      {/* CODE AREA */}
      <div className="flex-1 overflow-auto relative">
        {/* Diff badge */}
        <div className="absolute top-[calc((10-1)*1.7*13px-4px)] right-4 z-10">
          <span className="text-[#10B981] text-[10px] bg-[#10B981]/8 rounded px-1.5 py-0.5 font-mono">
            +5
          </span>
        </div>

        <div
          className="flex font-mono text-[13px]"
          style={{
            lineHeight: '1.7'
          }}>
          
          {/* LINE NUMBERS */}
          <div className="select-none pl-4 pr-4 text-right flex-shrink-0 min-w-[52px] pt-2">
            {codeLines.map((line) =>
            <div
              key={line.num}
              className={`${line.num === ACTIVE_LINE ? 'text-white/40' : 'text-white/[0.18]'}`}>
              
                {line.num}
              </div>
            )}
            {/* Extra empty lines to fill space */}
            {[...Array(8)].map((_, i) =>
            <div key={`empty-${i}`} className="text-white/[0.18]">
                {codeLines.length + i + 1}
              </div>
            )}
          </div>

          {/* CODE CONTENT */}
          <div className="flex-1 pr-8 pl-2 overflow-x-auto pt-2">
            {codeLines.map((line) => {
              const isActive = line.num === ACTIVE_LINE;
              const isDiff = DIFF_LINES.includes(line.num);
              return (
                <div
                  key={line.num}
                  className={`relative
                    ${isActive ? 'bg-white/[0.025]' : ''}
                    ${isDiff ? 'border-l-2 border-[#10B981]/40' : isActive ? 'border-l-2 border-[#7C3AED]/40' : 'border-l-2 border-transparent'}
                  `}
                  style={{
                    paddingLeft: isDiff || isActive ? '6px' : '8px'
                  }}>
                  
                  {line.content !== null ?
                  <span
                    style={{
                      paddingLeft: `${line.indent * 12}px`
                    }}>
                    
                      {line.content}
                    </span> :

                  <span>&nbsp;</span>
                  }
                </div>);

            })}
            {/* Extra empty lines */}
            {[...Array(8)].map((_, i) =>
            <div
              key={`empty-${i}`}
              className="border-l-2 border-transparent"
              style={{
                paddingLeft: '8px'
              }}>
              
                &nbsp;
              </div>
            )}
          </div>
        </div>

        {/* Status indicator */}
        <div className="absolute bottom-2 right-4 text-[11px] text-white/20 font-mono select-none">
          Ln 5, Col 38
        </div>
      </div>
    </div>);

}