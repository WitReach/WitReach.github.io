# Wit Reach Website

A modern, responsive static website for Wit Reach, an EdTech and Tech Solution Company. This website is designed to be hosted on GitHub Pages.

## Features

- Modern, responsive design using Tailwind CSS
- Mobile-first approach
- Smooth animations and transitions
- SEO-friendly structure
- Fast loading times
- Accessible design

## Pages

- Home: Introduction and overview of Wit Reach
- Projects: Showcase of open-source projects
- Contact: Support portal integration
- Blog: External blog link

## Tech Stack

- HTML5
- CSS3 (with Tailwind CSS)
- JavaScript (Vanilla)
- Font Awesome Icons

## Getting Started

### Prerequisites

- A GitHub account
- Basic knowledge of HTML, CSS, and JavaScript

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/WitReach/witreach.github.io.git
   ```

2. Navigate to the project directory:
   ```bash
   cd witreach.github.io
   ```

### Customization

1. Update the content in HTML files:
   - `index.html`: Home page content
   - `projects.html`: Project listings
   - `contact.html`: Contact information

2. Modify styles:
   - Edit `styles.css` for custom styles
   - Update Tailwind classes in HTML files

3. Update JavaScript functionality:
   - Modify `main.js` for custom interactions
   - Add new features as needed

### Hosting on GitHub Pages

1. Create a new repository named `witreach.github.io`
2. Push your code to the repository:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```
3. Go to repository settings
4. Under "GitHub Pages" section:
   - Select the main branch as source
   - Save the settings

Your site will be live at `https://witreach.github.io`

## Customization Guide

### Adding New Projects

1. Open `projects.html`
2. Copy the project card template:
   ```html
   <div class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition duration-300">
       <div class="p-6">
           <div class="text-indigo-600 text-3xl mb-4">
               <i class="fas fa-code"></i>
           </div>
           <h3 class="text-xl font-semibold mb-2">Project Name</h3>
           <p class="text-gray-600 mb-4">Project description</p>
           <div class="flex space-x-4">
               <a href="#" class="text-indigo-600 hover:text-indigo-800">
                   <i class="fab fa-github"></i> View on GitHub
               </a>
               <a href="#" class="text-indigo-600 hover:text-indigo-800">
                   <i class="fas fa-file-alt"></i> README
               </a>
           </div>
       </div>
   </div>
   ```
3. Update the content and links

### Modifying Styles

1. Global styles: Edit `styles.css`
2. Component-specific styles: Use Tailwind classes in HTML
3. Custom animations: Add new keyframes in `styles.css`

### Adding New Pages

1. Create a new HTML file
2. Copy the basic structure from existing pages
3. Update the content and navigation
4. Add the page link to the navigation menu

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, visit our [support portal](https://witreach.freshworks.com/support) or create an issue in this repository. 