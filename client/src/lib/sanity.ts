import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

export const sanityClient = createClient({
    projectId: "8b1oyfam",
    dataset: "production",
    apiVersion: "2024-01-24", // use current date
    useCdn: true, // true for production, false for development
});

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: any) {
    return builder.image(source);
}

// Helper to fetch data with safe fallbacks
export async function fetchSanityContent(query: string) {
    try {
        const data = await sanityClient.fetch(query);
        return data;
    } catch (error) {
        console.warn("Error fetching data from Sanity:", error);
        return null;
    }
}
