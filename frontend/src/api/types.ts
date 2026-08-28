export interface Product { id: string; name: string; price: number; category: string; shortDesc: string; fullDesc: string; image: string; status: "active" | "inactive"; createdAt: string; updatedAt: string; }
export interface Service { id: string; name: string; description: string; fullDesc: string; image: string; forWhom: string; benefits: string[]; status: "active" | "inactive"; createdAt: string; updatedAt: string; }
export interface Event { id: string; title: string; date: string; location: string; shortDesc: string; fullDesc: string; image: string; status: "upcoming" | "past"; createdAt: string; updatedAt: string; }
export interface Category { id: string; name: string; type: "product" | "service"; }
export interface SiteContent { heroHeadline: string; heroSubtext: string; aboutIntro: string; mission: string; phone: string; email: string; instagram: string; address: string; }
export interface ContactMessage { id: string; name: string; phone: string; message: string; createdAt: string; }
export interface Admin { id: string; name: string; email: string; role: string; }
