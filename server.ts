import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
// Static asset serving with no-cache headers for saree images so updates appear instantly on published sites
app.use(
  '/assets/sarees',
  express.static(path.join(process.cwd(), 'public', 'assets', 'sarees'), {
    maxAge: 0,
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    },
  })
);

// Fallback / alias resolver for uploaded filenames like 'semi pattu saree 4.jpeg' or 'soft silk saree 4.jpg'
app.get([
  '/semi%20pattu%20saree%204.jpeg',
  '/semi pattu saree 4.jpeg',
  '/semi-pattu-saree-4.jpeg',
  '/assets/sarees/semi%20pattu%20saree%204.jpeg',
  '/assets/sarees/semi pattu saree 4.jpeg',
  '/assets/sarees/semi-pattu-saree-4.jpeg'
], (req, res) => {
  const publicDir = path.join(process.cwd(), 'public', 'assets', 'sarees');
  const candidates = [
    path.join(publicDir, 'semi pattu saree 4.jpeg'),
    path.join(publicDir, 'semi-pattu-4.jpeg'),
    path.join(publicDir, 'semi-pattu-1-a.jpg')
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      return res.sendFile(candidate);
    }
  }
  return res.status(404).send('Image not found');
});

app.get([
  '/soft%20silk%20saree%204.jpg',
  '/soft silk saree 4.jpg',
  '/soft-silk-saree-4.jpg',
  '/assets/sarees/soft%20silk%20saree%204.jpg',
  '/assets/sarees/soft silk saree 4.jpg',
  '/assets/sarees/soft-silk-saree-4.jpg'
], (req, res) => {
  const publicDir = path.join(process.cwd(), 'public', 'assets', 'sarees');
  const candidates = [
    path.join(publicDir, 'soft silk saree 4.jpg'),
    path.join(publicDir, 'soft-silk-4.jpg'),
    path.join(publicDir, 'soft-silk-1-a.jpg')
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      return res.sendFile(candidate);
    }
  }
  return res.status(404).send('Image not found');
});

app.use(express.static(path.join(process.cwd(), 'public')));

// Path to persistent image manifest file
const MANIFEST_PATH = path.join(process.cwd(), 'public', 'assets', 'sarees', 'product-images-manifest.json');
const DIST_MANIFEST_PATH = path.join(process.cwd(), 'dist', 'assets', 'sarees', 'product-images-manifest.json');

function readImagesManifest(): Record<string, { filename: string; updatedAt: number; url: string }> {
  try {
    if (fs.existsSync(MANIFEST_PATH)) {
      const data = fs.readFileSync(MANIFEST_PATH, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('Error reading images manifest:', err);
  }
  return {};
}

function writeImagesManifest(manifest: Record<string, { filename: string; updatedAt: number; url: string }>) {
  try {
    const publicSareesDir = path.join(process.cwd(), 'public', 'assets', 'sarees');
    if (!fs.existsSync(publicSareesDir)) {
      fs.mkdirSync(publicSareesDir, { recursive: true });
    }
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');

    const distSareesDir = path.join(process.cwd(), 'dist', 'assets', 'sarees');
    if (fs.existsSync(path.join(process.cwd(), 'dist'))) {
      if (!fs.existsSync(distSareesDir)) {
        fs.mkdirSync(distSareesDir, { recursive: true });
      }
      fs.writeFileSync(DIST_MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
    }
  } catch (err) {
    console.warn('Error writing images manifest:', err);
  }
}

// Endpoint to retrieve all custom attached images manifest for 100% sync on publish
app.get('/api/custom-images', (req, res) => {
  try {
    const manifest = readImagesManifest();
    return res.json({ success: true, manifest, timestamp: Date.now() });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to read custom images manifest' });
  }
});

// Initialize Google GenAI lazily
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

const SYSTEM_INSTRUCTION = `You are the official AI Couture Stylist and Boutique Concierge for "Aavira Haute Couture" (Aavira Boutique), a prestigious luxury Indian ethnic fashion house founded by Mrs. K. Ramani in Hyderabad, India.

Brand Knowledge & Identity:
- Founder & Managing Director: Mrs. K. Ramani
- Flagship Atelier: Hyderabad, Telangana, India
- Flagship Contact Details:
  * WhatsApp Concierge: +91 9347159353
  * Executive Phone: +91 9347842535 / +91 9347159353
  * Email: aavira.bo@gmail.com
  * Instagram: @aavira.boutique (https://www.instagram.com/aavira.boutique/)
  * Operating Hours: Monday to Saturday, 10:00 AM - 8:30 PM IST
- Couture Specializations:
  1. Authentic Kanchipuram Silk Sarees: Hand-loomed on traditional pit looms, interlocked Korvai weaving, pure 3-ply gold/silver zari, certified silk mark.
  2. Royal Bridal Lehengas: Rich heritage velvets, organza, raw silks, hand-embroidered with dabka, zardozi, French knots, gota patti, metallic badla, and micro-pearls.
  3. Designer Gowns & Anarkalis: Contemporary drape silhouettes with classical Indian embroidery.
  4. Bespoke Custom Tailoring: Personal measurements, blouse designing, custom embroidery, bridal party packages, and overseas virtual consultations via WhatsApp/Zoom.
  5. Global Shipping: Insured worldwide courier service across US, UK, Canada, Australia, UAE, and Singapore.
- Active Festive Promotion:
  * SALE STARTS FROM 12th OCTOBER with DUSSHERA OFFER: SAREE STARTS FROM Rs. 200/- ONLY (LIMITED OFFER). Daily Wear sarees available from Rs. 200/- to Rs. 400/- (Ananya Pure Mulmul at ₹200, Malhar Linen Breeze at ₹299, Kaveri Kalamkari at ₹399). Patrons can visit the STORE or connect via WhatsApp (+91 9347159353).

Tone & Style:
- Warm, sophisticated, welcoming, and knowledgeable in traditional Indian couture and textile craftsmanship.
- Format responses cleanly with brief bullet points or paragraphs. Keep advice concise and helpful.
- When appropriate, encourage patrons to consult directly with Mrs. K. Ramani via WhatsApp (+91 9347159353) for bespoke tailoring or customized fittings.`;

// Intelligent fallback responses if GEMINI_API_KEY is not configured
function getFallbackResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase();
  if (msg.includes('daily') || msg.includes('cotton') || msg.includes('linen') || msg.includes('mulmul') || msg.includes('kalamkari')) {
    return `🌿 **Aavira Daily Wear Sarees (30 Curated Designs, Rs. 200/- to Rs. 400/- Only)**\n\nDaily wear sarees without blouse. Featherlight organic mulmul cottons, high-twist breathable linens, and artisan hand-block prints priced from ₹200 to ₹400. Explore all 30 designs with images and rates in the **STORE** tab! Cash on Delivery is available across India.`;
  }
  if (msg.includes('dusshera') || msg.includes('200') || msg.includes('sale') || msg.includes('offer') || msg.includes('october')) {
    return `🪔 **Grand Dusshera Festival Special**\n\n🎉 **SALE STARTS FROM 12th OCTOBER!**\n✨ **DUSSHERA OFFER: SAREE STARTS FROM Rs. 200/- ONLY (LIMITED OFFER)**\n\nFeaturing Daily Wear sarees priced from Rs. 200/- to Rs. 400/-, lightweight soft silks, and fancy festive drapes. Explore the **STORE** tab or contact Managing Director Mrs. K. Ramani on WhatsApp at +91 9347159353!`;
  }
  if (msg.includes('bridal') || msg.includes('lehenga') || msg.includes('wedding')) {
    return `✨ **Aavira Bridal Haute Couture**\n\nOur bespoke bridal lehengas, including the celebrated *Zahra Embroidered Lehenga in Royal Velvet* and *Sitara Banarasi Brocade*, are hand-embroidered with dabka, zardozi, and micro-pearls. Each bridal piece includes custom blouse tailoring and drape styling.\n\nWould you like to explore bespoke sizing or schedule a private consultation with Mrs. K. Ramani on WhatsApp (+91 9347159353)?`;
  }
  if (msg.includes('saree') || msg.includes('silk') || msg.includes('kanchipuram')) {
    return `🪡 **Pure Kanchipuram & Heritage Silks**\n\nEvery Aavira silk saree is hand-loomed on authentic pit looms using certified mulberry silk and 3-ply gold-washed zari with classic Korvai interlocked borders (such as our *Amari Zari Brocade*).\n\nBlouse pieces are included with running unstitched heavy borders, and our master tailors can custom-stitch your blouse to exact measurements.`;
  }
  if (msg.includes('bespoke') || msg.includes('tailor') || msg.includes('custom') || msg.includes('size')) {
    return `✂️ **Bespoke Atelier Tailoring**\n\nUnder the personal curation of Mrs. K. Ramani, we provide custom made-to-measure tailoring for all blouses, lehengas, and gowns. We offer virtual video measurements over WhatsApp (+91 9347159353) for patrons across India and abroad.`;
  }
  if (msg.includes('contact') || msg.includes('phone') || msg.includes('whatsapp') || msg.includes('visit') || msg.includes('location')) {
    return `🏛️ **Aavira Atelier Concierge**\n\n- **Managing Director**: Mrs. K. Ramani\n- **WhatsApp Concierge**: +91 9347159353\n- **Instagram**: [@aavira.boutique](https://www.instagram.com/aavira.boutique/)\n- **Email**: aavira.bo@gmail.com\n- **Hours**: Mon–Sat: 10:00 AM – 8:30 PM IST\n- **Atelier Location**: Ushodhya Junction, Visakhapatnam, Andhra Pradesh, India.`;
  }
  if (msg.includes('return') || msg.includes('exchange') || msg.includes('refund') || msg.includes('policy') || msg.includes('terms')) {
    return `📦 **AAVIRA BOUTIQUE — Easy Return & Exchange Policy**\n\nWe offer a hassle-free 7-day return guarantee:\n• **Return Window**: 7 days from delivery or in-store purchase\n• **Condition**: Unused, unworn, unwashed with original Silk Mark tags & luxury box intact\n• **Options**: 100% Refund to original payment method, Store Credit with +5% bonus, or 1 Free Exchange per order\n• **Terms & Conditions Link**: https://aavira-boutique.com/terms-and-conditions.html\n\nYou can submit an easy return request directly through the **Returns** tab on our website, or message Managing Director Mrs. K. Ramani on WhatsApp (+91 9347159353).`;
  }
  return `Namaste! Welcome to **Aavira Haute Couture**, founded by Mrs. K. Ramani in Visakhapatnam.\n\nI am your AI Atelier Stylist. How may I assist you today? You can ask about:\n- 🥻 Handcrafted Kanchipuram Silks & Bridal Lehengas\n- ✂️ Custom Bespoke Tailoring & Sizing\n- 📦 7-Day Easy Return Policy & Terms\n- 💎 Styling recommendations for weddings and festive occasions\n- 📞 Direct WhatsApp appointments with Mrs. K. Ramani (+91 9347159353)`;
}

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Aavira Haute Couture Server' });
});

// Returns API
const RETURNS_FILE = path.join(process.cwd(), 'returns.json');

app.get('/api/returns', (req, res) => {
  try {
    if (fs.existsSync(RETURNS_FILE)) {
      const data = JSON.parse(fs.readFileSync(RETURNS_FILE, 'utf-8'));
      return res.json({ returns: data });
    }
    return res.json({ returns: [] });
  } catch (err) {
    return res.json({ returns: [] });
  }
});

app.post('/api/returns', (req, res) => {
  try {
    const returnReq = req.body;
    let list: any[] = [];
    if (fs.existsSync(RETURNS_FILE)) {
      try {
        list = JSON.parse(fs.readFileSync(RETURNS_FILE, 'utf-8'));
      } catch {}
    }
    list.unshift(returnReq);
    fs.writeFileSync(RETURNS_FILE, JSON.stringify(list, null, 2), 'utf-8');
    return res.json({ success: true, return: returnReq });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to record return request' });
  }
});

// AI Chatbot API Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, userQuery } = req.body;
    const latestQuery = userQuery || (messages && messages.length > 0 ? messages[messages.length - 1].content : '');

    if (!latestQuery) {
      return res.status(400).json({ error: 'Query or messages are required.' });
    }

    const ai = getGenAI();

    if (!ai) {
      // Return smart concierge response if no key is configured
      const fallbackReply = getFallbackResponse(latestQuery);
      return res.json({ reply: fallbackReply, source: 'concierge-knowledge' });
    }

    // Format conversation history for Gemini
    const contents = [];
    if (messages && Array.isArray(messages) && messages.length > 0) {
      for (const m of messages) {
        contents.push({
          role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
          parts: [{ text: m.content || '' }],
        });
      }
    } else {
      contents.push({
        role: 'user',
        parts: [{ text: latestQuery }],
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        maxOutputTokens: 800,
      },
    });

    const reply = response.text || getFallbackResponse(latestQuery);
    return res.json({ reply, source: 'gemini' });
  } catch (error: any) {
    console.error('Gemini Chat API Error:', error);
    const latestQuery = req.body?.userQuery || '';
    const fallbackReply = getFallbackResponse(latestQuery);
    return res.json({ reply: fallbackReply, source: 'concierge-fallback' });
  }
});

// Endpoint to upload / replace saree image asset
app.post('/api/upload-saree-image', (req, res) => {
  try {
    const { targetFilename, base64Data, productId, imageIndex } = req.body;
    if (!base64Data) {
      return res.status(400).json({ error: 'base64Data is required' });
    }

    // Clean base64 prefix if present (e.g. data:image/jpeg;base64,...)
    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    const filenamesToUpdate = new Set<string>();

    const CANONICAL_MAP: Record<string, string[]> = {
      'sar-dw-001': ['daily-wear-1-a.jpg', 'daily-wear-1-b.jpg'],
      'sar-dw-002': ['Dail wear sarees 02.webp', 'daily-wear-2-a.jpg', 'daily-wear-2-b.jpg'],
      'sar-dw-003': ['Daily wear saree 03.webp', 'daily-wear-3-a.jpg', 'daily-wear-3-b.jpg'],
      'sar-lf-001': ['low-fancy-1-a.jpg', 'low-fancy-1-b.jpg'],
      'sar-lf-002': ['low-fancy-2-a.jpg', 'low-fancy-2-b.jpg'],
      'sar-lf-003': ['low-fancy-3-a.jpg', 'low-fancy-3-b.jpg'],
      'sar-hf-001': ['high-fancy-1-a.jpg', 'high-fancy-1-b.jpg'],
      'sar-hf-002': ['high-fancy-2-a.jpg', 'high-fancy-2-b.jpg'],
      'sar-hf-003': ['high-fancy-3-a.jpg', 'high-fancy-3-b.jpg'],
      'sar-ds-001': ['designer-1-a.jpg', 'designer-1-b.jpg'],
      'sar-ds-002': ['designer-2-a.jpg', 'designer-2-b.jpg'],
      'sar-ds-003': ['designer-3-a.jpg', 'designer-3-b.jpg'],
      'sar-sp-001': ['semi-pattu-1-a.jpg', 'semi-pattu-1-b.jpg', 'semi pattu saree 4.jpeg', 'semi-pattu-4.jpeg', 'semi-pattu-4.jpg'],
      'sar-sp-002': ['semi-pattu-2-a.jpg', 'semi-pattu-2-b.jpg'],
      'sar-sp-003': ['semi-pattu-3-a.jpg', 'semi-pattu-3-b.jpg'],
      'sar-ss-001': ['soft-silk-1-a.jpg', 'soft-silk-1-b.jpg', 'soft silk saree 4.jpg', 'soft-silk-4.jpeg', 'soft-silk-4.jpg'],
      'sar-ss-002': ['soft-silk-2-a.jpg', 'soft-silk-2-b.jpg'],
      'sar-ss-003': ['soft-silk-3-a.jpg', 'soft-silk-3-b.jpg'],
      'sar-wb-001': ['wedding-bridal-1-a.jpg', 'wedding-bridal-1-b.jpg'],
      'sar-wb-002': ['wedding-bridal-2-a.jpg', 'wedding-bridal-2-b.jpg'],
      'sar-wb-003': ['wedding-bridal-3-a.jpg', 'wedding-bridal-3-b.jpg'],
      'sar-vt-001': ['vintage-1-a.jpg', 'vintage-1-b.jpg'],
      'sar-vt-002': ['vintage-2-a.jpg', 'vintage-2-b.jpg'],
      'sar-vt-003': ['vintage-3-a.jpg', 'vintage-3-b.jpg'],
    };

    const idx = typeof imageIndex === 'number' ? imageIndex : parseInt(String(imageIndex), 10) || 0;

    if (productId && CANONICAL_MAP[productId]) {
      const canonicalList = CANONICAL_MAP[productId];
      if (canonicalList[idx]) {
        filenamesToUpdate.add(canonicalList[idx]);
      }
    }
    
    if (targetFilename) {
      const cleanName = path.basename(targetFilename);
      filenamesToUpdate.add(cleanName);

      // Map short prefixes (e.g., lf-001-b.jpg -> low-fancy-1-b.jpg)
      const shortPrefixMatch = cleanName.match(/^([a-z]{2})-(\d{3})-([a-z])\.jpg$/);
      if (shortPrefixMatch) {
        const catCode = shortPrefixMatch[1];
        const numCode = parseInt(shortPrefixMatch[2], 10);
        const letter = shortPrefixMatch[3];
        const categoryMap: Record<string, string> = {
          dw: 'daily-wear',
          lf: 'low-fancy',
          hf: 'high-fancy',
          ds: 'designer',
          sp: 'semi-pattu',
          ss: 'soft-silk',
          wb: 'wedding-bridal',
          vt: 'vintage',
        };
        if (categoryMap[catCode]) {
          filenamesToUpdate.add(`${categoryMap[catCode]}-${numCode}-${letter}.jpg`);
        }
      }

      // Add known exact aliases for the same image slot only
      if (cleanName === 'Dail wear sarees 02.webp' || cleanName === 'daily-wear-saree-02.webp') {
        filenamesToUpdate.add('Dail wear sarees 02.webp');
        filenamesToUpdate.add('daily-wear-saree-02.webp');
      } else if (cleanName === 'Daily wear saree 03.webp' || cleanName === 'daily-wear-saree-03.webp') {
        filenamesToUpdate.add('Daily wear saree 03.webp');
        filenamesToUpdate.add('daily-wear-saree-03.webp');
      } else if (cleanName === 'high-fancy-1-a.jpg' || cleanName === 'high-fancy-saree.jpeg' || cleanName === 'High Fancy Saree.jpeg') {
        filenamesToUpdate.add('high-fancy-1-a.jpg');
        filenamesToUpdate.add('high-fancy-saree.jpeg');
        filenamesToUpdate.add('High Fancy Saree.jpeg');
      }
    }

    const publicDir = path.join(process.cwd(), 'public', 'assets', 'sarees');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const distDir = path.join(process.cwd(), 'dist', 'assets', 'sarees');
    const hasDist = fs.existsSync(path.join(process.cwd(), 'dist'));
    if (hasDist && !fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }

    for (const filename of filenamesToUpdate) {
      fs.writeFileSync(path.join(publicDir, filename), buffer);
      if (hasDist) {
        try {
          fs.writeFileSync(path.join(distDir, filename), buffer);
        } catch {
          // ignore dist write failure
        }
      }
    }

    // Update manifest for 100% export & publishing persistence
    const manifest = readImagesManifest();
    const primaryFilename = targetFilename ? path.basename(targetFilename) : Array.from(filenamesToUpdate)[0] || 'daily-wear-1-a.jpg';
    const key = productId ? `${productId}_${idx}` : primaryFilename;
    manifest[key] = {
      filename: primaryFilename,
      updatedAt: Date.now(),
      url: `/assets/sarees/${primaryFilename}`,
    };
    if (idx === 0 && productId) {
      manifest[productId] = manifest[key];
    }
    writeImagesManifest(manifest);

    return res.json({
      success: true,
      updatedFiles: Array.from(filenamesToUpdate),
      url: `/assets/sarees/${primaryFilename}`,
      updatedAt: manifest[key].updatedAt,
    });
  } catch (err: any) {
    console.error('Error saving uploaded saree image:', err);
    return res.status(500).json({ error: err.message || 'Failed to save image' });
  }
});

// Endpoint to batch sync all attached images to disk for 100% export during publishing
app.post('/api/sync-all-images', (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.json({ success: true, count: 0, message: 'No image items provided' });
    }

    const publicDir = path.join(process.cwd(), 'public', 'assets', 'sarees');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    const distDir = path.join(process.cwd(), 'dist', 'assets', 'sarees');
    const hasDist = fs.existsSync(path.join(process.cwd(), 'dist'));
    if (hasDist && !fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }

    const manifest = readImagesManifest();
    let savedCount = 0;
    const now = Date.now();

    const CANONICAL_MAP: Record<string, string[]> = {
      'sar-dw-001': ['daily-wear-1-a.jpg', 'daily-wear-1-b.jpg'],
      'sar-dw-002': ['Dail wear sarees 02.webp', 'daily-wear-2-a.jpg', 'daily-wear-2-b.jpg'],
      'sar-dw-003': ['Daily wear saree 03.webp', 'daily-wear-3-a.jpg', 'daily-wear-3-b.jpg'],
      'sar-lf-001': ['low-fancy-1-a.jpg', 'low-fancy-1-b.jpg'],
      'sar-lf-002': ['low-fancy-2-a.jpg', 'low-fancy-2-b.jpg'],
      'sar-lf-003': ['low-fancy-3-a.jpg', 'low-fancy-3-b.jpg'],
      'sar-hf-001': ['high-fancy-1-a.jpg', 'high-fancy-1-b.jpg'],
      'sar-hf-002': ['high-fancy-2-a.jpg', 'high-fancy-2-b.jpg'],
      'sar-hf-003': ['high-fancy-3-a.jpg', 'high-fancy-3-b.jpg'],
      'sar-ds-001': ['designer-1-a.jpg', 'designer-1-b.jpg'],
      'sar-ds-002': ['designer-2-a.jpg', 'designer-2-b.jpg'],
      'sar-ds-003': ['designer-3-a.jpg', 'designer-3-b.jpg'],
      'sar-sp-001': ['semi-pattu-1-a.jpg', 'semi-pattu-1-b.jpg', 'semi pattu saree 4.jpeg', 'semi-pattu-4.jpeg', 'semi-pattu-4.jpg'],
      'sar-sp-002': ['semi-pattu-2-a.jpg', 'semi-pattu-2-b.jpg'],
      'sar-sp-003': ['semi-pattu-3-a.jpg', 'semi-pattu-3-b.jpg'],
      'sar-ss-001': ['soft-silk-1-a.jpg', 'soft-silk-1-b.jpg', 'soft silk saree 4.jpg', 'soft-silk-4.jpeg', 'soft-silk-4.jpg'],
      'sar-ss-002': ['soft-silk-2-a.jpg', 'soft-silk-2-b.jpg'],
      'sar-ss-003': ['soft-silk-3-a.jpg', 'soft-silk-3-b.jpg'],
      'sar-wb-001': ['wedding-bridal-1-a.jpg', 'wedding-bridal-1-b.jpg'],
      'sar-wb-002': ['wedding-bridal-2-a.jpg', 'wedding-bridal-2-b.jpg'],
      'sar-wb-003': ['wedding-bridal-3-a.jpg', 'wedding-bridal-3-b.jpg'],
      'sar-vt-001': ['vintage-1-a.jpg', 'vintage-1-b.jpg'],
      'sar-vt-002': ['vintage-2-a.jpg', 'vintage-2-b.jpg'],
      'sar-vt-003': ['vintage-3-a.jpg', 'vintage-3-b.jpg'],
    };

    for (const item of items) {
      if (!item.base64Data) continue;
      const cleanBase64 = item.base64Data.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(cleanBase64, 'base64');
      const idx = typeof item.imageIndex === 'number' ? item.imageIndex : parseInt(String(item.imageIndex), 10) || 0;
      
      const filesToWrite = new Set<string>();
      if (item.targetFilename) {
        filesToWrite.add(path.basename(item.targetFilename));
      }
      if (item.productId && CANONICAL_MAP[item.productId] && CANONICAL_MAP[item.productId][idx]) {
        filesToWrite.add(CANONICAL_MAP[item.productId][idx]);
      }

      for (const fn of filesToWrite) {
        fs.writeFileSync(path.join(publicDir, fn), buffer);
        if (hasDist) {
          try {
            fs.writeFileSync(path.join(distDir, fn), buffer);
          } catch {}
        }
      }

      const primaryFn = Array.from(filesToWrite)[0];
      if (primaryFn) {
        const key = item.productId ? `${item.productId}_${idx}` : primaryFn;
        manifest[key] = {
          filename: primaryFn,
          updatedAt: now,
          url: `/assets/sarees/${primaryFn}`,
        };
        if (idx === 0 && item.productId) {
          manifest[item.productId] = manifest[key];
        }
      }
      savedCount++;
    }

    writeImagesManifest(manifest);
    return res.json({
      success: true,
      count: savedCount,
      timestamp: now,
      manifest,
      message: `All ${savedCount} attached images 100% saved and exported for website publishing.`,
    });
  } catch (err: any) {
    console.error('Error in batch sync-all-images:', err);
    return res.status(500).json({ error: err.message || 'Failed to sync images' });
  }
});

// Endpoint to delete custom attached saree image and manifest entry
app.post('/api/delete-saree-image', (req, res) => {
  try {
    const { productId, imageIndex } = req.body;
    if (!productId) {
      return res.status(400).json({ error: 'productId is required' });
    }

    const manifest = readImagesManifest();
    const idx = typeof imageIndex === 'number' ? imageIndex : parseInt(String(imageIndex), 10);

    if (!isNaN(idx)) {
      const key = `${productId}_${idx}`;
      delete manifest[key];
      if (idx === 0) {
        delete manifest[productId];
      }
    } else {
      delete manifest[productId];
      for (let i = 0; i < 10; i++) {
        delete manifest[`${productId}_${i}`];
      }
    }

    writeImagesManifest(manifest);
    return res.json({
      success: true,
      productId,
      imageIndex: idx,
      manifest,
      message: `Custom image for ${productId} (index: ${idx ?? 'all'}) deleted successfully.`,
    });
  } catch (err: any) {
    console.error('Error deleting saree image entry:', err);
    return res.status(500).json({ error: err.message || 'Failed to delete saree image' });
  }
});

// Endpoint to delete all custom saree image entries from manifest
app.post('/api/delete-all-custom-images', (req, res) => {
  try {
    writeImagesManifest({});
    return res.json({
      success: true,
      manifest: {},
      message: 'All custom attached saree images removed and reset to pristine original defaults.',
    });
  } catch (err: any) {
    console.error('Error resetting all custom images:', err);
    return res.status(500).json({ error: err.message || 'Failed to delete all custom images' });
  }
});

// Dedicated endpoint to update and persist custom UPI QR Code image
app.post('/api/upload-qr-image', (req, res) => {
  try {
    const { base64Data, filename } = req.body;
    if (!base64Data) {
      return res.status(400).json({ error: 'base64Data is required' });
    }

    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    const targetFile = filename || 'venkata-rao-kondru-upi-qr.png';

    const qrDir = path.join(process.cwd(), 'public', 'assets', 'qr');
    if (!fs.existsSync(qrDir)) {
      fs.mkdirSync(qrDir, { recursive: true });
    }

    fs.writeFileSync(path.join(qrDir, targetFile), buffer);

    const distQrDir = path.join(process.cwd(), 'dist', 'assets', 'qr');
    if (fs.existsSync(path.join(process.cwd(), 'dist'))) {
      if (!fs.existsSync(distQrDir)) {
        fs.mkdirSync(distQrDir, { recursive: true });
      }
      try {
        fs.writeFileSync(path.join(distQrDir, targetFile), buffer);
      } catch {
        // ignore dist error
      }
    }

    return res.json({
      success: true,
      url: `/assets/qr/${targetFile}`,
    });
  } catch (err: any) {
    console.error('Error saving uploaded QR code image:', err);
    return res.status(500).json({ error: err.message || 'Failed to save QR code image' });
  }
});

// In-memory cache for high-speed instant PDF delivery
const pdfCache = new Map<string, Buffer>();

// Helper to determine the real, externally accessible HTTPS domain for WhatsApp links
function getPublicBaseUrl(req: express.Request): string {
  const forwardedProto = (req.headers['x-forwarded-proto'] as string)?.split(',')[0]?.trim();
  const proto = forwardedProto || req.protocol || 'https';

  const forwardedHost = (req.headers['x-forwarded-host'] as string)?.split(',')[0]?.trim();
  const host = forwardedHost || req.get('host') || 'localhost:3000';

  // If host is internal container localhost, resolve to Cloud Run deployment URL
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    if (process.env.APP_URL) {
      return process.env.APP_URL.replace(/\/$/, '');
    }
    // Verified Google Cloud Run dev endpoint for this workspace
    return 'https://ais-dev-zepchstfhkydbdukvryifd-936761872105.asia-east1.run.app';
  }

  return `${proto}://${host}`;
}

// Helper to find PDF buffer from memory cache or disk
function findPdfBuffer(safeOrderId: string): { buffer: Buffer; filename: string } | null {
  const cleanId = safeOrderId.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${cleanId}.pdf`;

  if (pdfCache.has(cleanId)) {
    return { buffer: pdfCache.get(cleanId)!, filename };
  }

  const publicPath = path.join(process.cwd(), 'public', 'orders', filename);
  if (fs.existsSync(publicPath)) {
    const buf = fs.readFileSync(publicPath);
    pdfCache.set(cleanId, buf);
    return { buffer: buf, filename };
  }

  const distPath = path.join(process.cwd(), 'dist', 'orders', filename);
  if (fs.existsSync(distPath)) {
    const buf = fs.readFileSync(distPath);
    pdfCache.set(cleanId, buf);
    return { buffer: buf, filename };
  }

  return null;
}

// Endpoint to store generated Order Invoice & Lookbook PDF with product images
app.post('/api/save-order-pdf', (req, res) => {
  try {
    const { orderId, pdfBase64 } = req.body;
    if (!orderId || !pdfBase64) {
      return res.status(400).json({ error: 'orderId and pdfBase64 are required' });
    }

    const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');

    const safeOrderId = orderId.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${safeOrderId}.pdf`;

    // Store in memory cache for immediate delivery
    pdfCache.set(safeOrderId, buffer);

    // Save to public/orders
    const ordersDir = path.join(process.cwd(), 'public', 'orders');
    if (!fs.existsSync(ordersDir)) {
      fs.mkdirSync(ordersDir, { recursive: true });
    }
    fs.writeFileSync(path.join(ordersDir, filename), buffer);

    // Also save to dist/orders if dist exists
    const distOrdersDir = path.join(process.cwd(), 'dist', 'orders');
    if (fs.existsSync(path.join(process.cwd(), 'dist'))) {
      if (!fs.existsSync(distOrdersDir)) {
        fs.mkdirSync(distOrdersDir, { recursive: true });
      }
      try {
        fs.writeFileSync(path.join(distOrdersDir, filename), buffer);
      } catch {
        // ignore dist write error
      }
    }

    const baseUrl = getPublicBaseUrl(req);
    const pdfUrl = `${baseUrl}/api/orders/${safeOrderId}/pdf`;
    const viewUrl = `${baseUrl}/order-view/${safeOrderId}`;

    return res.json({
      success: true,
      filename,
      orderId: safeOrderId,
      relativeUrl: `/orders/${filename}`,
      pdfUrl,
      downloadUrl: pdfUrl,
      publicPdfUrl: pdfUrl,
      viewUrl,
    });
  } catch (err: any) {
    console.error('Error saving order PDF:', err);
    return res.status(500).json({ error: err.message || 'Failed to save order PDF' });
  }
});

// In-memory notification log tracking customer & atelier message dispatch
interface NotificationLogEntry {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  totalINR: number;
  recipient: 'customer' | 'atelier' | 'both';
  notificationType: string;
  timestamp: string;
  status: 'DELIVERED_TO_QUEUE' | 'VERIFIED';
  whatsappApiUrl: string;
  whatsappWebUrl: string;
  smsUrl: string;
  emailUrl: string;
  messagePreview: string;
}

const notificationsLog: NotificationLogEntry[] = [];

// Endpoint to send, log and verify multi-channel order & payment notification
app.post('/api/send-order-notification', (req, res) => {
  try {
    const { order, recipient = 'both', notificationType = 'payment_received', pdfUrl, viewUrl } = req.body;
    if (!order || !order.id) {
      return res.status(400).json({ error: 'order object with id is required' });
    }

    const safeOrderId = order.id.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const baseUrl = getPublicBaseUrl(req);
    const finalPdfUrl = pdfUrl || `${baseUrl}/api/orders/${safeOrderId}/pdf`;
    const finalViewUrl = viewUrl || `${baseUrl}/order-view/${safeOrderId}`;

    // Clean phone number (strip 0, ensure 91 for Indian 10-digit mobile)
    let cleanCustomerPhone = (order.phone || '').replace(/[^0-9]/g, '');
    if (cleanCustomerPhone.length === 11 && cleanCustomerPhone.startsWith('0')) {
      cleanCustomerPhone = cleanCustomerPhone.slice(1);
    }
    if (cleanCustomerPhone.length === 10) {
      cleanCustomerPhone = `91${cleanCustomerPhone}`;
    }
    if (!cleanCustomerPhone || cleanCustomerPhone.length < 8) {
      cleanCustomerPhone = '919347159353';
    }

    const atelierPhone = '919347159353';
    const isCod = (order.paymentMethod || '').toLowerCase().includes('cash on delivery');

    const paymentHeader = isCod
      ? `💰 *Payment Mode:* Cash on Delivery (COD Verified — Balance payable at doorstep)`
      : `✅ *Payment Status:* RECEIVED & VERIFIED IN FULL`;

    const itemsSummary = (order.items || [])
      .map((it: any, idx: number) => `${idx + 1}. ${it.productName} (${it.size}) × ${it.quantity}`)
      .join(', ');

    const customerMessage = [
      `👑 *AAVIRA HAUTE COUTURE — ORDER & PAYMENT RECEIVED*`,
      `Receipt Ref: *#${order.id}*`,
      ``,
      `Dear *${order.customerName}*,`,
      `Namaste! We gratefully acknowledge receipt of your order and payment at our atelier.`,
      ``,
      paymentHeader,
      order.paymentRef ? `🔢 *Transaction UTR Ref:* ${order.paymentRef}` : '',
      `💵 *Total Amount Paid:* ₹${(order.totalINR || 0).toLocaleString('en-IN')}`,
      `💳 *Payment Method:* ${order.paymentMethod}`,
      order.awbNumber ? `🚚 *Insured Courier AWB:* ${order.awbNumber} (${order.courierPartner || 'BlueDart Air'})` : '',
      `📦 *Status:* Handcrafting & Zari Quality Inspection Underway`,
      ``,
      `🛍️ *Ordered Items:* ${itemsSummary}`,
      ``,
      `📍 *Shipping To:* ${order.shippingAddress?.street || ''}, ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.postalCode || ''}`,
      ``,
      `📄 *Official Invoice & Saree Lookbook PDF:*`,
      finalPdfUrl,
      ``,
      `📱 *Digital Consignment Certificate:*`,
      finalViewUrl,
      ``,
      `Managing Director: Mrs. K. Ramani (+91 9347159353)`,
      `Email: aavira.bo@gmail.com | Ateliers: Hyderabad & Visakhapatnam`,
    ].filter(Boolean).join('\n');

    const atelierMessage = [
      `👑 *AAVIRA HAUTE COUTURE ATELIER — NEW ORDER RECEIVED ALERT*`,
      `Order Ref: *#${order.id}*`,
      `ATTN: *Mrs. K. Ramani (Managing Director) & Production Team*`,
      ``,
      paymentHeader,
      order.paymentRef ? `🔢 *Transaction UTR Ref:* ${order.paymentRef}` : '',
      `💵 *Order Value:* ₹${(order.totalINR || 0).toLocaleString('en-IN')}`,
      `💳 *Payment Method:* ${order.paymentMethod}`,
      order.awbNumber ? `🚚 *Insured Courier AWB:* ${order.awbNumber} (${order.courierPartner || 'BlueDart Air'})` : '',
      `📦 *Status:* New Order Received — Allocate to Master Weaver`,
      ``,
      `👤 *Customer:* ${order.customerName}`,
      `📱 *Customer Phone:* +${cleanCustomerPhone}`,
      `✉️ *Customer Email:* ${order.email || 'N/A'}`,
      ``,
      `🛍️ *Ordered Sarees & Ensembles:* ${itemsSummary}`,
      ``,
      `📍 *Dispatch Address:* ${order.shippingAddress?.street || ''}, ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.postalCode || ''}`,
      ``,
      `📄 *Official Lookbook & Invoice PDF:* ${finalPdfUrl}`,
      ``,
      `📱 *Digital Consignment Certificate:* ${finalViewUrl}`,
      ``,
      `_Aavira Haute Couture Atelier Internal Alert • +91 9347159353_`,
    ].filter(Boolean).join('\n');

    const encodedMsg = encodeURIComponent(customerMessage);
    const encodedAtelierMsg = encodeURIComponent(atelierMessage);
    const emailSubject = encodeURIComponent(`Aavira Haute Couture: Order & Payment Confirmation #${order.id}`);
    const emailBody = encodeURIComponent(customerMessage);

    const whatsappApiUrl = `https://api.whatsapp.com/send?phone=${cleanCustomerPhone}&text=${encodedMsg}`;
    const whatsappWebUrl = `https://web.whatsapp.com/send?phone=${cleanCustomerPhone}&text=${encodedMsg}`;
    const whatsappAtelierUrl = `https://api.whatsapp.com/send?phone=${atelierPhone}&text=${encodedAtelierMsg}`;
    const whatsappAtelierWebUrl = `https://web.whatsapp.com/send?phone=${atelierPhone}&text=${encodedAtelierMsg}`;
    const smsUrl = `sms:${cleanCustomerPhone}?body=${encodedMsg}`;
    const emailUrl = `mailto:${order.email || 'client@aavira.com'}?subject=${emailSubject}&body=${emailBody}`;

    const logEntry: NotificationLogEntry = {
      id: `NOTIF-${Date.now()}`,
      orderId: order.id,
      customerName: order.customerName,
      customerPhone: cleanCustomerPhone,
      customerEmail: order.email || 'client@aavira.com',
      totalINR: order.totalINR || 0,
      recipient,
      notificationType,
      timestamp: new Date().toISOString(),
      status: 'VERIFIED',
      whatsappApiUrl,
      whatsappWebUrl,
      smsUrl,
      emailUrl,
      messagePreview: customerMessage.substring(0, 160) + '...',
    };

    notificationsLog.unshift(logEntry);
    if (notificationsLog.length > 200) {
      notificationsLog.pop();
    }

    console.log(`[AAVIRA NOTIFICATION DISPATCHED] Order #${order.id} | Customer: ${order.customerName} (${cleanCustomerPhone}) | Status: VERIFIED & READY`);

    return res.json({
      success: true,
      logId: logEntry.id,
      orderId: order.id,
      customerPhone: cleanCustomerPhone,
      atelierPhone,
      whatsappApiUrl,
      whatsappWebUrl,
      whatsappAtelierUrl,
      smsUrl,
      emailUrl,
      message: customerMessage,
      timestamp: logEntry.timestamp,
    });
  } catch (err: any) {
    console.error('Error dispatching order notification:', err);
    return res.status(500).json({ error: err.message || 'Failed to dispatch notification' });
  }
});

// Endpoint to retrieve all recent notifications
app.get('/api/order-notifications', (req, res) => {
  return res.json({ notifications: notificationsLog, count: notificationsLog.length });
});

// Endpoint to retrieve notification history for an order
app.get('/api/order-notifications/:orderId', (req, res) => {
  const { orderId } = req.params;
  const entries = notificationsLog.filter((n) => n.orderId.toLowerCase() === orderId.toLowerCase());
  return res.json({ orderId, entries, count: entries.length });
});

// Endpoint to download / preview order PDF directly (inline display)
app.get('/api/orders/:orderId/pdf', (req, res) => {
  const result = findPdfBuffer(req.params.orderId);
  if (!result) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Aavira Order PDF Not Found</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
        <body style="font-family:sans-serif; text-align:center; padding:40px; background:#FAF8F5; color:#1A1510;">
          <h2 style="font-family:serif; color:#B8860B;">AAVIRA HAUTE COUTURE</h2>
          <p>Order PDF is being prepared by the atelier. Please refresh in a moment.</p>
          <a href="/" style="display:inline-block; margin-top:20px; padding:10px 20px; background:#1A1510; color:#F3EBD4; text-decoration:none; border-radius:4px;">Return to Boutique</a>
        </body>
      </html>
    `);
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${result.filename}"`);
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Length', result.buffer.length);
  return res.end(result.buffer);
});

// Endpoint to force download of order PDF
app.get('/api/orders/:orderId/download', (req, res) => {
  const result = findPdfBuffer(req.params.orderId);
  if (!result) {
    return res.status(404).send('Order PDF not found.');
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
  res.setHeader('Content-Length', result.buffer.length);
  return res.end(result.buffer);
});

// Explicit route for /orders/:filename to guarantee PDF is served instead of SPA index.html
app.get('/orders/:filename', (req, res) => {
  const result = findPdfBuffer(req.params.filename);
  if (!result) {
    return res.status(404).send('PDF not found.');
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${result.filename}"`);
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Length', result.buffer.length);
  return res.end(result.buffer);
});

// Mobile & Universal Web Lookbook Viewer for WhatsApp clicks
app.get('/order-view/:orderId', (req, res) => {
  const safeOrderId = req.params.orderId.replace(/\.pdf$/i, '').replace(/[^a-zA-Z0-9_-]/g, '_');
  const baseUrl = getPublicBaseUrl(req);
  const pdfUrl = `${baseUrl}/api/orders/${safeOrderId}/pdf`;
  const downloadUrl = `${baseUrl}/api/orders/${safeOrderId}/download`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Order Lookbook & Invoice — Aavira Haute Couture</title>
        <meta property="og:title" content="Aavira Order ${safeOrderId} Lookbook & Invoice" />
        <meta property="og:description" content="Official order document with high-resolution saree photos and atelier specifications." />
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #FAF8F5;
            color: #1A1510;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }
          header {
            background-color: #1A1510;
            color: #F5EEE0;
            padding: 16px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #B8860B;
            flex-wrap: wrap;
            gap: 12px;
          }
          .brand-title {
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 18px;
            letter-spacing: 2px;
            text-transform: uppercase;
            font-weight: bold;
          }
          .brand-sub {
            font-size: 11px;
            color: #D4B98C;
            letter-spacing: 0.5px;
          }
          .action-bar {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
          }
          .btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 10px 18px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 600;
            text-decoration: none;
            cursor: pointer;
            transition: all 0.2s;
          }
          .btn-gold {
            background-color: #B8860B;
            color: #FFFFFF;
          }
          .btn-gold:hover { background-color: #966D08; }
          .btn-wa {
            background-color: #25D366;
            color: #FFFFFF;
          }
          .btn-wa:hover { background-color: #20BA5C; }
          .btn-dark {
            background-color: #2A221B;
            color: #F5EEE0;
            border: 1px solid #4A3C30;
          }
          .btn-dark:hover { background-color: #3D3228; }
          .container {
            flex: 1;
            display: flex;
            flex-direction: column;
            padding: 16px;
            max-width: 1100px;
            width: 100%;
            margin: 0 auto;
          }
          .banner {
            background: #FFFFFF;
            border: 1px solid #E8E0D2;
            border-radius: 8px;
            padding: 14px 18px;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 10px;
          }
          .frame-wrapper {
            flex: 1;
            min-height: 75vh;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #D9D0C1;
            background: #FFFFFF;
            box-shadow: 0 4px 12px rgba(0,0,0,0.06);
          }
          iframe {
            width: 100%;
            height: 100%;
            min-height: 75vh;
            border: none;
          }
          footer {
            text-align: center;
            padding: 14px 20px;
            font-size: 11px;
            color: #8C7A65;
            border-top: 1px solid #E8E0D2;
            background: #F4EFE6;
          }
          @media (max-width: 600px) {
            header { flex-direction: column; align-items: flex-start; }
            .action-bar { width: 100%; justify-content: stretch; }
            .action-bar .btn { flex: 1; justify-content: center; font-size: 12px; }
          }
        </style>
      </head>
      <body>
        <header>
          <div>
            <div class="brand-title">Aavira Haute Couture</div>
            <div class="brand-sub">Official Order Lookbook & Invoice • Order Ref: ${safeOrderId}</div>
          </div>
          <div class="action-bar">
            <a href="${downloadUrl}" class="btn btn-gold" download="Aavira-Order-${safeOrderId}.pdf">
              📥 Download PDF
            </a>
            <a href="https://wa.me/919347159353?text=Hello%20Mrs.%20Ramani%2C%20regarding%20my%20Aavira%20order%20%23${safeOrderId}" target="_blank" class="btn btn-wa">
              💬 WhatsApp Concierge
            </a>
            <a href="/" class="btn btn-dark">
              Boutique Home
            </a>
          </div>
        </header>

        <div class="container">
          <div class="banner">
            <div>
              <strong style="font-size:14px; color:#1A1510;">Looking at Order #${safeOrderId}</strong>
              <p style="font-size:12px; color:#6E5E4E; margin-top:3px;">
                Complete with embedded saree photos, blouse measurements, and Pure Silk authentication guarantee.
              </p>
            </div>
            <a href="${pdfUrl}" target="_blank" style="font-size:12px; color:#B8860B; font-weight:600; text-decoration:underline;">
              Open Raw PDF in New Tab ↗
            </a>
          </div>

          <div class="frame-wrapper">
            <iframe src="${pdfUrl}#toolbar=1&navpanes=0" title="Aavira Order PDF">
              <p style="padding:40px; text-align:center;">
                Your mobile browser does not display inline PDFs automatically.<br/><br/>
                <a href="${downloadUrl}" class="btn btn-gold" style="display:inline-block;">📥 Tap Here to Download & Open PDF</a>
              </p>
            </iframe>
          </div>
        </div>

        <footer>
          © 2026 AAVIRA HAUTE COUTURE. All Rights Reserved. Founded & Directed by Mrs. K. Ramani. | <span style="color:#966B08; font-weight:600;">Designed by Byteboostai</span>
        </footer>
      </body>
    </html>
  `);
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Aavira Haute Couture Server running on http://localhost:${PORT}`);
  });
}

startServer();
