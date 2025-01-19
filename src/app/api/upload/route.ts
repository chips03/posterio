import { NextResponse, NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const config = {
    api: {
      bodyParser: false,
    },
};

const genAI = new GoogleGenerativeAI("YOUR-GEMINI-API-KEY")

export async function POST(req: NextRequest) {
    console.log("Generating caption ... ");
    
    const formData = await req.formData()
    const file = formData.get('image') as Blob

    // Read the file
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    
    try {
        // Generate image description
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // const describePrompt = "Describe this image in detail, capturing its key elements, colors, and mood.";
        const describePrompt = "Jelaskan gambar ini secara detail, ambil elemen utama, warna, dan mood.";
        
        const descriptionResult = await model.generateContent({
            contents: [{ 
                role: 'user', 
                parts: [
                  { text: describePrompt },
                  { inlineData: { 
                    mimeType: 'image/jpeg', 
                    data: fileBuffer.toString('base64') 
                  }}
                ]
              }]
        });

        // Generate social media caption
        // const captionPrompt = `Create a catchy and engaging social media caption based on this image description: ${descriptionResult.response.text()}. 
        // Make it suitable for platforms like Instagram or Twitter, using appropriate hashtags.`;

        const captionPrompt = `Buat teks media sosial yang menarik dan memikat berdasarkan deskripsi gambar ini: ${descriptionResult.response.text()}. Gunakan tagar yang sesuai untuk platform seperti Instagram atau Twitter.`;

        const captionResult = await model.generateContent(captionPrompt);

        return NextResponse.json({
            description: descriptionResult.response.text(),
            caption: captionResult.response.text()
        });
    } catch(error) {
        console.error('Error processing image:', error);
        NextResponse.json({ 
            error: 'Failed to process image', 
            details: error instanceof Error ? error.message : 'Unknown error',
            status: 500
        });
    }
}