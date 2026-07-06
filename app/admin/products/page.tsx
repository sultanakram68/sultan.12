"use client";

import React, { useEffect, useState, useRef } from "react";
import { db, storage } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore";
import { ref, deleteObject, uploadBytes, getDownloadURL } from "firebase/storage";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Search, X, CheckCircle2, AlertTriangle, Image as ImageIcon, Save, Package } from "lucide-react";

export interface GalleryImage {
  url: string;
  overlayText?: string;
  overlayColor?: string;
  overlaySize?: "sm" | "md" | "lg" | "xl";
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: string | number;
  originalPrice?: string | number;
  imageUrl: string;
  gallery?: GalleryImage[];
  isFeatured?: boolean;
}

export default function ProductsAdmin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast / Modal State
  const [toast, setToast] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({show: false, message: '', type: 'success'});
  const [deleteModal, setDeleteModal] = useState<{show: boolean, id: string | null}>({show: false, id: null});

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

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
      showToast("فشل جلب المنتجات", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast("حجم الصورة كبير جداً. يرجى اختيار صورة أصغر من 2 ميجابايت.", "error");
      return;
    }

    setIsUploading(true);
    setUploadProgress(30);

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadProgress(80);
        if (event.target?.result) {
          setFormData({ ...formData, imageUrl: event.target.result as string });
          setUploadProgress(100);
          showToast("تم إضافة الصورة بنجاح!");
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error("Error processing image:", error);
      alert("خطأ أثناء معالجة الصورة: " + (error.message || JSON.stringify(error)));
      showToast("حدث خطأ أثناء معالجة الصورة", "error");
      setIsUploading(false);
    }
  };

  const removeCurrentImage = async () => {
    if (!formData.imageUrl) return;
    
    if (formData.imageUrl.includes("firebasestorage.googleapis.com")) {
      try {
        const imageRef = ref(storage, formData.imageUrl);
        await deleteObject(imageRef);
      } catch (error) {
        console.log("Image might already be deleted", error);
      }
    }
    
    setFormData({ ...formData, imageUrl: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast("حجم الصورة كبير جداً. يرجى اختيار صورة أصغر من 2 ميجابايت.", "error");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const currentGallery = formData.gallery || [];
          setFormData({ 
            ...formData, 
            gallery: [...currentGallery, { 
              url: event.target.result as string, 
              overlayText: "", 
              overlayColor: "#ffffff", 
              overlaySize: "md" 
            }] 
          });
          showToast("تم إضافة الصورة للمعرض بنجاح!");
        }
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      showToast("حدث خطأ أثناء معالجة الصورة", "error");
    }
  };

  const removeGalleryImage = (index: number) => {
    if (!formData.gallery) return;
    const newGallery = [...formData.gallery];
    newGallery.splice(index, 1);
    setFormData({ ...formData, gallery: newGallery });
  };

  const updateGalleryImage = (index: number, field: keyof GalleryImage, value: string) => {
    if (!formData.gallery) return;
    const newGallery = [...formData.gallery];
    newGallery[index] = { ...newGallery[index], [field]: value };
    setFormData({ ...formData, gallery: newGallery });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      showToast("يرجى إدخال اسم وسعر المنتج", "error");
      return;
    }
    
    try {
      const docId = editingId || `prod_${Date.now()}`;
      await setDoc(doc(db, "products", docId), {
        name: formData.name,
        description: formData.description || "",
        price: formData.price,
        originalPrice: formData.originalPrice || "",
        imageUrl: formData.imageUrl || "",
        gallery: formData.gallery || [],
        isFeatured: formData.isFeatured || false
      });
      
      showToast(editingId ? "تم تحديث المنتج بنجاح!" : "تم إضافة المنتج بنجاح!");
      setEditingId(null);
      setFormData({});
      setIsFormOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Error saving product", error);
      showToast("حدث خطأ أثناء حفظ المنتج", "error");
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await deleteDoc(doc(db, "products", deleteModal.id));
      showToast("تم حذف المنتج بنجاح!");
      setDeleteModal({ show: false, id: null });
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product", error);
      showToast("حدث خطأ أثناء الحذف", "error");
    }
  };

  const filteredProducts = products.filter(p => {
    const q = searchQuery.toLowerCase();
    const nameMatch = p.name?.toLowerCase().includes(q) || false;
    const descMatch = p.description?.toLowerCase().includes(q) || false;
    return nameMatch || descMatch;
  });

  return (
    <div className="space-y-6 relative">
      
      {/* Toast Notification (Vercel Style) */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl"
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-500" />
            )}
            <span className="font-medium text-sm text-zinc-100">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModal.show && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteModal({show: false, id: null})} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-zinc-950 border border-zinc-800 p-6 rounded-xl shadow-2xl relative z-10 max-w-sm w-full">
              <h3 className="text-lg font-bold text-zinc-100 mb-2">تأكيد الحذف</h3>
              <p className="text-zinc-400 text-sm mb-6 leading-relaxed">هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء، وسيتم إزالته من الموقع فوراً.</p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setDeleteModal({show: false, id: null})} className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-md text-sm font-medium transition-colors border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-700">إلغاء</button>
                <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500">حذف المنتج</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/50 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight mb-1">إدارة المنتجات</h1>
          <p className="text-zinc-500 text-sm">أضف، عدّل، واحذف منتجات وخدمات سلطان موبايل.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="البحث..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56 bg-zinc-900/50 border border-zinc-800 rounded-md pr-9 pl-4 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all shadow-inner"
            />
          </div>
          <button 
            onClick={() => { setFormData({}); setEditingId(null); setIsFormOpen(true); }}
            className="flex items-center gap-2 bg-zinc-100 hover:bg-white text-zinc-900 px-4 py-1.5 rounded-md text-sm font-semibold transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-500 active:scale-95"
          >
            <Plus size={16} />
            منتج جديد
          </button>
        </div>
      </div>

      {/* Product Form - Minimalist Panel */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-6 relative my-6">
              <button onClick={() => setIsFormOpen(false)} className="absolute top-6 left-6 p-1 text-zinc-500 hover:text-zinc-200 bg-zinc-800/50 hover:bg-zinc-700 rounded-md transition-colors focus:outline-none">
                <X size={16} />
              </button>
              
              <h2 className="text-lg font-bold text-zinc-100 mb-6 border-b border-zinc-800/50 pb-4">
                {editingId ? "تعديل المنتج" : "إضافة منتج جديد"}
              </h2>
              
              <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">اسم المنتج <span className="text-red-500">*</span></label>
                    <input type="text" required value={formData.name || ""} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2.5 text-sm text-zinc-100 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-colors shadow-inner" placeholder="مثال: سماعة ابل ايربودز برو" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">السعر بعد الخصم (الحالي) <span className="text-red-500">*</span></label>
                    <input type="text" required value={formData.price || ""} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2.5 text-sm text-zinc-100 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-colors shadow-inner" placeholder="مثال: 250 ليرة" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">السعر قبل الخصم (اختياري)</label>
                    <input type="text" value={formData.originalPrice || ""} onChange={e => setFormData({...formData, originalPrice: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2.5 text-sm text-zinc-100 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-colors shadow-inner" placeholder="مثال: 300 ليرة" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">الوصف (اختياري)</label>
                    <textarea value={formData.description || ""} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2.5 text-sm text-zinc-100 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-colors shadow-inner resize-none" placeholder="وصف تفصيلي للمنتج..." />
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">صورة المنتج</label>
                    <div className="bg-zinc-950 border border-zinc-800 rounded-md p-4 flex flex-col items-center justify-center relative overflow-hidden group min-h-[160px]">
                      {formData.imageUrl ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={formData.imageUrl} alt="Preview" className="w-full h-32 object-contain" />
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                            <button type="button" onClick={removeCurrentImage} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors">
                              <Trash2 size={14} /> حذف الصورة
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-8 h-8 text-zinc-700 mb-3" />
                          <p className="text-xs text-zinc-500 font-medium mb-3">اسحب وأفلت أو انقر للرفع</p>
                          <input type="file" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} disabled={isUploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                          {isUploading && (
                            <div className="absolute inset-0 bg-zinc-950/90 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                              <div className="w-3/4 bg-zinc-800 rounded-full h-1.5 overflow-hidden mb-2">
                                <div className="bg-zinc-200 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                              </div>
                              <span className="text-zinc-300 text-[10px] font-bold">{uploadProgress}%</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">أو رابط جاهز للصورة</label>
                    <input type="text" dir="ltr" value={formData.imageUrl || ""} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-md p-2.5 text-sm text-zinc-100 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-colors shadow-inner font-mono" placeholder="https://..." />
                  </div>
                </div>

                <div className="md:col-span-2 border-t border-zinc-800/50 pt-5">
                  <label className="block text-xs font-semibold text-zinc-400 mb-3 uppercase tracking-wider">معرض الصور الإضافية (اختياري)</label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {formData.gallery && formData.gallery.map((img, idx) => (
                      <div key={idx} className="bg-zinc-950 border border-zinc-800 rounded-md p-3 relative group">
                        <button type="button" onClick={() => removeGalleryImage(idx)} className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-md z-10 transition-colors">
                          <Trash2 size={12} />
                        </button>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img.url} alt={`Gallery ${idx}`} className="w-full h-32 object-cover rounded-md mb-3" />
                        
                        <div className="space-y-2">
                          <input type="text" placeholder="النص على الصورة..." value={img.overlayText || ""} onChange={(e) => updateGalleryImage(idx, "overlayText", e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2 text-xs text-zinc-100 focus:border-zinc-600 focus:ring-1" />
                          <div className="flex gap-2">
                            <input type="color" value={img.overlayColor || "#ffffff"} onChange={(e) => updateGalleryImage(idx, "overlayColor", e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-zinc-900 border border-zinc-800 p-0.5" title="لون النص" />
                            <select value={img.overlaySize || "md"} onChange={(e) => updateGalleryImage(idx, "overlaySize", e.target.value)} className="flex-1 bg-zinc-900 border border-zinc-800 rounded-md p-1.5 text-xs text-zinc-100 focus:border-zinc-600 focus:ring-1">
                              <option value="sm">خط صغير</option>
                              <option value="md">خط متوسط</option>
                              <option value="lg">خط كبير</option>
                              <option value="xl">خط ضخم</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="bg-zinc-950 border border-zinc-800 border-dashed rounded-md p-4 flex flex-col items-center justify-center relative min-h-[160px] hover:border-zinc-600 hover:bg-zinc-900/50 transition-colors cursor-pointer">
                      <Plus className="w-8 h-8 text-zinc-600 mb-2" />
                      <span className="text-xs text-zinc-500 font-medium">إضافة صورة جديدة للمعرض</span>
                      <input type="file" accept="image/*" onChange={handleGalleryUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2 border-t border-zinc-800/50 pt-5 flex justify-end gap-3">
                  <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-md text-sm font-medium transition-colors border border-zinc-800">
                    إلغاء
                  </button>
                  <button type="submit" className="flex items-center gap-2 bg-zinc-100 hover:bg-white text-zinc-900 px-5 py-2 rounded-md text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-zinc-500 active:scale-95">
                    <Save size={16} />
                    حفظ المنتج
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products List */}
      {filteredProducts.length === 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-16 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-zinc-950 border border-zinc-800 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <Package className="w-8 h-8 text-zinc-600" />
          </div>
          <h3 className="text-lg font-bold text-zinc-200 mb-1">لا توجد منتجات</h3>
          <p className="text-zinc-500 text-sm max-w-md mx-auto">لم يتم العثور على أي منتجات مطابقة لبحثك، أو لم تقم بإضافة منتجات بعد. قم بإضافة منتجك الأول لتبدأ.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={product.id} 
              className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl overflow-hidden group hover:border-zinc-700 transition-colors flex flex-col"
            >
              <div className="h-40 bg-zinc-950 relative flex items-center justify-center p-4 border-b border-zinc-800/50">
                {product.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={product.imageUrl} alt={product.name} className="max-w-full max-h-full object-contain" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-zinc-800" />
                )}
                <div className="absolute top-2 left-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setFormData(product); setEditingId(product.id); setIsFormOpen(true); window.scrollTo({top: 0, behavior: 'smooth'}); }} className="w-7 h-7 bg-zinc-800 text-zinc-300 rounded-md flex items-center justify-center shadow-sm hover:bg-zinc-700 hover:text-white transition-colors border border-zinc-700">
                    <Edit2 size={12} />
                  </button>
                  <button onClick={() => setDeleteModal({show: true, id: product.id})} className="w-7 h-7 bg-red-500/10 text-red-500 rounded-md flex items-center justify-center shadow-sm hover:bg-red-500 hover:text-white transition-colors border border-red-500/20">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="text-sm font-semibold text-zinc-200 mb-1 truncate" title={product.name}>{product.name}</h3>
                <div className="text-zinc-400 text-xs font-mono mb-2">{product.price}</div>
                {product.description && (
                  <p className="text-[11px] text-zinc-600 line-clamp-2 leading-relaxed mt-auto">{product.description}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
