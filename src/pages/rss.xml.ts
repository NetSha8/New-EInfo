import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
    const posts = await getCollection("blog", ({ data }) => !data.draft);
    const sortedPosts = posts.sort(
        (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
    );

    return rss({
        title: "Blog E Informatique",
        description:
            "Articles techniques sur le développement web, l'infrastructure Linux, la cybersécurité défensive et l'optimisation de performances. Par Elian, freelance à Perpignan.",
        site: context.site!.toString(),
        items: sortedPosts.map((post) => ({
            title: post.data.title,
            pubDate: new Date(post.data.date),
            description: post.data.excerpt,
            link: `/blog/${post.slug}/`,
            categories: [post.data.category, ...post.data.tags],
        })),
        customData: `<language>fr-FR</language>`,
    });
}
