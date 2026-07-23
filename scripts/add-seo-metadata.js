const fs = require('fs');

const domain = 'https://www.grandeurconsulting.in';

const pageConfig = {
  'index.html': {
    title: 'Grandeur SSCBS | Premier Consulting & Knowledge Cell',
    desc: 'Grandeur is the premier Consulting & Knowledge Cell of Shaheed Sukhdev College of Business Studies (SSCBS), University of Delhi. We bridge academic theory and corporate practice.',
    path: '/'
  },
  'about-us.html': {
    title: 'About Us | Grandeur SSCBS',
    desc: 'Discover the mission, leadership, faculty, and core pillars of Grandeur — The Consulting & Knowledge Cell of SSCBS, University of Delhi.',
    path: '/about-us.html'
  },
  'what-we-do.html': {
    title: 'What We Do | Grandeur SSCBS',
    desc: 'Explore client consulting, research primers, case competitions, and knowledge initiatives by Grandeur SSCBS.',
    path: '/what-we-do.html'
  },
  'knowledge-hub.html': {
    title: 'Knowledge Hub | Grandeur SSCBS',
    desc: 'Access industry primers, consulting reports, market insights, and case studies published by Grandeur SSCBS.',
    path: '/knowledge-hub.html'
  },
  'achievements.html': {
    title: 'Achievements | Grandeur SSCBS',
    desc: 'Explore competitive achievements and case competition victories by Grandeur SSCBS across national and international forums.',
    path: '/achievements.html'
  },
  'team.html': {
    title: 'Our Team | Grandeur SSCBS',
    desc: 'Meet the executive board and members behind Grandeur SSCBS driving consulting, research, and corporate outreach.',
    path: '/team.html'
  },
  'alumni.html': {
    title: 'Alumni Network | Grandeur SSCBS',
    desc: 'Discover the distinguished alumni of Grandeur SSCBS working across MBB consulting firms, top tech, and leading global institutions.',
    path: '/alumni.html'
  },
  'contact-us.html': {
    title: 'Contact Us | Grandeur SSCBS',
    desc: 'Get in touch with Grandeur SSCBS for corporate consulting engagements, collaborations, and inquiries.',
    path: '/contact-us.html'
  },
  'join-us.html': {
    title: 'Join Grandeur | SSCBS Recruitment',
    desc: 'Apply for recruitment at Grandeur SSCBS. Join the premier consulting and knowledge society of SSCBS.',
    path: '/join-us.html'
  },
  'apply.html': {
    title: 'Apply Now | Grandeur SSCBS Recruitment',
    desc: 'Submit your recruitment application for Grandeur SSCBS.',
    path: '/apply.html'
  }
};

const jsonLdOrg = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": "Grandeur SSCBS",
  "alternateName": "Grandeur - The Consulting & Knowledge Cell of SSCBS",
  "url": "https://www.grandeurconsulting.in",
  "logo": "https://www.grandeurconsulting.in/logo.png",
  "sameAs": [
    "https://www.linkedin.com/company/grandeur-sscbs/",
    "https://www.instagram.com/grandeur_sscbs/"
  ],
  "parentOrganization": {
    "@type": "CollegeOrUniversity",
    "name": "Shaheed Sukhdev College of Business Studies, University of Delhi"
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "PSP Area 4, Dr. KN Katju Marg, Sector 16, Rohini",
    "addressLocality": "New Delhi",
    "addressRegion": "Delhi",
    "postalCode": "110089",
    "addressCountry": "IN"
  }
};

Object.entries(pageConfig).forEach(([file, meta]) => {
  if (!fs.existsSync(file)) return;
  let html = fs.readFileSync(file, 'utf8');

  // Update Title
  html = html.replace(/<title>.*?<\/title>/i, `<title>${meta.title}</title>`);

  // Remove existing meta description / OG tags to ensure clean injection
  html = html.replace(/<meta name="description"[^>]*>\n?/gi, '');
  html = html.replace(/<link rel="canonical"[^>]*>\n?/gi, '');
  html = html.replace(/<meta property="og:[^>]*>\n?/gi, '');
  html = html.replace(/<meta name="twitter:[^>]*>\n?/gi, '');

  const pageUrl = `${domain}${meta.path}`;
  const ogImgUrl = `${domain}/og-image.png`;

  const seoBlock = `    <meta name="description" content="${meta.desc}">
    <link rel="canonical" href="${pageUrl}">

    <!-- Open Graph / Facebook / WhatsApp -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${pageUrl}">
    <meta property="og:title" content="${meta.title}">
    <meta property="og:description" content="${meta.desc}">
    <meta property="og:image" content="${ogImgUrl}">
    <meta property="og:site_name" content="Grandeur SSCBS">

    <!-- Twitter Cards -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${pageUrl}">
    <meta name="twitter:title" content="${meta.title}">
    <meta name="twitter:description" content="${meta.desc}">
    <meta name="twitter:image" content="${ogImgUrl}">`;

  if (file === 'index.html') {
    const jsonLdScript = `\n    <!-- Schema.org JSON-LD -->\n    <script type="application/ld+json">\n${JSON.stringify(jsonLdOrg, null, 4)}\n    </script>`;
    html = html.replace(/<!-- Favicon -->/i, `${seoBlock}\n${jsonLdScript}\n\n    <!-- Favicon -->`);
  } else {
    html = html.replace(/<!-- Favicon -->/i, `${seoBlock}\n\n    <!-- Favicon -->`);
  }

  fs.writeFileSync(file, html, 'utf8');
  console.log(`Updated SEO metadata in ${file}`);
});

// Update admin.html to have noindex
if (fs.existsSync('admin.html')) {
  let adminHtml = fs.readFileSync('admin.html', 'utf8');
  if (!adminHtml.includes('noindex')) {
    adminHtml = adminHtml.replace(/<head>/i, '<head>\n    <meta name="robots" content="noindex, nofollow">');
    fs.writeFileSync('admin.html', adminHtml, 'utf8');
    console.log('Added noindex to admin.html');
  }
}
