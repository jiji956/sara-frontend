"use client";

import React, { useState, useEffect } from "react";
import { Terminal, Shield, Zap, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function LifeHUD() {
  const [input, setInput] = useState("");
  // --- 修复点：添加 <any[]> 类型定义 ---
  const [logs, setLogs] = useState<any[]>([]);
  const [status, setStatus] = useState("IDLE");
  const [battery, setBattery] = useState(100);

  useEffect(() => {
    setLogs([
      { source: "SYS", msg: "BIO-LINK ESTABLISHED...", color: "text-green-500" },
      { source: "MEM", msg: "LOADING CONSTITUTION...", color: "text-blue-500" },
      { source: "SARA", msg: "WATCHING.", color: "text-yellow-500" },
    ]);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setLogs(prev => [...prev, { source: "USER", msg: userMsg, color: "text-white" }]);
    setInput("");
    setStatus("PROCESSING");

    try {
      // 指向 Render 云端
      const res = await fetch("https://sara-backend-gxr7.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      
      const data = await res.json();
      
      if (data.response) {
        setLogs(prev => [...prev, { source: "SARA", msg: data.response, color: "text-yellow-400" }]);
      } else if (data.error) {
         setLogs(prev => [...prev, { source: "ERR", msg: data.error, color: "text-red-500" }]);
      }

    } catch (err) {
      setLogs(prev => [...prev, { source: "ERR", msg: "CLOUD CONNECTION FAILED", color: "text-red-600" }]);
    }
    setStatus("IDLE");
  };

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-4 flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,18,0.8)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />

      <div className="flex justify-between items-center border-b border-green-900/50 pb-4 mb-4 z-10">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-yellow-500" />
          <span className="text-xl font-bold tracking-widest text-yellow-500">SARA_OS <span className="text-xs align-top opacity-50">v1.0 (CLOUD)</span></span>
        </div>
        <div className="flex gap-4 text-xs">
            <div className="flex items-center gap-1"><Activity className="w-4 h-4" /> CPU: 12%</div>
            <div className="flex items-center gap-1"><Zap className="w-4 h-4 text-yellow-400" /> PWR: {battery}%</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 mb-4 p-4 border border-green-900/30 rounded bg-black/50 backdrop-blur-sm z-10 scrollbar-hide">
        {logs.map((log, i) => (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex gap-3 ${log.color}`}
          >
            <span className="opacity-50">[{new Date().toLocaleTimeString()}]</span>
            <span className="font-bold">[{log.source}]</span>
            <span className="whitespace-pre-wrap">{log.msg}</span>
          </motion.div>
        ))}
        {status === "PROCESSING" && (
             <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1 }} className="text-yellow-500">
               [SARA] ACCESSING CLOUD BRAIN...
             </motion.div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 z-10">
        <div className="flex items-center justify-center bg-green-900/20 p-2 rounded">
            <Terminal className="w-5 h-5" />
        </div>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="UPLINK ESTABLISHED. AWAITING INPUT..."
          className="flex-1 bg-black border border-green-800 p-3 rounded text-green-400 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all"
        />
        <button type="submit" className="bg-green-900/30 border border-green-700 hover:bg-green-800/50 text-green-400 px-6 py-2 rounded font-bold transition-all uppercase">
          Send
        </button>
      </form>
    </div>
  );
}
