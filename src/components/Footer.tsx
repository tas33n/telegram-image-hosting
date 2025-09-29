import React from "react";
import { Github, Mail, Send } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const githubUrl = "https://github.com/tas33n/telegram-image-hosting";
  const telegramHandle = "@lamb3rt";
  const email = "farhanisteak84@gmail.com";

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-8 text-center text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
          <div className="flex items-center justify-center gap-2">
            <span>&copy; {currentYear} Tas33n. All rights reserved.</span>
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <Send className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200">
              <Github className="w-4 h-4" />
              GitHub
            </a>
          </div>
        </div>
        <div className="space-y-2 text-xs">
          <p>Powered by Cloudflare & Telegram.</p>
          <p>Developed by <a href={githubUrl} className="font-medium hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200">Tas33n</a></p>
          <div className="flex items-center justify-center gap-4 pt-2">
            <a href={`mailto:${email}`} className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200">
              <Mail className="w-3 h-3" />
              {email}
            </a>
            <a href={`https://t.me/${telegramHandle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200">
              Telegram: {telegramHandle}
            </a>
          </div>
        </div>
        <div className="mt-4 text-xs opacity-75">
          <p>This project is open-source under the MIT License. Contributions are welcome on GitHub.</p>
        </div>
      </div>
    </footer>
  );
}