import { useState } from 'react';
import { Trash2, Info, Shield, GitBranch, X } from 'lucide-react';
import { PageContainer } from '../components/PageContainer';
import { useTodoStore } from '../stores/todoStore';

export function SettingsPage() {
  const { clearAllData, getAllDatesWithTodos, getTotalCount } = useTodoStore();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  const datesWithTodos = getAllDatesWithTodos();
  const totalTodos = datesWithTodos.reduce((sum, dateStr) => sum + getTotalCount(dateStr), 0);

  const handleClearData = () => {
    clearAllData();
    setShowConfirmDialog(false);
  };

  return (
    <PageContainer>
      <header className="px-4 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">设置</h1>
      </header>

      <main className="px-4 space-y-4">
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-medium text-gray-800">数据统计</h2>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">有记录的天数</span>
              <span className="font-semibold text-gray-800">{datesWithTodos.length} 天</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">待办总数</span>
              <span className="font-semibold text-gray-800">{totalTodos} 条</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-medium text-gray-800">数据管理</h2>
          </div>
          <div className="p-2">
            <button
              onClick={() => setShowConfirmDialog(true)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">清除所有数据</p>
                  <p className="text-sm text-gray-500">删除本地存储的所有待办记录</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="font-medium text-gray-800">关于</h2>
          </div>
          <div className="p-2 space-y-1">
            <button className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">隐私说明</p>
                  <p className="text-sm text-gray-500">数据仅存储在本地</p>
                </div>
              </div>
            </button>
            
            <button className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                  <Info className="w-5 h-5 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">版本信息</p>
                  <p className="text-sm text-gray-500">v1.0.0</p>
                </div>
              </div>
            </button>
            
            <button className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center">
                  <GitBranch className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">源码地址</p>
                  <p className="text-sm text-gray-500">GitHub</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </main>

      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm overflow-hidden">
            <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">确认清除</h3>
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="px-4 py-4">
              <p className="text-gray-600 mb-4">
                确定要清除所有待办数据吗？此操作无法撤销。
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleClearData}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  确认清除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
