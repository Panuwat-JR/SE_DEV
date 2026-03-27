import React from 'react';
import { AlertCircle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'เกิดข้อผิดพลาดที่ไม่คาดคิด' };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-24 text-center px-8">
          <AlertCircle size={40} className="text-red-400 mb-3" />
          <p className="text-gray-700 font-semibold">เกิดข้อผิดพลาดในส่วนนี้</p>
          <p className="text-gray-400 text-sm mt-1 max-w-md">{this.state.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, message: '' })}
            className="mt-5 px-4 py-2 text-sm font-medium bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors"
          >
            ลองใหม่
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
