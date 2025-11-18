export interface Business {
  id: string;
  name: string;
  category: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  image: string;
  featured: boolean;
}

export interface NewsArticle {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  image: string;
  featured: boolean;
}

export type Category = {
  id: string;
  name: string;
  description: string;
  icon: string;
};
