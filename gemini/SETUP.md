# Environment Setup

## API Key Configuration

1. Copy the template files:
   ```bash
   cp src/environments/environment.template.ts src/environments/environment.ts
   cp src/environments/environment.prod.template.ts src/environments/environment.prod.ts
   ```

2. Get your Gemini API key from: https://aistudio.google.com/app/apikey

3. Replace `'YOUR_API_KEY_HERE'` in both files with your actual API key

4. Never commit the actual environment files (they're in .gitignore)
