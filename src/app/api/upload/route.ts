import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs-extra';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const config = {
    api: {
      bodyParser: false,
    },
};

const genAI = new GoogleGenerativeAI("AIzaSyBd19nX9AsBMCUOS4aKjIrR0B4Ef7V2ZEA")

export default async function handler(
    req: NextApiRequest, 
    res: NextApiResponse
) {
    console.info("Generating caption ...");
    if (req.method === 'POST') {
        // Parse the incoming form data
        const form = new formidable.IncomingForm();
    
        form.parse(req, async (err, fields, files) => {
            if (err) {
                return res.status(500).json({ error: 'File upload failed' });
            }

            const file = files.image as formidable.File;

            // Read the file
            const fileBuffer = await fs.readFile(file.filepath);

            try {
                // Generate image description
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const describePrompt = "Describe this image in detail, capturing its key elements, colors, and mood.";
                
                const descriptionResult = await model.generateContent({
                    contents: [{ 
                        role: 'user', 
                        parts: [
                          { text: describePrompt },
                          { inlineData: { 
                            mimeType: file.mimetype || 'image/jpeg', 
                            data: fileBuffer.toString('base64') 
                          }}
                        ]
                      }]
                });

                // Generate social media caption
                const captionPrompt = `Create a catchy and engaging social media caption based on this image description: ${descriptionResult.response.text()}. 
                Make it suitable for platforms like Instagram or Twitter, using appropriate hashtags.`;
                
                const captionResult = await model.generateContent(captionPrompt);

                return res.status(200).json({
                    description: descriptionResult.response.text(),
                    caption: captionResult.response.text()
                });
            } catch(error) {
                console.error('Error processing image:', error);
                res.status(500).json({ 
                error: 'Failed to process image', 
                details: error instanceof Error ? error.message : 'Unknown error' 
                });
            }

        });
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}