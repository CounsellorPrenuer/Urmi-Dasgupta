import { createClient } from '@sanity/client';

const client = createClient({
    projectId: '8b1oyfam',
    dataset: 'production',
    apiVersion: '2024-01-24',
    useCdn: false
});

async function checkPosts() {
    try {
        const posts = await client.fetch(`
            *[_type == "post"] {
                _id,
                title,
                mainImage {
                    asset->{
                        _id,
                        url
                    },
                    alt
                }
            }
        `);
        console.log('Blog posts in Sanity:');
        console.log(JSON.stringify(posts, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

checkPosts();
