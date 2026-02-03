# Demo Public School Website 🏫

A modern, premium, and highly user-friendly school website built with Next.js 14, Tailwind CSS, and Framer Motion.

## ✨ Features

### 🎨 Design Highlights
- **Clean, Modern UI**: Premium design with smooth animations and transitions
- **Responsive Design**: Mobile-first approach, works perfectly on all devices
- **Elegant Color Scheme**: Navy blue, white, and gold accent colors for a professional look
- **Smooth Animations**: Powered by Framer Motion for delightful user interactions
- **Optimized Performance**: Fast loading times with Next.js App Router

### 📱 Pages Included

1. **Home Page**
   - Hero section with image slider and gradient overlay
   - Quick statistics (Years, Students, Teachers, Success Rate)
   - About school summary with image
   - Principal's message section
   - Key highlights cards (Faculty, Smart Classrooms, Sports, Education)
   - Latest announcements timeline
   - Photo gallery preview
   - Call-to-action section

2. **About Us**
   - Interactive timeline showing school history
   - Vision & Mission cards
   - Core values with icons
   - Management team profiles

3. **Academics**
   - Class-wise curriculum (Primary, Middle, Secondary, Senior Secondary)
   - Tabbed interface for easy navigation
   - Subject areas with icons
   - Teaching methodology cards
   - Examination system overview

4. **Facilities**
   - Image cards for all facilities:
     - Smart Classrooms
     - Science Laboratories
     - Library
     - Sports Complex
     - Computer Lab
     - Transport
   - Additional amenities (Canteen, Medical, Security, Wi-Fi)
   - Sports & recreation section with emojis

5. **Gallery**
   - Masonry-style image grid
   - Category filters (All, Events, Sports, Functions)
   - Lightbox modal for full-size image viewing
   - Hover animations on images

6. **Notices & Announcements**
   - Important notices highlighted
   - Search functionality
   - Date badges for each notice
   - Clean card-based layout

7. **Contact**
   - Contact information cards (Address, Phone, Email, Hours)
   - Interactive contact form with validation
   - Embedded Google Maps
   - Social media links

### 🎯 Key Components

- **Navbar**: Sticky navigation with dropdown support and mobile menu
- **Footer**: Comprehensive footer with quick links, contact info, and social media
- **Reusable UI Components**: Cards, buttons, sections with consistent styling

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Components**: Shadcn/ui (pre-installed)
- **Language**: JavaScript

## 📂 Project Structure

```
/app
├── app/
│   ├── layout.js                 # Root layout with Navbar & Footer
│   ├── page.js                   # Home page
│   ├── globals.css               # Global styles
│   ├── about/page.js             # About page
│   ├── academics/page.js         # Academics page
│   ├── facilities/page.js        # Facilities page
│   ├── gallery/page.js           # Gallery page
│   ├── notices/page.js           # Notices page
│   └── contact/page.js           # Contact page
├── components/
│   ├── Navbar.jsx                # Navigation component
│   └── Footer.jsx                # Footer component
├── lib/
│   └── data.js                   # Static data constants
└── package.json
```

## 🎨 Design System

### Colors
- **Primary**: Navy Blue (#1e3a8a, #1e40af)
- **Accent**: Amber/Gold (#f59e0b, #d97706)
- **Backgrounds**: White, Gray-50, Blue-50, Amber-50
- **Text**: Gray-900 (headings), Gray-600 (body)

### Typography
- **Headings**: Bold, large sizes (text-4xl to text-6xl)
- **Body**: Regular weight, readable sizes (text-base to text-lg)
- **Font Stack**: System fonts for optimal performance

### Spacing
- Consistent padding and margins using Tailwind's spacing scale
- Generous whitespace for clean, modern look
- Section padding: py-20 (5rem top/bottom)

## 🛠️ Installation & Setup

1. **Install dependencies**
   ```bash
   cd /app
   yarn install
   ```

2. **Run development server**
   ```bash
   yarn dev
   ```

3. **Access the website**
   - Local: http://localhost:3000
   - The website is already running!

## 📝 Customization

### Update School Information
Edit `/app/lib/data.js` to update:
- School name, tagline, contact details
- Announcements and notices
- Gallery images
- Facilities information
- Management team details

### Change Colors
Update Tailwind classes in components or modify `tailwind.config.js`

### Add New Pages
Create new folders under `/app/` following Next.js App Router conventions

## ✅ Features Implemented

- ✅ 7 complete pages with premium design
- ✅ Responsive navigation with mobile menu
- ✅ Smooth scroll and animations
- ✅ Image slider on home page
- ✅ Interactive gallery with lightbox
- ✅ Category filters for gallery
- ✅ Search functionality for notices
- ✅ Contact form with validation
- ✅ Google Maps integration
- ✅ SEO-friendly metadata
- ✅ Accessible design
- ✅ Custom scrollbar styling
- ✅ Hover effects and transitions
- ✅ Social media links

## 🎯 Performance Optimizations

- Image optimization with proper sizes and quality
- Lazy loading for animations (Framer Motion)
- Smooth scroll behavior
- Optimized CSS with Tailwind
- Fast page navigation with Next.js

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🌟 Highlights

- **Modern Design**: Follows latest web design trends
- **User-Friendly**: Easy navigation and clear call-to-actions
- **Professional**: Perfect for educational institutions
- **Maintainable**: Clean code structure and well-organized
- **Scalable**: Easy to add new pages and features

## 📄 License

This project is created for Demo Public School. All rights reserved.

---

**Built with ❤️ using Next.js, Tailwind CSS, and Framer Motion**

For any questions or support, contact: info@demoschool.edu
