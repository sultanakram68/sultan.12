"use client";

import React, { useEffect, useState, useRef } from "react";
import { db, storage } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  isFeatured: boolean;
}

export default function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({});
  
  const [message, setMessage] = useState("");
  
  // Upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState("");

  const fetchProducts = async () => {
    try {
      const snap = await getDocs(collection(db, "products"));
      const fetched: Product[] = [];
      snap.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(fetched);
    } catch (error) {
      console.error("Error fetching products", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // ... (rest remains the same)
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const fileExt = file.name.split('.').pop();
    const fileName = `products/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const storageRef = ref(storage, fileName);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(Math.round(progress));
      },
      (error) => {
        console.error("Upload error:", error);
        alert("حدث خطأ أثناء رفع الصورة.");
        setIsUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setFormData({ ...formData, imageUrl: downloadURL });
        setIsUploading(false);
      }
    );
  };

  const removeCurrentImage = async () => {
    if (!formData.imageUrl) return;
    
    if (formData.imageUrl.includes("firebasestorage.googleapis.com")) {
      try {
        const imageRef = ref(storage, formData.imageUrl);
        await deleteObject(imageRef);
      } catch (error) {
        console.log("Image might already be deleted or outside of our storage bucket.", error);
      }
    }
    
    setFormData({ ...formData, imageUrl: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    
    try {
      const docId = editingId || `prod_${Date.now()}`;
      await setDoc(doc(db, "products", docId), {
        name: formData.name || "",
        description: formData.description || "",
        price: formData.price || "",
        imageUrl: formData.imageUrl || "",
        isFeatured: formData.isFeatured || false
      });
      setMessage("تم حفظ المنتج بنجاح!");
      setEditingId(null);
      setFormData({});
      fetchProducts();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error saving product", error);
      setMessage("حدث خطأ أثناء حفظ المنتج");
    }
  };

  const handleDelete = async (id: string, imageUrl?: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    try {
      if (imageUrl && imageUrl.includes("firebasestorage.googleapis.com")) {
        try {
          const imageRef = ref(storage, imageUrl);
          await deleteObject(imageRef);
        } catch(e) {
          console.log("Could not delete associated image", e);
        }
      }
      
      await deleteDoc(doc(db, "products", id));
      setMessage("تم حذف المنتج");
      fetchProducts();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting product", error);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) return <div className="text-blue-600 font-semibold p-8">جاري تحميل المنتجات...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">إدارة المنتجات والخدمات</h1>
          <p className="text-gray-500">إضافة وتعديل وحذف الأجهزة والخدمات المميزة.</p>
        </div>
        <button 
          onClick={() => { setEditingId(""); setFormData({ isFeatured: false }); }}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm"
        >
          إضافة منتج جديد
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input 
            type="text" 
            placeholder="ابحث عن منتج بالاسم أو الوصف..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-lg p-3 pr-11 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {message && (
        <div className="bg-blue-50 text-blue-700 p-4 rounded-lg mb-6 border border-blue-100 font-medium">
          {message}
        </div>
      )}

      {editingId !== null && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">{editingId === "" ? "إضافة منتج جديد" : "تعديل المنتج"}</h3>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">اسم المنتج</label>
                <input 
                  type="text" 
                  value={formData.name || ""} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  className="w-full bg-white border border-gray-300 rounded-lg p-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">السعر / التسمية</label>
                <input 
                  type="text" 
                  value={formData.price || ""} 
                  onChange={e => setFormData({...formData, price: e.target.value})} 
                  className="w-full bg-white border border-gray-300 rounded-lg p-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">الوصف</label>
              <textarea 
                value={formData.description || ""} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                className="w-full bg-white border border-gray-300 rounded-lg p-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all h-24"
              />
            </div>
            
            <div className="border border-gray-200 rounded-xl p-5 bg-gray-50">
              <label className="block text-xs font-bold text-gray-500 uppercase mb-4">صورة المنتج</label>
              
              {formData.imageUrl ? (
                <div className="mb-4">
                  <div className="relative inline-block border border-gray-200 rounded-lg overflow-hidden bg-white">
                    <img src={formData.imageUrl} alt="Preview" className="h-32 object-contain" />
                    <button 
                      type="button" 
                      onClick={removeCurrentImage}
                      className="absolute top-2 right-2 bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors shadow-md"
                      title="مسح الصورة"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col justify-center">
                  <span className="text-sm font-semibold text-gray-700 mb-2 block">1. رفع صورة من الجهاز</span>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                    disabled={isUploading}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all disabled:opacity-50"
                  />
                  {isUploading && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full transition-all" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                      <p className="text-xs text-blue-600 mt-1 font-bold">جاري الرفع {uploadProgress}%</p>
                    </div>
                  )}
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-col justify-center">
                  <span className="text-sm font-semibold text-gray-700 mb-2 block">2. أو إضافة رابط جاهز من الخارج</span>
                  <input 
                    type="text" 
                    value={formData.imageUrl || ""} 
                    onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    placeholder="https://example.com/image.jpg"
                    dir="ltr"
                    disabled={isUploading}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
              <input 
                type="checkbox" 
                id="isFeatured" 
                checked={formData.isFeatured || false}
                onChange={e => setFormData({...formData, isFeatured: e.target.checked})}
                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="isFeatured" className="text-sm font-semibold text-gray-700 cursor-pointer">إظهار في الأجهزة المميزة بالصفحة الرئيسية</label>
            </div>

            <div className="flex gap-3 pt-6">
              <button type="submit" disabled={isUploading} className="bg-blue-600 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50">
                حفظ المنتج
              </button>
              <button type="button" onClick={() => setEditingId(null)} className="bg-white border border-gray-300 text-gray-700 px-8 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-shadow">
            {product.imageUrl ? (
              <div className="h-52 w-full bg-gray-100 relative border-b border-gray-100">
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                {product.isFeatured && (
                  <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-sm tracking-wide">مميز</div>
                )}
              </div>
            ) : (
              <div className="h-52 w-full bg-gray-50 flex items-center justify-center text-gray-400 font-bold border-b border-gray-100">
                بدون صورة
              </div>
            )}
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-xl font-black text-gray-900 mb-2 leading-tight">{product.name}</h3>
              <p className="text-blue-700 font-black text-base mb-3">{product.price}</p>
              <p className="text-gray-600 font-medium text-sm flex-1 line-clamp-3 leading-relaxed">{product.description}</p>
              
              <div className="flex gap-3 mt-6 pt-5 border-t border-gray-200">
                <button 
                  onClick={() => { setEditingId(product.id); setFormData(product); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className="flex-1 bg-white border-2 border-gray-300 text-gray-800 py-2.5 rounded-lg font-bold hover:bg-gray-100 transition-colors text-sm shadow-sm"
                >
                  تعديل
                </button>
                <button 
                  onClick={() => handleDelete(product.id, product.imageUrl)}
                  className="flex-1 bg-red-50 text-red-700 border-2 border-red-200 py-2.5 rounded-lg font-bold hover:bg-red-100 transition-colors text-sm shadow-sm"
                >
                  حذف
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && !loading && (
          <div className="col-span-full py-16 text-center text-gray-600 bg-white border-2 border-dashed border-gray-300 rounded-xl">
            <p className="font-bold text-lg">لم يتم العثور على منتجات مطابقة للبحث.</p>
          </div>
        )}
      </div>
    </div>
  );
}
