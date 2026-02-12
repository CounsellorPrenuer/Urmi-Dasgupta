const projectId = '8b1oyfam';
const dataset = 'production';
const query = encodeURIComponent(`*[_type == "siteSettings"][0]{
  videoLogo {
    asset->{
      url
    }
  }
}`);
const url = `https://${projectId}.api.sanity.io/v2024-01-24/data/query/${dataset}?query=${query}`;

async function debug() {
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

debug();
