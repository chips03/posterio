"use client";
import { useState, ChangeEvent, useRef, useEffect } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import 'bootstrap/dist/css/bootstrap.min.css'
import { ImageIcon, SparklesIcon, ClipboardCopyIcon } from 'lucide-react'
import DOMPurify from "dompurify";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [imageAspectRatio, setImageAspectRatio] = useState(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [generatedText, setGeneratedText] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [mimeType, setMimeType] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0]
      setSelectedFile(file)
      setMimeType(file.type)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsLoading(true)
    setGeneratedText('')
      
    console.log("mimetype = " + mimeType);
    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      // Simulated API call
      // await new Promise(resolve => setTimeout(resolve, 2000))
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setDescription(data.description);
      setGeneratedText(data.caption);
    } catch (error) {
      console.error('Error generating text:', error)
      setGeneratedText('An error occurred while generating text.')
    } finally {
      setIsLoading(false)
    }
  }

  // Determine dynamic container classes based on aspect ratio
  const getImageContainerClasses = () => {
    if (!imageAspectRatio) return 'h-72'; // default height

    // Wide images
    if (imageAspectRatio > 1.5) return 'h-96';
    
    // Square or near-square images
    if (imageAspectRatio >= 0.8 && imageAspectRatio <= 1.2) return 'h-96';
    
    // Tall images
    return 'h-[30rem]';
  };

  const HtmlRenderer = ( { htmlString }: { htmlString: string } ) => {
    const sanitizedHtml = DOMPurify.sanitize(htmlString);
    return (
      <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
    );
  };

  return (
    <div className="container min-vh-100 d-flex flex-column justify-content-center">
      <Head>
        <title>Posterio</title>
        <meta name="description" content="Generate post text from images" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <h1 className="text-center mb-1">AI Caption Generator</h1>
          <h5 className="text-center mb-4">( Max. file size is 5 MB )</h5>

          <div className="card shadow-sm">
            <div className="card-body">
              <div className="mb-3">
                <input
                  type="file"
                  ref = {fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                  id="fileInput"
                />
                <div 
                  onClick={() =>{ if (fileInputRef.current) fileInputRef.current.click() }}
                  className = {`border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 transition relative overflow-hidden ${getImageContainerClasses()}`}
                >
                  {previewUrl ? (
                    
                    // <Image className="w-full h-full object-cover rounded-lg" src={previewUrl} alt="Uploaded image" width={0} height={0} 
                    // style={{ width: '100%', height: 'auto' }}
                    // objectFit="contain" />

                    <img 
                    src={previewUrl} 
                    alt="uploaded" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                   
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="mx-auto mb-2 text-gray-400" size={40} />
                      <div className="text-gray-600">Click to Upload Image</div>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleUpload}
                disabled={!selectedFile || isLoading}
                className="w-full bg-blue-500 text-white py-2 rounded-lg flex items-center justify-center mb-4 
                hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>

          {generatedText && (
            <div className="card mt-4 shadow-sm">
              <div className="card-body">
                <h2 className="card-title h5">Caption</h2>
                <p className="card-text"><HtmlRenderer htmlString={generatedText} /></p>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
