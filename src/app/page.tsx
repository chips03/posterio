"use client";
import { useState, ChangeEvent } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import 'bootstrap/dist/css/bootstrap.min.css'

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [generatedText, setGeneratedText] = useState<string>('')

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0]
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsLoading(true)
    setGeneratedText('')

    try {
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      setGeneratedText("This is a sample generated text based on the uploaded image. Replace this with actual API response.")
    } catch (error) {
      console.error('Error generating text:', error)
      setGeneratedText('An error occurred while generating text.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container min-vh-100 d-flex flex-column justify-content-center">
      <Head>
        <title>Posterio</title>
        <meta name="description" content="Generate post text from images" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <h1 className="text-center mb-4">Image to Caption</h1>

          <div className="card shadow-sm">
            <div className="card-body">
              <div className="mb-3">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="form-control"
                  id="fileInput"
                />
              </div>

              {previewUrl && (
                <div className="mb-3 text-center">
                  <Image className="mx-auto" src={previewUrl} alt="Uploaded image" width={0} height={0} 
                  style={{ width: '100%', height: 'auto' }}
                  objectFit="contain" />
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={!selectedFile || isLoading}
                className="btn btn-dark w-100"
              >
                {isLoading ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>

          {generatedText && (
            <div className="card mt-4 shadow-sm">
              <div className="card-body">
                <h2 className="card-title h5">Generated Text</h2>
                <p className="card-text">{generatedText}</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
