// `@sanity/image-url`'s builder works directly off an unresolved
// `{asset: {_ref}}` image object — no need to dereference the asset
// document here, so `coverImage`/`avatar` are projected as-is.
const AUTHOR_PROJECTION = `author->{
  "_id": _id,
  name,
  "slug": slug.current,
  avatar,
  role,
  bio,
  twitter,
  linkedin,
  website
}`;

const POST_FIELDS = `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  coverImage,
  category,
  ${AUTHOR_PROJECTION},
  featured,
  publishedAt,
  _updatedAt,
  body
`;

export const ALL_POSTS_QUERY = `*[_type == "post" && defined(slug.current)] | order(publishedAt desc) [0...$limit] { ${POST_FIELDS} }`;

export const POST_BY_SLUG_QUERY = `*[_type == "post" && slug.current == $slug][0] { ${POST_FIELDS} }`;

export const POSTS_BY_CATEGORY_QUERY = `*[_type == "post" && category == $category] | order(publishedAt desc) [0...$limit] { ${POST_FIELDS} }`;

export const FEATURED_POSTS_QUERY = `*[_type == "post" && featured == true] | order(publishedAt desc) [0...$limit] { ${POST_FIELDS} }`;

export const SEARCH_POSTS_QUERY = `*[_type == "post" && (title match $term || excerpt match $term)] | order(publishedAt desc) [0...$limit] { ${POST_FIELDS} }`;

export const ALL_AUTHORS_QUERY = `*[_type == "author"] {
  "_id": _id,
  name,
  "slug": slug.current,
  avatar,
  role,
  bio,
  twitter,
  linkedin,
  website
}`;
