# Looksmaxxer - AI Facial Analysis & Aesthetic Optimization

A cutting-edge web application that uses advanced facial recognition and biometric analysis to provide personalized looksmaxxing recommendations with affiliate product suggestions.

## Features

### 🎯 Core Functionality
- **Real-time Webcam Facial Scanning** - Multi-angle face capture using MediaPipe
- **Advanced Biometric Analysis** - Calculates key facial metrics including:
  - Gonial Sharpness (Jawline Definition)
  - Mandibular Plane Angle
  - Orbital Vector (Canthal Tilt)
  - Face Width-to-Height Ratio (fWHR)
  - Midface Ratio
  - Skin Quality Assessment

### 📊 Analysis Features
- **3D Face Mesh Visualization** - Real-time 3D landmark rendering with React Three Fiber
- **Comprehensive Scoring System** - 0-100 scores for each facial metric
- **Baseline Demographic Comparison** - Type-based ideal metric comparisons
- **Multi-angle Data Fusion** - Combines multiple scan angles for accuracy

### 💰 Monetization
- **Personalized Product Recommendations** - AI-driven suggestions based on facial analysis
- **Affiliate Integration** - Amazon affiliate links for:
  - Jaw exercisers (Jawzrsize)
  - Skincare products (retinol, peptides, hyaluronic acid)
  - Teeth whitening kits
  - Facial massage tools (Gua Sha, ice rollers)
  - Mewing trainers
  - LED therapy masks
  - Microneedling tools
  - Professional sunscreens

## Tech Stack

- **Frontend Framework**: Next.js 14 (React 18)
- **Face Detection**: MediaPipe Tasks Vision
- **3D Visualization**: React Three Fiber + Three.js
- **Animations**: Framer Motion + GSAP
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Language**: TypeScript

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Webcam access

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd looksmaxxer

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## How It Works

1. **Camera Initialization** - User grants webcam permission
2. **Face Detection** - MediaPipe detects 478 facial landmarks in real-time
3. **Multi-angle Capture** - Scans front, left, and right angles for comprehensive analysis
4. **Metric Calculation** - Algorithms compute facial ratios and scores
5. **Results Display** - Visual dashboard shows scores and actual measurements
6. **Product Recommendations** - AI suggests products based on areas needing improvement

## Facial Metrics Explained

### Gonial Sharpness
Measures jawline definition and mandibular angle. Lower scores indicate softer jawline.

### Canthal Tilt (Orbital Vector)
Eye angle measurement. Positive tilt is generally considered more aesthetic.

### fWHR (Face Width-to-Height Ratio)
Proportion of facial width to height. Affects perceived masculinity/femininity.

### Midface Ratio
Balance between eye area and mouth area. Affects facial harmony.

### Skin Quality
Surface texture analysis based on landmark stability and distribution.

## Monetization Strategy

The app generates revenue through:
1. **Amazon Affiliate Links** - Commission on product purchases
2. **Targeted Recommendations** - Higher conversion through personalized suggestions
3. **Premium Products** - Focus on higher-ticket items (LED masks, professional tools)

## Privacy & Security

- ✅ **On-device Processing** - All analysis happens in browser
- ✅ **No Data Upload** - No facial data sent to servers
- ✅ **No Storage** - Images not saved after analysis
- ✅ **GDPR Compliant** - Privacy-first architecture

## Customization

### Adding New Products

Edit `components/affiliate/AffiliateRecommendations.tsx`:

```typescript
products.push({
  title: 'Your Product Name',
  description: 'Product description',
  reason: `Metric Score: ${score}/100`,
  affiliateLink: 'https://your-affiliate-link',
  priority: 1, // Lower = higher priority
});
```

### Affiliate Link Setup

Replace placeholder links with your actual affiliate IDs:
- Amazon Associates: Sign up at https://affiliate-program.amazon.com
- Format: `https://amzn.to/your-custom-short-link`

### Modifying Metrics

Edit calculation functions in `lib/calculations.ts`:
- `calculateCanthalTilt()`
- `calculateFwhr()`
- `calculateMidfaceRatio()`
- `calculateJawlineDefinition()`

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Alternative Platforms
- Netlify
- AWS Amplify
- Google Cloud Run
- DigitalOcean App Platform

## Performance Optimization

- MediaPipe WASM files loaded from CDN
- Lazy loading for 3D components
- Optimized landmark processing
- Efficient state management with Zustand

## Browser Compatibility

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari 14+
- ⚠️ Mobile browsers (limited MediaPipe support)

## Future Enhancements

- [ ] Backend API for data analytics
- [ ] User accounts and history tracking
- [ ] Before/after photo comparisons
- [ ] AI-powered skincare routine generator
- [ ] Integration with more affiliate networks
- [ ] Mobile app version
- [ ] Advanced facial symmetry analysis
- [ ] Age estimation
- [ ] Ethnicity-specific baselines

## License

MIT License - feel free to use commercially

## Contributing

Contributions welcome! Please open an issue or PR.

## Support

For issues or questions, open a GitHub issue.

## Disclaimer

This tool provides entertainment and informational purposes only. Results should not be considered medical advice. Consult healthcare professionals for cosmetic procedures.

---

Built with ❤️ using Next.js and MediaPipe
