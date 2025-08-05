# Video-IA.net Tool Scraper MVP

A browser-based MVP for analyzing AI tools using web scraping and Gemini AI. This application demonstrates the core functionality of the Video-IA.net intelligent tool scraper without database storage.

## 🚀 Features

- **Web Scraping**: Automatically extracts content from AI tool websites
- **AI Analysis**: Uses Gemini AI to analyze and categorize tools
- **SEO Optimization**: Generates meta titles, descriptions, and tags
- **Export Options**: Download results as JSON or CSV
- **Real-time Analysis**: No database storage required
- **Modern UI**: Clean, responsive interface with Tailwind CSS

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Web Scraping**: Puppeteer, Cheerio
- **AI Integration**: Google Gemini AI (gemini-2.0-flash)
- **HTTP Client**: Axios

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Gemini API key

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Environment Variables

Create a `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🎯 Usage

1. **Enter URL**: Input the website URL of an AI tool
2. **Analyze**: Click "Analyze Tool" to start the process
3. **Review Results**: View the comprehensive analysis including:
   - Tool name and primary function
   - Category and pricing model
   - Key features and target audience
   - SEO-optimized description
   - Meta tags and keywords
   - Confidence and completeness scores
4. **Export**: Download results as JSON or CSV

## 📊 Example URLs to Test

- https://cassetteai.com/
- https://midjourney.com/
- https://chat.openai.com/
- https://www.notion.so/
- https://www.figma.com/

## 🔧 API Endpoints

### POST `/api/scrape`

Analyzes a tool website and returns structured data.

**Request:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "toolName": "Example AI Tool",
  "primaryFunction": "AI-powered content generation",
  "keyFeatures": ["Feature 1", "Feature 2", "Feature 3"],
  "targetAudience": ["Content creators", "Marketers"],
  "pricingModel": "Freemium",
  "category": "Content Creation",
  "description": "Detailed SEO-optimized description...",
  "metaTitle": "SEO-optimized title",
  "metaDescription": "SEO-optimized description",
  "tags": ["AI", "Content", "Generation"],
  "confidence": 85,
  "dataCompleteness": 90,
  "recommendedActions": ["Verify pricing information"]
}
```

## 🏗️ Architecture

### Frontend Components

- **ScraperForm**: URL input and form handling
- **ResultsDisplay**: Comprehensive results visualization
- **LoadingSpinner**: Loading state indicator

### Backend API

- **Web Scraping**: Puppeteer for dynamic content, Cheerio for parsing
- **AI Analysis**: Gemini AI for content analysis and categorization
- **Data Processing**: Structured data extraction and validation

### Data Flow

1. **URL Input** → Frontend validation
2. **API Request** → Backend processing
3. **Web Scraping** → Content extraction
4. **AI Analysis** → Gemini AI processing
5. **Results Display** → Structured data presentation
6. **Export Options** → JSON/CSV download

## 🔍 Analysis Features

### Content Extraction
- Page title and main content
- Meta descriptions and keywords
- Social media links
- Pricing information
- Feature lists

### AI Analysis
- Tool identification and categorization
- Feature extraction and classification
- Target audience identification
- SEO optimization
- Confidence scoring

### Quality Metrics
- **Confidence Score**: AI analysis reliability (0-100%)
- **Data Completeness**: Information coverage (0-100%)
- **Recommended Actions**: Suggested improvements

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop and mobile
- **Loading States**: Clear progress indicators
- **Error Handling**: User-friendly error messages
- **Export Options**: Easy data download
- **Modern Interface**: Clean, professional design

## 🔐 Security Considerations

- **Input Validation**: URL format validation
- **Error Handling**: Graceful error management
- **Rate Limiting**: Built-in request throttling
- **Content Safety**: Harmful content detection

## 📈 Performance

- **Scraping Time**: 30-60 seconds per analysis
- **AI Processing**: Real-time Gemini AI analysis
- **Response Time**: Optimized for user experience
- **Memory Usage**: Efficient resource management

## 🚧 Limitations

- **Single URL Analysis**: One tool at a time
- **No Database**: Results not persisted
- **API Rate Limits**: Subject to Gemini API limits
- **Browser Dependencies**: Requires Puppeteer

## 🔮 Future Enhancements

- **Batch Processing**: Multiple URLs at once
- **Database Integration**: PostgreSQL storage
- **Multi-language Support**: French, Italian, Spanish, German, Dutch
- **Advanced Analytics**: Trend detection and insights
- **Admin Interface**: Management dashboard
- **API Marketplace**: Public API access

## 📝 Development

### Project Structure

```
├── app/
│   ├── components/          # React components
│   ├── api/                # API routes
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main page
├── public/                 # Static assets
├── package.json            # Dependencies
├── next.config.js          # Next.js config
├── tailwind.config.js      # Tailwind config
└── README.md              # Documentation
```

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Create an issue in the repository
- Check the documentation
- Review the code examples

---

**Video-IA.net Tool Scraper MVP** - Demonstrating the future of AI tool analysis and categorization. 