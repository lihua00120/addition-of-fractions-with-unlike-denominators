import React, { useState, useEffect } from 'react';
import { Palette, CheckCircle, RefreshCcw, AlertTriangle, Lightbulb, Trophy, Star } from 'lucide-react';

const App = () => {
  // --- State Management ---
  const [totalCells, setTotalCells] = useState(36);
  const [customInput, setCustomInput] = useState('');
  const [grid, setGrid] = useState(Array(36).fill(null));
  const [activeColor, setActiveColor] = useState('red');
  const [message, setMessage] = useState(null);

  // --- Constants ---
  const COLORS = {
    red: { id: 'red', name: '紅色', fraction: '1/3', hex: '#ef4444', hover: 'hover:bg-red-400', bg: 'bg-red-500' },
    blue: { id: 'blue', name: '藍色', fraction: '1/4', hex: '#3b82f6', hover: 'hover:bg-blue-400', bg: 'bg-blue-500' },
    yellow: { id: 'yellow', name: '黃色', fraction: '1/6', hex: '#eab308', hover: 'hover:bg-yellow-300', bg: 'bg-yellow-400' },
    green: { id: 'green', name: '綠色 (自由創作)', fraction: '剩餘', hex: '#22c55e', hover: 'hover:bg-green-400', bg: 'bg-green-500' }
  };

  const PRESETS = [
    { label: '36格 (6x6)', value: 36 },
    { label: '48格 (8x6)', value: 48 },
    { label: '64格 (8x8)', value: 64 },
    { label: '100格 (10x10)', value: 100 },
  ];

  // --- Derived State & Logic ---
  const isValidCanvas = totalCells % 12 === 0;
  
  const targets = {
    red: isValidCanvas ? totalCells / 3 : 0,
    blue: isValidCanvas ? totalCells / 4 : 0,
    yellow: isValidCanvas ? totalCells / 6 : 0,
  };

  const currentCounts = grid.reduce((acc, cellColor) => {
    if (cellColor) acc[cellColor] = (acc[cellColor] || 0) + 1;
    return acc;
  }, { red: 0, blue: 0, yellow: 0, green: 0 });

  const totalPainted = currentCounts.red + currentCounts.blue + currentCounts.yellow + currentCounts.green;

  // Determine grid columns based on total cells for a nice layout
  const getGridCols = (total) => {
    if (total === 12) return 4;
    if (total === 36) return 6;
    if (total === 48) return 8;
    if (total === 64) return 8;
    if (total === 100) return 10;
    return Math.ceil(Math.sqrt(total));
  };

  // --- Handlers ---
  useEffect(() => {
    // Reset grid when total cells change
    setGrid(Array(totalCells).fill(null));
    setMessage(null);
    
    // Check for challenge mode!
    if (totalCells === 12) {
      setMessage({
        type: 'challenge',
        title: '🏆 挑戰成功！',
        text: '太棒了！你發現了最小的畫布是 12 格！因為 12 是 3、4、6 的最小公倍數喔！'
      });
    }
  }, [totalCells]);

  const handlePresetClick = (val) => {
    setTotalCells(val);
    setCustomInput('');
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const val = parseInt(customInput, 10);
    if (val > 0 && val <= 400) {
      setTotalCells(val);
    } else {
      setMessage({ type: 'error', title: '哎呀！', text: '請輸入 1 到 400 之間的數字喔！' });
    }
  };

  const handleCellClick = (index) => {
    if (!isValidCanvas) return;
    
    const newGrid = [...grid];
    // Toggle color off if clicking the same color, otherwise apply active color
    if (newGrid[index] === activeColor) {
      newGrid[index] = null;
    } else {
      newGrid[index] = activeColor;
    }
    setGrid(newGrid);
    // Clear previous check messages when user continues painting
    if (message?.type !== 'challenge') {
      setMessage(null);
    }
  };

  const checkWork = () => {
    if (!isValidCanvas) return;

    if (currentCounts.red === targets.red && 
        currentCounts.blue === targets.blue && 
        currentCounts.yellow === targets.yellow) {
      setMessage({
        type: 'success',
        title: '🎉 太棒了！你完成了！',
        text: `你精準地畫出了指定的分數比例！\n
               🔴 紅色佔了 ${targets.red}/${totalCells} = 1/3 \n
               🔵 藍色佔了 ${targets.blue}/${totalCells} = 1/4 \n
               🟡 黃色佔了 ${targets.yellow}/${totalCells} = 1/6`
      });
    } else {
      // Find the specific error for a gentle hint
      let hint = '';
      if (currentCounts.red !== targets.red) {
        hint = `紅色的數量不太對喔！想想看 ${totalCells} 的 1/3 是多少格呢？`;
      } else if (currentCounts.blue !== targets.blue) {
        hint = `藍色的數量不太對喔！想想看 ${totalCells} 的 1/4 是多少格呢？`;
      } else if (currentCounts.yellow !== targets.yellow) {
        hint = `黃色的數量不太對喔！想想看 ${totalCells} 的 1/6 是多少格呢？`;
      }
      
      setMessage({
        type: 'error',
        title: '🤔 再檢查一下...',
        text: hint
      });
    }
  };

  const resetGrid = () => {
    setGrid(Array(totalCells).fill(null));
    if (message?.type !== 'challenge') {
      setMessage(null);
    }
  };

  // --- Render Helpers ---
  const renderMessage = () => {
    if (!message) return null;
    
    const styles = {
      success: 'bg-green-100 border-green-400 text-green-800',
      error: 'bg-amber-100 border-amber-400 text-amber-800',
      challenge: 'bg-yellow-100 border-yellow-500 text-yellow-900 shadow-yellow-200 shadow-lg'
    };

    return (
      <div className={`mt-6 p-4 rounded-xl border-2 ${styles[message.type]} animate-bounce-short`}>
        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
          {message.type === 'challenge' ? <Trophy className="text-yellow-600"/> : null}
          {message.title}
        </h3>
        <p className="whitespace-pre-line leading-relaxed">{message.text}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-sky-50 font-sans text-slate-800 pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 mb-6">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-center gap-3">
          <Palette className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-black text-slate-700 tracking-wider">分數像素畫設計師</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Controls & Stats */}
        <div className="md:col-span-4 space-y-6">
          
          {/* Canvas Selection */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border-2 border-slate-100">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-indigo-600">
              <span className="bg-indigo-100 p-1.5 rounded-lg"><Star className="w-5 h-5"/></span>
              選擇畫布大小
            </h2>
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              {PRESETS.map(preset => (
                <button
                  key={preset.value}
                  onClick={() => handlePresetClick(preset.value)}
                  className={`py-2 px-1 rounded-xl text-sm font-bold transition-all ${
                    totalCells === preset.value 
                      ? 'bg-indigo-500 text-white shadow-md scale-105' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleCustomSubmit} className="flex gap-2">
              <input 
                type="number" 
                min="1"
                max="400"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="自訂格數..."
                className="flex-1 px-3 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400"
              />
              <button type="submit" className="bg-slate-800 text-white px-4 py-2 rounded-xl font-bold hover:bg-slate-700 transition-colors">
                設定
              </button>
            </form>
          </div>

          {/* Challenge Mode Box */}
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-5 rounded-2xl shadow-sm border border-purple-200">
            <h3 className="font-bold text-purple-800 mb-2 flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              小挑戰！
            </h3>
            <p className="text-sm text-purple-900 leading-relaxed">
              能完整畫出 1/3、1/4、1/6 的「最小」畫布是幾格呢？試著在上面輸入看看吧！
            </p>
          </div>

          {/* Stats Board (Only show if valid canvas) */}
          {isValidCanvas && (
            <div className="bg-white p-5 rounded-2xl shadow-sm border-2 border-slate-100">
              <h2 className="text-xl font-bold mb-4 text-slate-700">任務進度</h2>
              <div className="space-y-4">
                {[
                  { key: 'red', icon: '🔴', target: targets.red },
                  { key: 'blue', icon: '🔵', target: targets.blue },
                  { key: 'yellow', icon: '🟡', target: targets.yellow }
                ].map(({ key, icon, target }) => (
                  <div key={key} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                    <span className="font-bold flex items-center gap-2 text-slate-600">
                      {icon} {COLORS[key].name} ({COLORS[key].fraction})
                    </span>
                    <span className={`font-mono font-bold text-lg ${currentCounts[key] === target ? 'text-green-500' : 'text-slate-500'}`}>
                      {currentCounts[key]} / {target}
                    </span>
                  </div>
                ))}
                
                <div className="pt-4 border-t-2 border-dashed border-slate-200">
                  <div className="flex justify-between items-center text-slate-600 font-bold">
                    <span>總共已塗色：</span>
                    <span className="font-mono text-lg">{totalPainted} / {totalCells}</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 rounded-full h-3 mt-2 overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${(totalPainted / totalCells) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Canvas & Tools */}
        <div className="md:col-span-8 flex flex-col gap-6">
          
          {/* Validation Warning */}
          {!isValidCanvas ? (
            <div className="bg-rose-100 border-4 border-rose-300 rounded-3xl p-10 flex flex-col items-center justify-center text-center h-full">
              <AlertTriangle className="w-20 h-20 text-rose-500 mb-6 animate-pulse" />
              <h2 className="text-2xl font-black text-rose-700 mb-4">無法平分喔！</h2>
              <p className="text-lg text-rose-800 max-w-md">
                你選擇的 <strong>{totalCells} 格</strong> 畫布無法完整呈現 1/3、1/4 和 1/6 的分數。
                <br/><br/>
                提示：畫布格數必須是 3、4、6 的公倍數才能切得剛剛好喔！請試試看其他格數。
              </p>
            </div>
          ) : (
            <>
              {/* Palette */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border-2 border-slate-100 flex flex-wrap justify-center gap-4">
                {Object.values(COLORS).map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setActiveColor(color.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
                      activeColor === color.id 
                        ? 'ring-4 ring-offset-2 ring-indigo-400 scale-105 shadow-lg' 
                        : 'opacity-70 hover:opacity-100 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-md ${color.bg} shadow-sm`}></div>
                    <span className="text-slate-700">{color.name}</span>
                  </button>
                ))}
              </div>

              {/* Grid Canvas */}
              <div className="bg-white p-6 rounded-3xl shadow-md border-4 border-slate-200 flex flex-col items-center">
                <div 
                  className="grid gap-1 bg-slate-200 p-2 rounded-xl"
                  style={{ 
                    gridTemplateColumns: `repeat(${getGridCols(totalCells)}, minmax(0, 1fr))`,
                    width: '100%',
                    maxWidth: '600px'
                  }}
                >
                  {grid.map((cellColor, index) => (
                    <div
                      key={index}
                      onClick={() => handleCellClick(index)}
                      className={`
                        aspect-square rounded-sm cursor-pointer transition-colors duration-200
                        ${cellColor ? COLORS[cellColor].bg : 'bg-white hover:bg-slate-100'}
                        ${activeColor ? COLORS[activeColor].hover : ''}
                        border border-slate-200/50 shadow-sm
                      `}
                    />
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                <button 
                  onClick={checkWork}
                  className="flex items-center gap-2 bg-green-500 text-white px-8 py-4 rounded-2xl font-black text-xl hover:bg-green-600 hover:-translate-y-1 shadow-lg transition-all"
                >
                  <CheckCircle className="w-6 h-6" />
                  檢查作品
                </button>
                <button 
                  onClick={resetGrid}
                  className="flex items-center gap-2 bg-slate-200 text-slate-600 px-6 py-4 rounded-2xl font-bold text-lg hover:bg-slate-300 hover:-translate-y-1 shadow-md transition-all"
                >
                  <RefreshCcw className="w-5 h-5" />
                  重新開始
                </button>
              </div>

              {/* Result/Hint Message */}
              {renderMessage()}
            </>
          )}

        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes bounce-short {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-short {
          animation: bounce-short 0.5s ease-in-out;
        }
      `}} />
    </div>
  );
};

export default App;