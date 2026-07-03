import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join } from 'path';

function generateContributions() {
  try {
    // Fetch all commits formatted as "YYYY-MM-DD|Author Name|Commit Message"
    const logOutput = execSync('git log --format="%ad|%an|%s" --date=short --no-merges', { encoding: 'utf-8' });
    
    const lines = logOutput.trim().split('\n').filter(Boolean);
    
    // Group by Date -> Author -> Commits
    const grouped = {};
    
    for (const line of lines) {
      // Split by first two pipes only in case the message contains a pipe
      const firstPipe = line.indexOf('|');
      const secondPipe = line.indexOf('|', firstPipe + 1);
      
      if (firstPipe === -1 || secondPipe === -1) continue;
      
      const date = line.substring(0, firstPipe).trim();
      const author = line.substring(firstPipe + 1, secondPipe).trim();
      const message = line.substring(secondPipe + 1).trim();
      
      // Skip the auto-update commits themselves to avoid cluttering the log
      if (message === 'Docs: auto-update CONTRIBUTIONS.md') continue;
      
      if (!grouped[date]) {
        grouped[date] = {};
      }
      if (!grouped[date][author]) {
        grouped[date][author] = [];
      }
      grouped[date][author].push(message);
    }
    
    let markdown = `# Project Contributions Log\n\n`;
    markdown += `*Automated summary of git contributions. Updated on every push.*\n\n`;
    
    for (const [date, authors] of Object.entries(grouped)) {
      // Convert 'YYYY-MM-DD' to a more readable format
      const dateObj = new Date(date);
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      const formattedDate = dateObj.toLocaleDateString('en-US', options);
      
      markdown += `## 📅 ${formattedDate}\n`;
      
      for (const [author, messages] of Object.entries(authors)) {
        markdown += `**${author}:**\n`;
        for (const msg of messages) {
          // Capitalize the first letter of the commit message for neatness
          const formattedMsg = msg.charAt(0).toUpperCase() + msg.slice(1);
          markdown += `- ${formattedMsg}\n`;
        }
        markdown += `\n`;
      }
      markdown += `\n`;
    }
    
    const outputPath = join(process.cwd(), 'CONTRIBUTIONS.md');
    writeFileSync(outputPath, markdown, 'utf-8');
    
    console.log('Successfully generated CONTRIBUTIONS.md');
    
  } catch (error) {
    console.error('Error generating contributions log:', error);
    process.exit(1);
  }
}

generateContributions();
