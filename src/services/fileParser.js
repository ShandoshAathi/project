import * as pdfjsLib from 'pdfjs-dist';

// Use a CDN for the worker to avoid Vite build configuration issues
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

/**
 * Extracts text from a PDF file.
 * We limit to the first 30 pages to prevent memory issues and Groq token limits.
 */
export async function extractTextFromPDF(file, maxPages = 30) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const numPages = Math.min(pdf.numPages, maxPages);
    let fullText = '';

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }

    // Limit to roughly 50,000 characters to stay well within token limits and localStorage limits
    return fullText.slice(0, 50000);
  } catch (error) {
    console.error("PDF Parsing Error:", error);
    throw new Error("Failed to extract text from PDF. Ensure it is a valid, readable PDF.");
  }
}

/**
 * Scrapes text from a public URL using an open proxy (allorigins) to bypass CORS.
 * Warning: Will not work for secure Google Drive links or authenticated pages.
 */
export async function fetchTextFromURL(url) {
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    if (!response.ok) throw new Error("Network response was not ok");
    
    const data = await response.json();
    const htmlString = data.contents;
    
    // Very basic HTML to text extraction
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    
    // Remove scripts and styles
    doc.querySelectorAll('script, style').forEach(el => el.remove());
    
    const text = doc.body ? doc.body.textContent : '';
    // Clean up excessive whitespace
    const cleanText = text.replace(/\s+/g, ' ').trim();
    
    // Limit to 50,000 characters
    return cleanText.slice(0, 50000);
  } catch (error) {
    console.error("URL Fetching Error:", error);
    throw new Error("Failed to fetch content from the URL. The site might block scrapers.");
  }
}
