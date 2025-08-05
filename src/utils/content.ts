/**
 * Content generation utilities
 */

import { PricingDetails } from '@/src/types/analysis';

export function generateSlug(toolName: string): string {
  return toolName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function generatePricingSummary(pricingDetails: PricingDetails): string {
  const { model, plans, freeTier, paidPlans, enterpriseAvailable } = pricingDetails;
  
  let summary = `${model} pricing model. `;
  
  if (freeTier) {
    summary += "Free tier available. ";
  }
  
  if (paidPlans && plans.length > 0) {
    const prices = plans.map(p => p.price).filter(p => p && p !== 'Free');
    if (prices.length > 0) {
      summary += `Paid plans start from ${prices[0]}. `;
    }
  }
  
  if (enterpriseAvailable) {
    summary += "Enterprise plans available. ";
  }
  
  summary += "💡 Tip: Start with the free tier to test features, then upgrade based on your needs.";
  
  return summary;
}

export function generateSEODescription(toolName: string, category: string, features: string[], pricingModel: string): string {
  return `
<h2>What is ${toolName}?</h2>
<p>${toolName} is a cutting-edge AI-powered ${category.toLowerCase()} tool designed to revolutionize how professionals and creators work. This innovative platform leverages advanced artificial intelligence to deliver exceptional results, making it the go-to solution for anyone looking to enhance their ${category.toLowerCase()} capabilities.</p>

<h3>Key Features & Capabilities</h3>
<ul>
${features.slice(0, 5).map(feature => `<li>${feature}</li>`).join('\n')}
<li>Advanced AI Algorithms: Superior results through machine learning</li>
<li>User-Friendly Interface: Seamless workflow for all skill levels</li>
<li>Real-Time Processing: Instant feedback and results</li>
<li>Professional Quality: Enterprise-grade output and reliability</li>
</ul>

<h3>Use Cases & Applications</h3>
<p>${toolName} is perfect for content creators, marketing professionals, businesses, and individuals who want to streamline their ${category.toLowerCase()} processes. Whether you're a beginner or an expert, this tool provides the capabilities you need to succeed in today's competitive digital landscape.</p>

<h3>Target Audience & Users</h3>
<p>This powerful tool is designed for content creators, marketing professionals, small businesses, enterprises, and anyone looking to leverage AI technology for enhanced ${category.toLowerCase()} capabilities. With its intuitive interface and powerful features, ${toolName} makes advanced AI technology accessible to users of all skill levels.</p>

<h3>Pricing & Plans</h3>
<p>${toolName} offers a ${pricingModel.toLowerCase()} pricing model that makes advanced AI technology accessible to everyone. Whether you're just starting out or running a large enterprise, there's a plan that fits your needs and budget.</p>

<h3>Why Choose ${toolName}?</h3>
<p>With its advanced AI technology, user-friendly interface, and comprehensive feature set, ${toolName} stands out as the premier choice for ${category.toLowerCase()}. Experience the future of AI-powered tools and transform your workflow today!</p>
  `.trim();
}