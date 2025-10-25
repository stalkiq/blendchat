'use client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowUp, Plus } from 'lucide-react';
import { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';

interface ChatPageProps {
  newChatUsers?: any[];
}

export default function ChatPage({ newChatUsers = [] }: ChatPageProps) {
  const [message, setMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      alert('Please type something first');
      return;
    }
    
    if (isGenerating) {
      return;
    }

    setIsGenerating(true);

    try {
      // Create PDF
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text('Your Document', 20, 20);
      
      // Add date
      doc.setFontSize(10);
      doc.text(`Created: ${new Date().toLocaleString()}`, 20, 30);
      
      // Add content
      doc.setFontSize(12);
      const lines = doc.splitTextToSize(message, 170);
      doc.text(lines, 20, 45);
      
      // Download PDF
      const fileName = `document-${Date.now()}.pdf`;
      doc.save(fileName);
      
      // Clear the input
      setMessage('');
      alert('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-full flex-col items-center justify-center bg-black p-6">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-red-100 text-center mb-4">PDF Generator</h1>
        <p className="text-red-300/70 text-center mb-8">Type anything and we'll convert it to a PDF</p>
        
        <form onSubmit={handleSubmit} className="rounded-2xl border-2 border-red-900 bg-[#1a0b0b] shadow-2xl overflow-hidden">
          <div className="relative p-4">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your content here..."
              className="min-h-[200px] bg-transparent border-0 text-red-50 placeholder:text-red-200/40 pl-12 pr-12 py-3 resize-none focus-visible:ring-0 focus-visible:ring-offset-0"
              required
              disabled={isGenerating}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              size="icon"
              disabled={isGenerating || !message.trim()}
              className="absolute right-6 bottom-6 rounded-lg h-10 w-10 bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>

            {/* Plus Button */}
            <div className="absolute left-6 bottom-6 flex items-center justify-center rounded-lg border border-red-800/50 h-8 w-8 bg-red-950/50">
              <Plus className="h-4 w-4 text-red-300" />
            </div>
          </div>
        </form>

        <p className="text-center text-xs text-red-300/50 mt-4">
          {isGenerating ? 'Generating PDF...' : 'Click the arrow to generate PDF'}
        </p>
      </div>
    </div>
  );
}
