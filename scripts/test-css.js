const http = require('http');

http.get('http://localhost:3000/sign-in', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const match = data.match(/href="(\/_next\/static\/[^"]+\.css)"/);
    if (match) {
      const cssUrl = 'http://localhost:3000' + match[1];
      console.log('Found CSS URL:', cssUrl);
      http.get(cssUrl, (cssRes) => {
        let cssData = '';
        cssRes.on('data', chunk => cssData += chunk);
        cssRes.on('end', () => {
          console.log('CSS length:', cssData.length);
          console.log('Contains background color:', cssData.includes('bg-[#F9F7F2]'));
          console.log('Contains Tailwind preflight (e.g. text-size-adjust):', cssData.includes('text-size-adjust'));
          if (cssData.length < 1000) {
            console.log('CSS snippet:', cssData.substring(0, 500));
          }
        });
      });
    } else {
      console.log('No CSS URL found in HTML.');
    }
  });
}).on('error', err => {
  console.log('Error: ', err.message);
});
