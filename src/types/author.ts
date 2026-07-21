export interface AuthorSocial {
  twitter?: string;
  linkedin?: string;
  website?: string;
}

export interface Author {
  id: string;
  slug: string;
  name: string;
  avatar: string;
  title: string;
  bio: string;
  social: AuthorSocial;
}
