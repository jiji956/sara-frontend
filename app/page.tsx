"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Terminal, Shield, Zap, Activity, 
  Bot, User, AlertTriangle, Cpu, Send 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LifeHUD() {
  const [input, setInput] = useState("");
  // 定义日志结构
  const [logs, setLogs] = useState<any[]>([]);
  const [status, setStatus] = useState("IDLE");
  const [battery, setBattery] = useState(100);
  
  // 自动滚动到底部
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 初始启动日志
    setLogs([
      { source: "SYS", msg: "BIO-LINK ESTABLISHED...", type: "system" },
      { source: "MEM", msg: "LOADING CONSTITUTION v2.4...", type: "system" },
      { source: "SARA", msg: "Command link active. Waiting for input.", type: "ai" },
    ]);
  }, []);

  // 监听日志更新，自动滚动
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    // 添加用户消息 (type: user)
    setLogs(prev => [...prev, { source: "USER", msg: userMsg, type: "user" }]);
    setInput("");
    setStatus("PROCESSING");

    try {
      // 指向 Render 云端 (请确保此地址正确)
      const res = await fetch("https://sara-backend-gxr7.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      
      const data = await res.json();
      
      if (data.response) {
        setLogs(prev => [...prev, { source: "SARA", msg: data.response, type: "ai" }]);
      } else if (data.error) {
         setLogs(prev => [...prev, { source: "ERR", msg: data.error, type: "error" }]);
      }

    } catch (err) {
      setLogs(prev => [...prev, { source: "ERR", msg: "CLOUD CONNECTION FAILED", type: "error" }]);
    }
    setStatus("IDLE");
  };

  // --- 辅助函数：根据类型返回图标和样式 ---
  const getMessageStyle = (type: string) => {
    switch(type) {
      case "ai": return { 
        icon: <Bot className="w-5 h-5" />, 
        color: "text-yellow-400", 
        bg: "bg-yellow-900/20 border-yellow-700/50",
        align: "justify-start"
      };
      case "user": return { 
        icon: <User className="w-5 h-5" />, 
        color: "text-cyan-400", 
        bg: "bg-cyan-900/20 border-cyan-700/50",
        align: "justify-end"
      };
      case "error": return { 
        icon: <AlertTriangle className="w-5 h-5" />, 
        color: "text-red-500", 
        bg: "bg-red-900/20 border-red-800/50",
        align: "justify-start"
      };
      default: return { 
        icon: <Terminal className="w-4 h-4" />, 
        color: "text-green-600", 
        bg: "bg-transparent border-transparent",
        align: "justify-center" // 系统消息居中
      };
    }
  };

  return (
    <div className="h-[100dvh] bg-black text-green-500 font-mono flex flex-col relative overflow-hidden">
      {/* 背景网格特效 */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,18,0.8)_1px,transparent_1px)] bg-[size:30px_30px] opacity-20 pointer-events-none" />

      {/* 顶部状态栏 */}
      <div className="flex justify-between items-center border-b border-green-900/50 p-4 bg-black/80 backdrop-blur z-10 sticky top-0">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-yellow-500" />
          <div className="leading-none">
            <div className="text-lg font-bold tracking-widest text-yellow-500">SARA_OS</div>
            <div className="text-[10px] opacity-50">SECURE LINK ESTABLISHED</div>
          </div>
        </div>
        <div className="flex gap-3 text-xs">
            <div className="hidden sm:flex items-center gap-1 opacity-60"><Cpu className="w-4 h-4" /> 12%</div>
            <div className="flex items-center gap-1 opacity-60"><Zap className="w-4 h-4 text-yellow-400" /> {battery}%</div>
        </div>
      </div>

      {/* 聊天滚动区域 */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 z-0 scroll-smooth">
        <AnimatePresence>
          {logs.map((log, i) => {
            const style = getMessageStyle(log.type);
            const isSystem = log.type === "system";
            
            return (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${style.align}`}
              >
                {/* 消息容器 */}
                <div className={`
                  max-w-[85%] sm:max-w-[70%] 
                  flex items-start gap-3 p-3 rounded-lg border 
                  ${style.bg} ${style.color}
                  ${isSystem ? "text-xs py-1" : "shadow-lg"}
                `}>
                  {/* 图标 (如果是用户，图标在右边；其他人图标在左边) */}
                  {!isSystem && log.type !== "user" && (
                    <div className="mt-1 shrink-0 p-1 bg-black/40 rounded">{style.icon}</div>
                  )}

                  {/* 文本内容 */}
                  <div className="break-words leading-relaxed">
                    {!isSystem && <div className="text-[10px] opacity-40 mb-1 uppercase tracking-wider">{log.source}</div>}
                    <span className="whitespace-pre-wrap">{log.msg}</span>
                  </div>

                   {/* 用户图标放在右边 */}
                   {log.type === "user" && (
                    <div className="mt-1 shrink-0 p-1 bg-black/40 rounded">{style.icon}</div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* 思考中加载动画 */}
        {status === "PROCESSING" && (
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }}
               className="flex justify-start"
             >
                <div className="bg-yellow-900/10 border border-yellow-900/30 p-3 rounded-lg flex items-center gap-2 text-yellow-600 text-sm">
                   <Activity className="w-4 h-4 animate-spin" />
                   SARA IS THINKING...
                </div>
             </motion.div>
        )}
      </div>

      {/* 底部输入栏 */}
      <form onSubmit={handleSubmit} className="p-4 bg-black/80 backdrop-blur border-t border-green-900/50 z-20">
        <div className="flex gap-2 relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter command or message..."
            className="flex-1 bg-green-900/10 border border-green-800 p-4 rounded-lg text-green-100 placeholder-green-800 focus:outline-none focus:border-yellow-500 focus:bg-black transition-all pl-4"
          />
          <button 
            type="submit" 
            disabled={!input.trim()}
            className="absolute right-2 top-2 bottom-2 bg-green-800/20 hover:bg-yellow-600 hover:text-black text-green-500 p-3 rounded-md transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-green-500"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
