import { NextResponse } from 'next/server';

export async function GET() {
  const testHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Image Upload Test</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            text-align: center;
        }
        .upload-section {
            margin: 20px 0;
            padding: 20px;
            border: 2px dashed #ddd;
            border-radius: 8px;
            text-align: center;
        }
        input[type="file"] {
            margin: 10px 0;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        button {
            background: #007bff;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover {
            background: #0056b3;
        }
        button:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        .result {
            margin-top: 20px;
            padding: 15px;
            border-radius: 4px;
            display: none;
        }
        .success {
            background: #d4edda;
            border: 1px solid #c3e6cb;
            color: #155724;
        }
        .error {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
        }
        .uploaded-image {
            max-width: 300px;
            margin-top: 10px;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .file-info {
            background: #f8f9fa;
            padding: 10px;
            margin-top: 10px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 14px;
        }
        .loading {
            display: none;
            text-align: center;
            margin: 20px 0;
        }
        .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 2s linear infinite;
            margin: 0 auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🐾 Pet Portal - Image Upload Test</h1>

        <div class="upload-section">
            <h3>Upload Profile Image</h3>
            <p>Select an image file to test the upload API</p>
            <input type="file" id="imageFile" accept="image/*" />
            <br>
            <button onclick="uploadImage()">Upload Image</button>
        </div>

        <div class="loading" id="loading">
            <div class="spinner"></div>
            <p>Uploading...</p>
        </div>

        <div class="result" id="result"></div>
    </div>

    <script>
        async function uploadImage() {
            const fileInput = document.getElementById('imageFile');
            const resultDiv = document.getElementById('result');
            const loadingDiv = document.getElementById('loading');

            // Reset previous results
            resultDiv.style.display = 'none';
            resultDiv.className = 'result';

            // Validate file selection
            if (!fileInput.files || fileInput.files.length === 0) {
                showResult('Please select an image file first!', 'error');
                return;
            }

            const file = fileInput.files[0];

            // Validate file type
            if (!file.type.startsWith('image/')) {
                showResult('Please select a valid image file!', 'error');
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                showResult('File size must be less than 5MB!', 'error');
                return;
            }

            // Show loading
            loadingDiv.style.display = 'block';

            try {
                // Create FormData
                const formData = new FormData();
                formData.append('image', file);

                // Upload file
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                // Hide loading
                loadingDiv.style.display = 'none';

                if (response.ok) {
                    // Success
                    showResult(
                        \`✅ Upload successful!

                        <div class="file-info">
                            <strong>Filename:</strong> \${data.filename}<br>
                            <strong>URL:</strong> \${data.url}<br>
                            <strong>Size:</strong> \${formatFileSize(data.size)}<br>
                            <strong>Type:</strong> \${data.type}
                        </div>

                        <img src="\${data.url}" alt="Uploaded image" class="uploaded-image">
                        \`,
                        'success'
                    );
                } else {
                    // Error from server
                    showResult(\`❌ Upload failed: \${data.error || 'Unknown error'}\`, 'error');
                }

            } catch (error) {
                // Network or other error
                loadingDiv.style.display = 'none';
                showResult(\`❌ Upload failed: \${error.message}\`, 'error');
                console.error('Upload error:', error);
            }
        }

        function showResult(message, type) {
            const resultDiv = document.getElementById('result');
            resultDiv.innerHTML = message;
            resultDiv.className = \`result \${type}\`;
            resultDiv.style.display = 'block';
        }

        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        // Handle drag and drop
        const uploadSection = document.querySelector('.upload-section');
        const fileInput = document.getElementById('imageFile');

        uploadSection.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadSection.style.borderColor = '#007bff';
            uploadSection.style.backgroundColor = '#f8f9ff';
        });

        uploadSection.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadSection.style.borderColor = '#ddd';
            uploadSection.style.backgroundColor = 'transparent';
        });

        uploadSection.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadSection.style.borderColor = '#ddd';
            uploadSection.style.backgroundColor = 'transparent';

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                fileInput.files = files;
            }
        });
    </script>
</body>
</html>
  `;

  return new Response(testHtml, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}

export async function POST(request) {
  try {
    const body = await request.json();

    return NextResponse.json({
      message: 'Test endpoint received POST request',
      receivedData: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      message: 'Test endpoint - POST method available',
      note: 'Send JSON data to test this endpoint',
      timestamp: new Date().toISOString()
    });
  }
}