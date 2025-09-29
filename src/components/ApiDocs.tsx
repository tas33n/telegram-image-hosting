import React, { useState } from 'react';
import { Code, Copy, Check, Key, Upload, FileText, Info } from 'lucide-react';

export function ApiDocs() {
  const [copiedCode, setCopiedCode] = useState<string>('');

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const CodeBlock = ({ code, language, id }: { code: string; language: string; id: string }) => (
    <div className="relative bg-gray-900 dark:bg-gray-800 border border-gray-700 dark:border-gray-600 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between bg-gray-800 dark:bg-gray-900 text-white px-4 py-2">
        <span className="text-sm font-medium">{language}</span>
        <button
          onClick={() => copyToClipboard(code, id)}
          className="flex items-center space-x-1 text-gray-300 hover:text-white transition-colors duration-200"
        >
          {copiedCode === id ? (
            <>
              <Check className="w-4 h-4" />
              <span className="text-sm">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span className="text-sm">Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-gray-100 dark:text-gray-200 text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );

  const curlExample = `curl -X POST https://your-domain.com/api/upload \\
  -H "X-API-Key: your-api-key-here" \\
  -F "file=@/path/to/your/image.jpg"`;

  const jsExample = `const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('https://your-domain.com/api/upload', {
  method: 'POST',
  headers: {
    'X-API-Key': 'your-api-key-here'
  },
  body: formData
});

const result = await response.json();
console.log(result.url); // Your hosted image URL`;

  const pythonExample = `import requests

url = "https://your-domain.com/api/upload"
headers = {"X-API-Key": "your-api-key-here"}

with open("image.jpg", "rb") as file:
    files = {"file": file}
    response = requests.post(url, headers=headers, files=files)
    
result = response.json()
print(result["url"])  # Your hosted image URL`;

  const responseExample = `{
  "success": true,
  "url": "https://your-domain.com/file/abc123def456.jpg",
  "filename": "abc123def456.jpg",
  "originalName": "my-image.jpg",
  "size": 1024000,
  "uploadedAt": 1640995200000,
  "method": "API"
}`;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Code className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            API Documentation
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Integrate Telegram Image Hosting into your applications with our simple REST API.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Authentication */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transition-colors duration-200">
            <div className="flex items-center space-x-3 mb-6">
              <Key className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Authentication</h2>
            </div>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <p className="text-yellow-800 dark:text-yellow-200">
                  <strong>API Key Required:</strong> Contact the administrator to get your API key.
                </p>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-4">
              All API requests require authentication using an API key. Include your API key in the request headers:
            </p>
            
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 font-mono text-sm text-gray-900 dark:text-gray-200">
              X-API-Key: your-api-key-here
            </div>
          </div>

          {/* Upload Endpoint */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transition-colors duration-200">
            <div className="flex items-center space-x-3 mb-6">
              <Upload className="w-6 h-6 text-green-600 dark:text-green-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload File</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Endpoint</h3>
                <div className="bg-green-100 dark:bg-green-900/20 rounded-lg p-3 font-mono text-sm text-gray-900 dark:text-gray-200">
                  POST /api/upload
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Content-Type</h3>
                <div className="bg-blue-100 dark:bg-blue-900/20 rounded-lg p-3 font-mono text-sm text-gray-900 dark:text-gray-200">
                  multipart/form-data
                </div>
              </div>
            </div>

            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Parameters</h3>
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Parameter</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Required</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 font-mono text-sm text-gray-900 dark:text-white">file</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white">File</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white">Yes</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white">Image or video file (max 5MB)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Supported File Types</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Images</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• JPEG (.jpg, .jpeg)</li>
                  <li>• PNG (.png)</li>
                  <li>• GIF (.gif)</li>
                  <li>• WebP (.webp)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Videos</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• MP4 (.mp4)</li>
                  <li>• WebM (.webm)</li>
                  <li>• QuickTime (.mov)</li>
                </ul>
              </div>
            </div>

            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Response</h3>
            <CodeBlock code={responseExample} language="JSON" id="response" />
          </div>

          {/* Code Examples */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transition-colors duration-200">
            <div className="flex items-center space-x-3 mb-6">
              <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Code Examples</h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">cURL</h3>
                <CodeBlock code={curlExample} language="bash" id="curl" />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">JavaScript</h3>
                <CodeBlock code={jsExample} language="javascript" id="js" />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Python</h3>
                <CodeBlock code={pythonExample} language="python" id="python" />
              </div>
            </div>
          </div>

          {/* Error Codes */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transition-colors duration-200">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Error Codes</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status Code</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Error</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Description</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 font-mono text-sm text-gray-900 dark:text-white">400</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white">Bad Request</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white">No file uploaded or invalid file type</td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 font-mono text-sm text-gray-900 dark:text-white">401</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white">Unauthorized</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white">Invalid or missing API key</td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 font-mono text-sm text-gray-900 dark:text-white">413</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white">Payload Too Large</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white">File size exceeds 5MB limit</td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 font-mono text-sm text-gray-900 dark:text-white">500</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white">Internal Server Error</td>
                    <td className="border border-gray-300 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white">Server error during upload</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Rate Limits */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transition-colors duration-200">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Rate Limits & Guidelines</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Limits</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>• Maximum file size: 5MB</li>
                  <li>• Rate limit: 30 uploads/hour (anonymous), 200/hour (API key)</li>
                  <li>• Files are stored permanently</li>
                  <li>• No authentication required for file access</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Best Practices</h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li>• Optimize images before upload</li>
                  <li>• Use appropriate file formats</li>
                  <li>• Store returned URLs securely</li>
                  <li>• Handle errors gracefully</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}